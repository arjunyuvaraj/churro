import { useState } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingStars from '../../components/RatingStars';
import { useAuth } from '../../lib/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function NeighborProfile() {
    const auth = useAuth();
    const [address, setAddress] = useState(auth?.profile?.address || '');
    const [instructions, setInstructions] = useState(auth?.profile?.gateInstructions || '');
    const [saving, setSaving] = useState(false);

    async function saveSettings() {
        if (!auth?.currentUser || !db) return;
        setSaving(true);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            address,
            gateInstructions: instructions
        });
        setSaving(false);
    }

    if (!auth?.profile) {
        return <AppShell><PageState title="Profile loading" description="Fetching your account details." /></AppShell>;
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Neighbor profile</p>
                    <h1 className="mt-2 font-heading text-3xl font-extrabold">{auth.profile.fullName}</h1>
                    <p className="mt-2 text-text-secondary">Community Member since {new Date().getFullYear()}</p>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-sm font-semibold">Average rating</span>
                        <RatingStars value={Math.round(auth.profile.averageRating || 0)} size="sm" />
                        <span className="text-sm text-text-secondary">{auth.profile.averageRating || 0}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="font-heading text-xl font-bold">Address & Details</h2>
                    <div className="mt-4 space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-text-primary">Home Address</span>
                            <input type="text" value={address} onChange={(event) => setAddress(event.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-primary transition" placeholder="e.g. 123 Main St, Springfield" />
                            <p className="mt-1 text-xs text-text-secondary">Only parents who approve tasks, and teens actively on your task, will see this.</p>
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-text-primary">Gate code or special instructions</span>
                            <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={3} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-primary transition" placeholder="Optional notes for when teens arrive." />
                        </label>
                        <button type="button" onClick={saveSettings} disabled={saving} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save details'}
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="font-heading text-xl font-bold">Recent Reviews</h2>
                    <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-border p-4 bg-surface">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-text-primary">A Teen</p>
                                <RatingStars value={5} size="sm" />
                            </div>
                            <p className="mt-2 text-sm text-text-secondary">Great instructions and paid quickly. Highly recommend working with them!</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
