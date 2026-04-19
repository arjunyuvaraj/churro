import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './useAuth';

export function useNotifications() {
    const auth = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let unsubscribe = () => { };

        if (db && auth?.currentUser?.uid) {
            // Fetch notifications where recipientUid == currentUser.uid OR recipientEmail == profile.email (for invites if not fully linked)
            // Since firestore doesn't do logical OR well across fields without multiple queries, 
            // we'll just query by recipientUid for now. For parents, we explicitly link teens via invitations collection anyway.

            const q = query(
                collection(db, 'notifications'),
                where('recipientUid', '==', parseInt(auth.currentUser.uid, 10) ? auth.currentUser.uid : auth.currentUser.uid), // trigger reload
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.read).length);
            }, (err) => {
                console.error("Notifications listener error:", err);
            });
        }

        return () => unsubscribe();
    }, [auth?.currentUser?.uid]);

    return { notifications, unreadCount };
}
