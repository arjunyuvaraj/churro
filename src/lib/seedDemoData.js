import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db, firebaseReady } from './firebase';
import { demoTasks, demoUsers } from './demoData';

export async function seedDemoData() {
  if (!firebaseReady || !db) return false;

  const userSnapshot = await getDocs(collection(db, 'users'));
  const taskSnapshot = await getDocs(collection(db, 'tasks'));
  if (!userSnapshot.empty || !taskSnapshot.empty) return false;

  const batch = writeBatch(db);
  batch.set(doc(db, 'users', demoUsers.teen.uid), demoUsers.teen);
  batch.set(doc(db, 'users', demoUsers.parent.uid), demoUsers.parent);
  demoUsers.neighbors.forEach((neighbor) => batch.set(doc(db, 'users', neighbor.uid), neighbor));
  demoTasks.forEach((task) => batch.set(doc(db, 'tasks', task.taskId), task));
  await batch.commit();
  return true;
}
