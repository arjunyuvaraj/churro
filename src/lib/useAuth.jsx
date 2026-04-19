import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseReady } from './firebase';
import { getApprovedCategoriesFromSkills } from './skillToCategoryMap';

const AuthContext = createContext(null);

function getFirstName(fullName) {
  return fullName?.trim().split(/\s+/)[0] || '';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return undefined;
    }

    let unsubscribeProfile = () => {};
    let profileLoadingTimeout = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      unsubscribeProfile();
      clearTimeout(profileLoadingTimeout);

      if (!firebaseUser || !db) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
        const profileData = snapshot.exists() ? snapshot.data() : null;
        setProfile(profileData);
        setLoading(false);
      }, (error) => {
        // Handle firestore missing gracefully
        setLoading(false);
      });

      profileLoadingTimeout = setTimeout(() => {
        setLoading(false);
      }, 3000);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
      clearTimeout(profileLoadingTimeout);
    };
  }, []);

  async function signup({ email, password, fullName, role, dateOfBirth, address, parentEmail }) {
    if (!firebaseReady) throw new Error('Firebase is not configured. Set VITE_ env variables first.');

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    
    await setDoc(doc(db, 'users', uid), { 
      ...getBaseProfile(uid, email, fullName, role), 
      ...getExtraProfile(role, dateOfBirth, address, parentEmail) 
    });
    
    return credential.user;
  }

  async function loginWithGoogle() {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    
    const result = await signInWithPopup(auth, googleProvider);
    const uid = result.user.uid;
    
    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { user: result.user, isNewUser: false };
    }
    
    // Return early to let the UI redirect them to complete profile using completeGoogleSignup
    return { user: result.user, isNewUser: true };
  }

  async function completeGoogleSignup({ role, dateOfBirth, address, parentEmail }) {
    if (!currentUser) throw new Error('No Google sign in process active.');
    
    await setDoc(doc(db, 'users', currentUser.uid), { 
      ...getBaseProfile(currentUser.uid, currentUser.email, currentUser.displayName, role), 
      ...getExtraProfile(role, dateOfBirth, address, parentEmail) 
    });
    
    return currentUser;
  }

  async function login(email, password) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (!firebaseReady) return;
    await signOut(auth);
  }

  async function updateTeenSkills(skillIds) {
    if (!firebaseReady || !currentUser) throw new Error('Firebase is not configured or user not authenticated.');

    const approvedCategories = getApprovedCategoriesFromSkills(skillIds);
    const interests = skillIds.map((id) => id.replace(/^[a-z_]+_/, '').replace(/_/g, ' ')).map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userRef,
      {
        skills: skillIds,
        interests,
        approvedCategories,
        surveyCompleted: true,
        surveyCompletedAt: serverTimestamp()
      },
      { merge: true }
    );

    return profile;
  }

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      signup,
      login,
      loginWithGoogle,
      completeGoogleSignup,
      logout,
      updateTeenSkills,
      isAuthenticated: Boolean(currentUser),
      role: profile?.role || null,
      accountType: profile?.accountType || profile?.role || null,
      firstName: profile?.fullName ? getFirstName(profile.fullName) : ''
    }),
    [currentUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function getBaseProfile(uid, email, fullName, role) {
  return {
    uid,
    email,
    fullName: fullName || 'Volunteer',
    role,
    accountType: role,
    createdAt: serverTimestamp(),
    profileComplete: true
  };
}

function getExtraProfile(role, dateOfBirth, address, parentEmail) {
  const isTeen = role === 'teen';
  const isParent = role === 'parent';
  
  if (isTeen) {
    const defaultDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
    // Prevent the standard "Invalid Date / NaN" timezone bug by forcing standard calc
    let age = new Date().getFullYear() - defaultDate.getFullYear();
    
    return {
      dateOfBirth: defaultDate.toISOString().split('T')[0],
      age: Math.max(13, isNaN(age) ? 14 : age), // fallback safety
      linkedParentUid: null,
      parentApproved: false,
      bio: '',
      approvedCategories: [],
      balance: 0,
      completedTasks: 0,
      averageRating: 0,
      volunteerHours: 0,
      badgeIds: ['early_adopter'], 
      parentEmail: parentEmail || ''
    };
  }
  
  if (isParent) {
    return {
      linkedTeenUid: null,
      teenRadiusLimit: 1,
      approvedCategories: [],
      weeklyEarningsCap: null,
      autoApprove: false
    };
  }
  
  return {
    address: address || '',
    verified: true,
    averageRating: 0,
    completedTasks: 0
  };
}
