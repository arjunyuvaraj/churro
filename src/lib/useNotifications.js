import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './useAuth';

export function useNotifications() {
    const auth = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let unsubscribe = () => { };

        if (db && auth?.currentUser?.uid) {
            const q = query(
                collection(db, 'notifications'),
                where('uid', '==', auth.currentUser.uid)
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                notifs.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });

                const limited = notifs.slice(0, 50);

                setNotifications(limited);
                setUnreadCount(limited.filter(n => !n.read).length);
            }, (err) => {
                console.error("Notifications listener error:", err);
            });
        }

        return () => unsubscribe();
    }, [auth?.currentUser?.uid]);

    return { notifications, unreadCount };
}
