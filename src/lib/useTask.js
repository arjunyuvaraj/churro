import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { db, firebaseReady } from './firebase';

function useFirestoreCollection(path, constraints = [], enabled = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !firebaseReady || !db) {
      setLoading(false);
      setData([]);
      return undefined;
    }

    const ref = query(collection(db, path), ...constraints);
    return onSnapshot(ref, (snapshot) => {
      setData(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      setLoading(false);
    });
  }, [path, constraints, enabled]);

  return { data, loading };
}

export function useTasksForFeed() {
  const constraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  return useFirestoreCollection('tasks', constraints, true);
}

export function useNotifications(uid) {
  const constraints = useMemo(() => (uid ? [where('recipientUid', '==', uid), orderBy('createdAt', 'desc')] : []), [uid]);
  return useFirestoreCollection('notifications', constraints, Boolean(uid));
}

export function useUserTasks(uid, role) {
  const constraints = useMemo(() => {
    if (!uid) {
      return [];
    }

    if (role === 'neighbor') {
      return [where('neighborUid', '==', uid), orderBy('createdAt', 'desc')];
    }
    if (role === 'parent') {
      return [where('applicantTeenUid', '==', uid), orderBy('createdAt', 'desc')];
    }
    if (role === 'teen') {
      return [where('applicantTeenUid', '==', uid), orderBy('createdAt', 'desc')];
    }
    return [orderBy('createdAt', 'desc')];
  }, [uid, role]);

  return useFirestoreCollection('tasks', constraints, Boolean(uid));
}

export function useTaskById(taskId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId || !firebaseReady || !db) {
      setLoading(false);
      setData(null);
      return undefined;
    }

    const taskRef = doc(db, 'tasks', taskId);
    return onSnapshot(taskRef, (snapshot) => {
      setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      setLoading(false);
    });
  }, [taskId]);

  return { data, loading };
}

export function useCompletedTasksByTeen(teenUid) {
  const constraints = useMemo(() => (teenUid ? [where('applicantTeenUid', '==', teenUid), where('status', '==', 'completed'), orderBy('completedAt', 'desc')] : []), [teenUid]);
  return useFirestoreCollection('tasks', constraints, Boolean(teenUid));
}

async function createNotification(notification) {
  if (!notification.recipientUid) return;
  await addDoc(collection(db, 'notifications'), {
    ...notification,
    read: false,
    createdAt: serverTimestamp()
  });
}

export async function applyToTask({ task, teenProfile }) {
  if (!firebaseReady) return;
  const taskRef = doc(db, 'tasks', task.id);

  const existingTasksSnapshot = await getDocs(
    query(
      collection(db, 'tasks'),
      where('applicantTeenUid', '==', teenProfile.uid),
      where('status', 'in', ['active', 'in_progress', 'pending_confirmation'])
    )
  );

  if (!existingTasksSnapshot.empty) {
    throw new Error('You already have an active task.');
  }

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(taskRef);
    if (!snapshot.exists()) throw new Error('Task not found');
    const currentTask = snapshot.data();
    if (currentTask.status !== 'open') throw new Error('Task is no longer open');

    transaction.update(taskRef, {
      applicantTeenUid: teenProfile.uid,
      teenName: teenProfile.fullName?.split(/\s+/)[0] || teenProfile.fullName,
      status: 'pending_parent_approval',
      teenCheckInStatus: 'none'
    });
  });

  await createNotification({
    recipientUid: teenProfile.linkedParentUid,
    type: 'task_applied',
    taskId: task.id,
    message: `${teenProfile.fullName?.split(/\s+/)[0] || 'Your teen'} applied for ${task.title}`
  });
}

export async function updateTaskStatus(taskId, updates) {
  if (!firebaseReady) return;
  await runTransaction(db, async (transaction) => {
    const ref = doc(db, 'tasks', taskId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Task not found');
    transaction.update(ref, updates);
  });
}

export async function parentDecision({ task, approved, parentUid, teenUid }) {
  await runTransaction(db, async (transaction) => {
    const ref = doc(db, 'tasks', task.id);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Task not found');
    const currentTask = snapshot.data();
    if (approved) {
      transaction.update(ref, {
        status: 'active'
      });
    } else {
      transaction.update(ref, {
        status: 'declined'
      });
    }
  });

  await createNotification({
    recipientUid: teenUid,
    type: approved ? 'parent_approved' : 'parent_declined',
    taskId: task.id,
    message: approved ? `Parent approved ${task.title}` : `Parent declined ${task.title}`
  });

  if (approved) {
    await createNotification({
      recipientUid: parentUid,
      type: 'parent_approved',
      taskId: task.id,
      message: `You approved ${task.title}`
    });
  }
}

export async function markTeenCheckIn({ taskId, teenCheckInStatus }) {
  await runTransaction(db, async (transaction) => {
    const ref = doc(db, 'tasks', taskId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Task not found');
    transaction.update(ref, {
      teenCheckInStatus
    });
  });
}

export async function confirmCompletion({ task, teenUid, neighborUid }) {
  await runTransaction(db, async (transaction) => {
    const taskRef = doc(db, 'tasks', task.id);
    const taskSnapshot = await transaction.get(taskRef);
    if (!taskSnapshot.exists()) throw new Error('Task not found');
    const currentTask = taskSnapshot.data();

    transaction.update(taskRef, {
      status: 'completed',
      neighborConfirmed: true,
      completedAt: serverTimestamp()
    });

    const teenRef = doc(db, 'users', teenUid);
    const neighborRef = doc(db, 'users', neighborUid);
    transaction.update(teenRef, {
      balance: increment(task.pay),
      totalEarned: increment(task.pay),
      completedTasks: increment(1)
    });
    transaction.update(neighborRef, {
      completedTasks: increment(1)
    });
  });

  await createNotification({
    recipientUid: teenUid,
    type: 'task_completed',
    taskId: task.id,
    message: `${task.title} was confirmed and your balance was updated`
  });
}

export async function createTask(taskData) {
  await addDoc(collection(db, 'tasks'), {
    ...taskData,
    status: 'open',
    applicantTeenUid: null,
    teenName: null,
    teenRating: null,
    teenCheckInStatus: 'none',
    neighborConfirmed: false,
    createdAt: serverTimestamp(),
    completedAt: null
  });
}

export async function submitRating({ taskId, raterUid, raterRole, ratedUid, stars, comment }) {
  if (!firebaseReady) return;

  const ratingId = `${taskId}_${raterUid}`;
  await setDoc(doc(db, 'ratings', ratingId), {
    taskId,
    raterUid,
    raterRole,
    ratedUid,
    stars,
    comment,
    createdAt: serverTimestamp()
  });

  await runTransaction(db, async (transaction) => {
    const ratedUserRef = doc(db, 'users', ratedUid);
    const ratedSnapshot = await transaction.get(ratedUserRef);
    if (!ratedSnapshot.exists()) return;

    const ratedUser = ratedSnapshot.data();
    const ratingBase = Number(ratedUser.completedTasks || 0);
    const currentAverage = Number(ratedUser.averageRating || 0);
    const nextAverage = ((currentAverage * ratingBase) + stars) / Math.max(ratingBase + 1, 1);

    transaction.update(ratedUserRef, {
      averageRating: Number(nextAverage.toFixed(2))
    });
  });
}
