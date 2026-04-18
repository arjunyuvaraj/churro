import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from './firebase';
import { getApprovedCategoriesFromSkills } from './skillToCategoryMap';

const AuthContext = createContext(null);

function getFirstName(fullName) {
  return fullName.trim().split(/\s+/)[0] || '';
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
    if (!firebaseReady) {
      throw new Error('Firebase is not configured. Set VITE_ env variables first.');
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    const baseProfile = {
      uid,
      email,
      fullName,
      role,
      createdAt: serverTimestamp(),
      profileComplete: false
    };

    const extraProfile =
      role === 'teen'
        ? {
            dateOfBirth,
            age: calculateAge(dateOfBirth),
            linkedParentUid: null,
            parentApproved: false,
            bio: '',
            approvedCategories: [],
            radiusLimit: 1,
            balance: 0,
            totalEarned: 0,
            completedTasks: 0,
            averageRating: 0,
            weeklyEarnings: {},
            parentEmail: parentEmail || ''
          }
        : role === 'parent'
          ? {
              linkedTeenUid: null,
              teenRadiusLimit: 1,
              approvedCategories: [],
              weeklyEarningsCap: null,
              autoApprove: false
            }
          : {
              address,
              verified: false,
              averageRating: 0,
              completedTasks: 0
            };

    await setDoc(doc(db, 'users', uid), { ...baseProfile, ...extraProfile });
    return credential.user;
  }

  async function login(email, password) {
    if (!firebaseReady) {
      throw new Error('Firebase is not configured. Set VITE_ env variables first.');
    }

    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (!firebaseReady) return;
    await signOut(auth);
  }
async function updateTeenSkills(skillIds) {
    if (!firebaseReady || !currentUser) {
      throw new Error('Firebase is not configured or user not authenticated.');
    }

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
      logout,
      updateTeenSkills,
      isAuthenticated: Boolean(currentUser),
      role: profile?.role || null,
      firstName: profile?.fullName ? getFirstName(profile.fullName) : ''
    }),
    [currentUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
