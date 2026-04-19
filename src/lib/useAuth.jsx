import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendPasswordResetEmail,
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
    else if (password.trim().length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
  }

  if (role === 'teen') {
    if (!dateOfBirth?.trim()) missing.push('date of birth');
    else {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 13 || age > 17) {
        throw new Error('Teens must be between 13 and 17 years old.');
      }
    }
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
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // ─── Auth + profile listener ────────────────────────────────────────
  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return undefined;
    }

    let unsubProfile = () => { };

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubProfile();
      setCurrentUser(firebaseUser);

      if (!firebaseUser || !db) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Listen for the Firestore profile in real time.
      // IMPORTANT: we do NOT sign-out here when the doc is missing, because
      // during a signup flow the profile hasn't been written yet and we must
      // keep the auth session alive until completeGoogleSignup / signup finishes.
      const userRef = doc(db, 'users', firebaseUser.uid);
      unsubProfile = onSnapshot(
        userRef,
        (snapshot) => {
          let profileData = snapshot.exists() ? snapshot.data() : null;

          // Backfill legacy records where accountType exists but role was not set.
          if (profileData && !profileData.role && profileData.accountType) {
            setDoc(userRef, { role: profileData.accountType }, { merge: true }).catch(() => { });
            profileData = { ...profileData, role: profileData.accountType };
          }

          setProfile(profileData);
          setLoading(false);
        },
        () => {
          // Firestore read failed – still resolve so the app isn't stuck.
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubProfile();
      unsubAuth();
    };
  }, []);

  // ─── Pending-invitations listener (parent accounts) ─────────────────
  useEffect(() => {
    if (!firebaseReady || !db || !profile?.email || profile?.role !== 'parent') {
      setPendingInvitations([]);
      return undefined;
    }

    const q = query(
      collection(db, 'invitations'),
      where('parentEmail', '==', normalizeEmail(profile.email)),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snap) => {
      setPendingInvitations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => {
      setPendingInvitations([]);
    });
  }, [profile?.email, profile?.role]);

  // ─── Email / password sign-up ────────────────────────────────────────
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
      await createTeenInvitation(uid, trimmedFullName, normalizedParentEmail, userRef);
    }

    return credential.user;
  }

  // ─── Google login (for the LOGIN page) ───────────────────────────────
  // Returns the Firebase user if an account already exists.
  // If the Google account has NO Firestore profile, signs the user out
  // and throws so the Login page can show an error with a link to sign-up.
  async function loginWithGoogle() {
    if (!firebaseReady) throw new Error('Firebase is not configured.');

    const result = await signInWithPopup(auth, googleProvider);
    const snap = await getDoc(doc(db, 'users', result.user.uid));

    if (snap.exists()) {
      return { user: result.user, isNewUser: false };
    }

    // No profile → wrong page. Sign out so the user doesn't get stuck.
    await signOut(auth);
    throw new Error('No account found for this Google account. Please sign up first.');
  }

  // ─── Google signup (for the SIGNUP page) ─────────────────────────────
  // Opens the Google popup. Returns { user, isNewUser }.
  // Does NOT sign-out when profile is missing – the Signup page will
  // collect the remaining fields and call completeGoogleSignup.
  async function signupWithGoogle() {
    if (!firebaseReady) throw new Error('Firebase is not configured.');

    const result = await signInWithPopup(auth, googleProvider);
    const snap = await getDoc(doc(db, 'users', result.user.uid));

    if (snap.exists()) {
      // Already has a profile → they're an existing user.
      return { user: result.user, isNewUser: false };
    }

    // New user – keep them signed-in so completeGoogleSignup works.
    return { user: result.user, isNewUser: true };
  }

  // ─── Finish Google signup after role + fields are collected ──────────
  async function completeGoogleSignup({ role, dateOfBirth, address, parentEmail }) {
    if (!currentUser) throw new Error('No Google sign-in process active.');

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
      await createTeenInvitation(currentUser.uid, trimmedName, normalizedParentEmail, userRef);
    }

    return currentUser;
  }

  // ─── Email / password login ──────────────────────────────────────────
  async function login(email, password) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Missing required fields: email, password');
    }
    return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  }

  // ─── Password reset ─────────────────────────────────────────────────
  async function passwordReset(email) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!email?.trim()) throw new Error('Please enter your email address.');
    await sendPasswordResetEmail(auth, normalizeEmail(email));
  }

  // ─── Parent onboarding ──────────────────────────────────────────────
  async function completeParentOnboarding(prefs = {}) {
    if (!firebaseReady || !currentUser) throw new Error('Not authenticated.');
    if (profile?.role !== 'parent') throw new Error('Only parent accounts can complete onboarding.');

    await setDoc(doc(db, 'users', currentUser.uid), {
      teenRadiusLimit: prefs.teenRadiusLimit ?? 1,
      approvedCategories: prefs.approvedCategories ?? [],
      weeklyEarningsCap: prefs.weeklyEarningsCap ?? null,
      autoApprove: prefs.autoApprove ?? false,
      onboardingComplete: true,
      onboardingCompletedAt: serverTimestamp()
    }, { merge: true });
  }

  // ─── Invitation management ──────────────────────────────────────────
  async function acceptParentInvitation(token) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser) throw new Error('Please sign in first.');
    if (!token?.trim()) throw new Error('Missing invitation token.');

    await reload(currentUser);
    if (!currentUser.emailVerified) {
      throw new Error('Please verify your email before accepting this invitation.');
    }

    const parentEmail = normalizeEmail(currentUser.email);
    const q = query(
      collection(db, 'invitations'),
      where('token', '==', token.trim().toUpperCase()),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Invitation not found.');

    const invDoc = snap.docs[0];
    const inv = invDoc.data();
    if (normalizeEmail(inv.parentEmail) !== parentEmail) {
      throw new Error('This invitation does not match your email.');
    }

    return acceptParentInvitationById(invDoc.id);
  }

  async function acceptParentInvitationById(invitationId) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser) throw new Error('Please sign in first.');

    const invRef = doc(db, 'invitations', invitationId);
    const invSnap = await getDoc(invRef);
    if (!invSnap.exists()) throw new Error('Invitation not found.');
    const inv = invSnap.data();
    if (inv.status !== 'pending') throw new Error('This invitation is no longer pending.');
    if (normalizeEmail(inv.parentEmail) !== normalizeEmail(currentUser.email)) {
      throw new Error('This invitation does not match your email.');
    }

    const parentRef = doc(db, 'users', currentUser.uid);
    const teenRef = doc(db, 'users', inv.teenUid);

    await runTransaction(db, async (tx) => {
      const [pSnap, tSnap, iSnap] = await Promise.all([
        tx.get(parentRef), tx.get(teenRef), tx.get(invRef)
      ]);
      if (!pSnap.exists() || !tSnap.exists() || !iSnap.exists()) {
        throw new Error('Unable to complete invitation acceptance.');
      }
      if (iSnap.data().status !== 'pending') throw new Error('Already processed.');

      tx.update(parentRef, { linkedTeenUid: inv.teenUid });
      tx.update(teenRef, {
        linkedParentUid: currentUser.uid,
        parentApproved: true,
        parentInvitationStatus: 'accepted'
      });
      tx.update(invRef, {
        status: 'accepted',
        parentUid: currentUser.uid,
        acceptedAt: serverTimestamp(),
        respondedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    return { invitationId, teenUid: inv.teenUid };
  }

  async function declineParentInvitationById(invitationId) {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    if (!currentUser) throw new Error('Please sign in first.');

    const invRef = doc(db, 'invitations', invitationId);
    const invSnap = await getDoc(invRef);
    if (!invSnap.exists()) throw new Error('Invitation not found.');
    const inv = invSnap.data();
    if (inv.status !== 'pending') throw new Error('This invitation is no longer pending.');
    if (normalizeEmail(inv.parentEmail) !== normalizeEmail(currentUser.email)) {
      throw new Error('This invitation does not match your email.');
    }

    await updateDoc(invRef, {
      status: 'declined',
      parentUid: currentUser.uid,
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
    if (!normalizedParentEmail) throw new Error('Missing parent email on teen profile.');

    const q = query(
      collection(db, 'invitations'),
      where('teenUid', '==', currentUser.uid),
      where('status', '==', 'pending'),
      limit(1)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const pendingRef = doc(db, 'invitations', snap.docs[0].id);
      await updateDoc(pendingRef, {
        resentAt: serverTimestamp(),
        resendCount: increment(1),
        updatedAt: serverTimestamp()
      });
      return snap.docs[0].id;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const invRef = await addDoc(collection(db, 'invitations'), {
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

    await setDoc(userRef, {
      parentInvitationId: invRef.id,
      parentInvitationStatus: 'pending'
    }, { merge: true });

    return invRef.id;
  }

  // ─── Logout ──────────────────────────────────────────────────────────
  async function logout() {
    if (!firebaseReady) return;
    await signOut(auth);
  }

  // ─── Teen skills ────────────────────────────────────────────────────
  async function updateTeenSkills(skillIds) {
    if (!firebaseReady || !currentUser) throw new Error('Not configured or not authenticated.');

    const approvedCategories = getApprovedCategoriesFromSkills(skillIds);
    const interests = skillIds
      .map((id) => id.replace(/^[a-z_]+_/, '').replace(/_/g, ' '))
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    await setDoc(doc(db, 'users', currentUser.uid), {
      skills: skillIds,
      interests,
      approvedCategories,
      surveyCompleted: true,
      surveyCompletedAt: serverTimestamp()
    }, { merge: true });

    return profile;
  }

  // ─── Derived state ──────────────────────────────────────────────────
  const role = profile?.role || null;
  const hasProfile = Boolean(profile && role);
  const isAuthenticated = Boolean(currentUser && hasProfile);
  const needsProfileSetup = Boolean(currentUser && !hasProfile);
  const needsOnboarding = role === 'parent' && !profile?.onboardingComplete;

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      signup,
      login,
      loginWithGoogle,
      signupWithGoogle,
      completeGoogleSignup,
      logout,
      passwordReset,
      completeParentOnboarding,
      updateTeenSkills,
      acceptParentInvitation,
      acceptParentInvitationById,
      declineParentInvitationById,
      resendParentInvitationRequest,
      pendingInvitations,
      isAuthenticated,
      needsProfileSetup,
      needsOnboarding,
      role,
      accountType: profile?.accountType || role,
      firstName: profile?.fullName ? getFirstName(profile.fullName) : ''
    }),
    [currentUser, profile, loading, pendingInvitations, isAuthenticated, needsProfileSetup, needsOnboarding, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Helpers ────────────────────────────────────────────────────────────

async function createTeenInvitation(uid, teenName, parentEmail, userRef) {
  const invRef = await addDoc(collection(db, 'invitations'), {
    teenUid: uid,
    teenName,
    parentEmail,
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
    parentInvitationId: invRef.id,
    parentInvitationStatus: 'pending'
  }, { merge: true });
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
  if (role === 'teen') {
    const defaultDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
    const now = new Date();
    let age = now.getFullYear() - defaultDate.getFullYear();
    const m = now.getMonth() - defaultDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < defaultDate.getDate())) age--;
    return {
      dateOfBirth: defaultDate.toISOString().split('T')[0],
      age: Math.max(13, isNaN(age) ? 14 : age),
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

  if (role === 'parent') {
    return {
      linkedTeenUid: null,
      teenRadiusLimit: 1,
      approvedCategories: [],
      weeklyEarningsCap: null,
      autoApprove: false,
      onboardingComplete: false
    };
  }

  return {
    address: address || '',
    verified: true,
    averageRating: 0,
    completedTasks: 0
  };
}
