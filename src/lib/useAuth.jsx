import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, increment, limit, onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseReady } from './firebase';
import { getApprovedCategoriesFromSkills } from './skillToCategoryMap';

const AuthContext = createContext(null);

function getFirstName(fullName) {
  return fullName?.trim().split(/\s+/)[0] || '';
}

function normalizeEmail(value) {
  return (value || '').trim().toLowerCase();
}

function createInvitationToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function validateRequiredSignupInput({ email, password, fullName, role, dateOfBirth, address, parentEmail, googleMode }) {
  const missing = [];
  if (!role) missing.push('account type');

  if (!googleMode) {
    if (!fullName?.trim()) missing.push('full name');
    if (!email?.trim()) missing.push('email');
    if (!password?.trim()) missing.push('password');
  }

  if (role === 'teen') {
    if (!dateOfBirth?.trim()) missing.push('date of birth');
    if (!parentEmail?.trim()) missing.push('parent email');
  }

  if (role === 'neighbor' && !address?.trim()) {
    missing.push('home address');
  }

  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
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

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      setCurrentUser(firebaseUser);
      unsubscribeProfile();

      if (!firebaseUser || !db) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const userRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
        const profileData = snapshot.exists() ? snapshot.data() : null;

        // Backfill legacy records where accountType exists but role was not written.
        if (profileData && !profileData.role && profileData.accountType) {
          setDoc(userRef, { role: profileData.accountType }, { merge: true }).catch(() => {});
          setProfile({ ...profileData, role: profileData.accountType });
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setLoading(false);
      }, (error) => {
        // Keep login usable even if profile read fails.
        setLoading(false);
      });
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  async function signup({ email, password, fullName, role, dateOfBirth, address, parentEmail }) {
    if (!firebaseReady) throw new Error('Firebase is not configured. Set VITE_ env variables first.');

    validateRequiredSignupInput({ email, password, fullName, role, dateOfBirth, address, parentEmail, googleMode: false });

    const normalizedEmail = normalizeEmail(email);
    const normalizedParentEmail = normalizeEmail(parentEmail);
    const trimmedFullName = fullName?.trim();
    const trimmedAddress = address?.trim();

    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const uid = credential.user.uid;
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, { 
      ...getBaseProfile(uid, normalizedEmail, trimmedFullName, role), 
      ...getExtraProfile(role, dateOfBirth, trimmedAddress, normalizedParentEmail) 
    });

    if (role === 'teen') {
      const invitationRef = await addDoc(collection(db, 'invitations'), {
        teenUid: uid,
        teenName: trimmedFullName,
        parentEmail: normalizedParentEmail,
        token: createInvitationToken(),
        status: 'pending',
        parentUid: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        resentAt: null,
        resendCount: 0,
        acceptedAt: null,
        respondedAt: null
      });

      await setDoc(userRef, {
        parentInvitationId: invitationRef.id,
        parentInvitationStatus: 'pending'
      }, { merge: true });
    }
    
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

    validateRequiredSignupInput({
      email: currentUser.email,
      password: 'google-oauth',
      fullName: currentUser.displayName || 'Volunteer',
      role,
      dateOfBirth,
      address,
      parentEmail,
      googleMode: true
    });

    const normalizedEmail = normalizeEmail(currentUser.email);
    const normalizedParentEmail = normalizeEmail(parentEmail);
    const trimmedName = currentUser.displayName?.trim() || 'Volunteer';
    const trimmedAddress = address?.trim();
    const userRef = doc(db, 'users', currentUser.uid);
    
    await setDoc(userRef, { 
      ...getBaseProfile(currentUser.uid, normalizedEmail, trimmedName, role), 
      ...getExtraProfile(role, dateOfBirth, trimmedAddress, normalizedParentEmail) 
    });

    if (role === 'teen') {
      const invitationRef = await addDoc(collection(db, 'invitations'), {
        teenUid: currentUser.uid,
        teenName: trimmedName,
        parentEmail: normalizedParentEmail,
        token: createInvitationToken(),
        status: 'pending',
        parentUid: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        resentAt: null,
        resendCount: 0,
        acceptedAt: null,
        respondedAt: null
      });

      await setDoc(userRef, {
        parentInvitationId: invitationRef.id,
        parentInvitationStatus: 'pending'
      }, { merge: true });
    }
    
    return currentUser;
  }

  async function login(email, password) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Missing required fields: email, password');
    }
    return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  }

  async function acceptParentInvitation(token) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser) throw new Error('Please sign in first.');
    if (!token?.trim()) throw new Error('Missing invitation token.');

    await reload(currentUser);
    if (!currentUser.emailVerified) {
      throw new Error('Please verify your email before accepting this invitation.');
    }

    const parentEmail = normalizeEmail(currentUser.email);
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('token', '==', token.trim().toUpperCase()),
      limit(1)
    );
    const invitationsSnapshot = await getDocs(invitationsQuery);
    if (invitationsSnapshot.empty) {
      throw new Error('Invitation not found.');
    }

    const invitationDoc = invitationsSnapshot.docs[0];
    const invitation = invitationDoc.data();
    if (normalizeEmail(invitation.parentEmail) !== parentEmail) {
      throw new Error('This invitation does not match your email.');
    }

    return acceptParentInvitationById(invitationDoc.id);
  }

  async function acceptParentInvitationById(invitationId) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser) throw new Error('Please sign in first.');

    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationSnapshot = await getDoc(invitationRef);
    if (!invitationSnapshot.exists()) {
      throw new Error('Invitation not found.');
    }
    const invitation = invitationSnapshot.data();
    if (invitation.status !== 'pending') {
      throw new Error('This invitation is no longer pending.');
    }
    if (normalizeEmail(invitation.parentEmail) !== normalizeEmail(currentUser.email)) {
      throw new Error('This invitation does not match your email.');
    }

    const parentRef = doc(db, 'users', currentUser.uid);
    const teenRef = doc(db, 'users', invitation.teenUid);

    await runTransaction(db, async (transaction) => {
      const [parentSnapshot, teenSnapshot, latestInvitationSnapshot] = await Promise.all([
        transaction.get(parentRef),
        transaction.get(teenRef),
        transaction.get(invitationRef)
      ]);

      if (!parentSnapshot.exists() || !teenSnapshot.exists() || !latestInvitationSnapshot.exists()) {
        throw new Error('Unable to complete invitation acceptance.');
      }

      const latestInvitation = latestInvitationSnapshot.data();
      if (latestInvitation.status !== 'pending') {
        throw new Error('This invitation has already been processed.');
      }

      transaction.update(parentRef, { linkedTeenUid: invitation.teenUid });
      transaction.update(teenRef, {
        linkedParentUid: currentUser.uid,
        parentApproved: true,
        parentInvitationStatus: 'accepted'
      });
      transaction.update(invitationRef, {
        status: 'accepted',
        parentUid: currentUser.uid,
        acceptedAt: serverTimestamp(),
        respondedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    return { invitationId, teenUid: invitation.teenUid };
  }

  async function declineParentInvitationById(invitationId) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser) throw new Error('Please sign in first.');

    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationSnapshot = await getDoc(invitationRef);
    if (!invitationSnapshot.exists()) {
      throw new Error('Invitation not found.');
    }
    const invitation = invitationSnapshot.data();
    if (invitation.status !== 'pending') {
      throw new Error('This invitation is no longer pending.');
    }
    if (normalizeEmail(invitation.parentEmail) !== normalizeEmail(currentUser.email)) {
      throw new Error('This invitation does not match your email.');
    }

    await updateDoc(invitationRef, {
      status: 'declined',
      parentUid: currentUser.uid,
      acceptedAt: null,
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return true;
  }

  async function resendParentInvitationRequest() {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser || profile?.role !== 'teen') {
      throw new Error('Only teen accounts can resend parent requests.');
    }

    const normalizedParentEmail = normalizeEmail(profile?.parentEmail);
    if (!normalizedParentEmail) {
      throw new Error('Missing parent email on teen profile.');
    }

    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('teenUid', '==', currentUser.uid),
      where('status', '==', 'pending'),
      limit(1)
    );

    const invitationSnapshot = await getDocs(invitationsQuery);
    if (!invitationSnapshot.empty) {
      const pendingRef = doc(db, 'invitations', invitationSnapshot.docs[0].id);
      await updateDoc(pendingRef, {
        resentAt: serverTimestamp(),
        resendCount: increment(1),
        updatedAt: serverTimestamp()
      });
      return invitationSnapshot.docs[0].id;
    }

    const invitationRef = await addDoc(collection(db, 'invitations'), {
      teenUid: currentUser.uid,
      teenName: profile?.fullName?.trim() || 'Teen',
      parentEmail: normalizedParentEmail,
      token: createInvitationToken(),
      status: 'pending',
      parentUid: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resentAt: serverTimestamp(),
      resendCount: 1,
      acceptedAt: null,
      respondedAt: null
    });

    await setDoc(doc(db, 'users', currentUser.uid), {
      parentInvitationId: invitationRef.id,
      parentInvitationStatus: 'pending'
    }, { merge: true });

    return invitationRef.id;
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
      acceptParentInvitation,
      acceptParentInvitationById,
      declineParentInvitationById,
      resendParentInvitationRequest,
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
