import { useState } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingStars from '../../components/RatingStars';
import { useAuth } from '../../lib/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function TeenProfile() {
  const auth = useAuth();
  const [bio, setBio] = useState(auth?.profile?.bio || '');
  const [saving, setSaving] = useState(false);

  async function saveBio() {
    if (!auth?.currentUser || !db) return;
    setSaving(true);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { bio });
    setSaving(false);
  }

  if (!auth?.profile) {
    return <AppShell><PageState title="Profile loading" description="Fetching your account details." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Teen profile</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">{auth.profile.fullName}</h1>
          <p className="mt-2 text-text-secondary">Age {auth.profile.age} · {auth.profile.completedTasks || 0} completed tasks</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-semibold">Average rating</span>
            <RatingStars value={Math.round(auth.profile.averageRating || 0)} size="sm" />
            <span className="text-sm text-text-secondary">{auth.profile.averageRating || 0}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-bold">Approved categories</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(auth.profile.approvedCategories || []).map((category) => <span key={category} className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary-dark">{category}</span>)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-bold">Bio</h2>
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="mt-3 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" placeholder="Write a short bio" />
          <button type="button" onClick={saveBio} disabled={saving} className="mt-4 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
            {saving ? 'Saving...' : 'Save bio'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
