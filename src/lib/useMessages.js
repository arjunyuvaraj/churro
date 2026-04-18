import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db, firebaseReady } from './firebase';

/**
 * Hook to fetch all conversations for a user
 */
export function useConversations(uid) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !firebaseReady || !db) {
      setLoading(false);
      setData([]);
      return undefined;
    }

    const ref = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(ref, (snapshot) => {
      setData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [uid]);

  return { data, loading };
}

/**
 * Hook to fetch messages in a conversation
 */
export function useMessages(conversationId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !firebaseReady || !db) {
      setLoading(false);
      setData([]);
      return undefined;
    }

    const ref = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(ref, (snapshot) => {
      setData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [conversationId]);

  return { data, loading };
}

/**
 * Send a message in a conversation
 */
export async function sendMessage({ conversationId, senderUid, senderName, text, imageUrl = null }) {
  if (!firebaseReady || !db) return;

  const messageData = {
    senderUid,
    senderName,
    text: text || '',
    createdAt: serverTimestamp()
  };

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }

  await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);

  // Update conversation last message
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text || '📷 Image',
    lastMessageAt: serverTimestamp(),
    lastSenderUid: senderUid
  });
}

/**
 * Start or get a conversation between two users about a task
 */
export async function getOrCreateConversation({ taskId, taskTitle, participants, participantNames }) {
  if (!firebaseReady || !db) return null;

  // Create new conversation
  const conversationRef = await addDoc(collection(db, 'conversations'), {
    taskId,
    taskTitle,
    participants,
    participantNames,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    lastSenderUid: null,
    createdAt: serverTimestamp()
  });

  return conversationRef.id;
}

/**
 * Report a message for moderation
 */
export async function reportMessage({ conversationId, messageId, reporterUid, reason }) {
  if (!firebaseReady || !db) return;

  await addDoc(collection(db, 'moderation_flags'), {
    type: 'message',
    conversationId,
    messageId,
    reporterUid,
    reason,
    status: 'pending',
    createdAt: serverTimestamp()
  });
}
