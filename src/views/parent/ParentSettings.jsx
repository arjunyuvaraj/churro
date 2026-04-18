import { useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { categoryOptions } from '../../lib/taskCategories';
import { useAuth } from '../../lib/useAuth';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ParentSettings() {
  const auth = useAuth();
  const [radius, setRadius] = useState(auth?.profile?.teenRadiusLimit || 1);
  const [cap, setCap] = useState(auth?.profile?.weeklyEarningsCap || '');
  const [autoApprove, setAutoApprove] = useState(auth?.profile?.autoApprove || false);
  const [categories, setCategories] = useState(auth?.profile?.approvedCategories || []);
  const [saving, setSaving] = useState(false);

  const radiusOptions = useMemo(() => [0.25, 0.5, 1, 2], []);

  async function save() {
    if (!auth?.currentUser || !db) return;
    setSaving(true);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      teenRadiusLimit: Number(radius),
      weeklyEarningsCap: cap === '' ? null : Number(cap),
      autoApprove,
      approvedCategories: categories
    });
    setSaving(false);
  }

  if (!auth?.profile) {
    return <AppShell><PageState title="Loading settings" description="Fetching parent preferences." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h1 className="font-heading text-3xl font-extrabold">Parent settings</h1>
          <p className="mt-2 text-text-secondary">Control the teen's radius, categories, and earnings guardrails.</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 space-y-5">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Maximum radius</span>
            <select className="w-full rounded-xl border border-border px-4 py-3" value={radius} onChange={(event) => setRadius(event.target.value)}>
              {radiusOptions.map((option) => <option key={option} value={option}>{option} mi</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Weekly earnings cap</span>
            <input className="w-full rounded-xl border border-border px-4 py-3" type="number" inputMode="decimal" value={cap} onChange={(event) => setCap(event.target.value)} placeholder="Optional" />
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={autoApprove} onChange={(event) => setAutoApprove(event.target.checked)} />
            <span className="text-sm font-semibold">Auto-approve tasks within limits</span>
          </label>
          <div>
            <p className="text-sm font-semibold">Approved categories</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {categoryOptions.map((category) => (
                <label key={category.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                  <input type="checkbox" checked={categories.includes(category.id)} onChange={(event) => {
                    setCategories((current) => event.target.checked ? [...current, category.id] : current.filter((item) => item !== category.id));
                  }} />
                  <span className="text-sm">{category.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
