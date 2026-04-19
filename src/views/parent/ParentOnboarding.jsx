import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { categoryOptions } from '../../lib/taskCategories';
import { useAuth } from '../../lib/useAuth';

export default function ParentOnboarding() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [radius, setRadius] = useState(1);
    const [cap, setCap] = useState('');
    const [autoApprove, setAutoApprove] = useState(false);
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const radiusOptions = useMemo(() => [0.25, 0.5, 1, 2], []);
    const pendingInvitations = auth?.pendingInvitations || [];

    async function handleAcceptInvitation(invitationId) {
        setSaving(true);
        setError('');
        try {
            await auth.acceptParentInvitationById(invitationId);
        } catch (err) {
            setError(err.message || 'Unable to accept invitation.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDeclineInvitation(invitationId) {
        setSaving(true);
        setError('');
        try {
            await auth.declineParentInvitationById(invitationId);
        } catch (err) {
            setError(err.message || 'Unable to decline invitation.');
        } finally {
            setSaving(false);
        }
    }

    async function completeOnboarding() {
        setSaving(true);
        setError('');
        try {
            await auth.completeParentOnboarding({
                teenRadiusLimit: Number(radius),
                approvedCategories: categories,
                weeklyEarningsCap: cap === '' ? null : Number(cap),
                autoApprove
            });
            navigate('/parent', { replace: true });
        } catch (err) {
            setError(err.message || 'Unable to save preferences.');
        } finally {
            setSaving(false);
        }
    }

    if (auth?.profile?.onboardingComplete) {
        navigate('/parent', { replace: true });
        return null;
    }

    const steps = [
        { label: 'Welcome', number: 1 },
        { label: 'Preferences', number: 2 },
        { label: 'Confirm', number: 3 }
    ];

    return (
        <AppShell>
            <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-3">
                    {steps.map((s, i) => (
                        <div key={s.number} className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${step >= i ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                                {step > i ? '✓' : s.number}
                            </div>
                            <span className={`hidden text-sm font-medium sm:inline ${step >= i ? 'text-text-primary' : 'text-text-secondary'}`}>{s.label}</span>
                            {i < steps.length - 1 ? <div className={`h-px w-8 transition ${step > i ? 'bg-primary' : 'bg-border'}`} /> : null}
                        </div>
                    ))}
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                {/* Step 0: Welcome */}
                {step === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Welcome to Churro</p>
                            <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Set up your parent account</h1>
                            <p className="mt-3 text-text-secondary">
                                As a parent, you'll be able to approve tasks your teen applies for, set safety limits, and monitor their activity in real time.
                            </p>
                        </div>

                        {/* Pending invitations */}
                        {pendingInvitations.length > 0 ? (
                            <div className="rounded-xl bg-surface p-4 space-y-3">
                                <p className="text-sm font-semibold text-text-primary">Pending teen invitations</p>
                                <p className="text-xs text-text-secondary">A teen has invited you to link accounts. Accept to start monitoring their activity.</p>
                                {pendingInvitations.map((inv) => (
                                    <div key={inv.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-semibold text-text-primary">{inv.teenName || 'A teen'}</p>
                                            <p className="text-xs text-text-secondary">Sent an invitation to link accounts</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => handleAcceptInvitation(inv.id)} disabled={saving} className="rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:bg-success/90 transition disabled:opacity-50">
                                                Accept
                                            </button>
                                            <button type="button" onClick={() => handleDeclineInvitation(inv.id)} disabled={saving} className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger/90 transition disabled:opacity-50">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl bg-surface p-4">
                                <p className="text-sm font-semibold text-text-primary">No teen invitations yet</p>
                                <p className="text-xs text-text-secondary">When a teen signs up with your email, their invitation will appear here. You can continue setup now and link later.</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                        >
                            Set up preferences
                        </button>
                    </div>
                ) : null}

                {/* Step 1: Oversight preferences */}
                {step === 1 ? (
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                        <div>
                            <h2 className="font-heading text-2xl font-extrabold text-text-primary">Safety preferences</h2>
                            <p className="mt-2 text-text-secondary">These settings control what tasks your teen can see and accept. You can change them later in Settings.</p>
                        </div>

                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-text-primary">Maximum task radius</span>
                            <p className="mb-2 text-xs text-text-secondary">How far from home your teen can accept tasks</p>
                            <select className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" value={radius} onChange={(event) => setRadius(event.target.value)}>
                                {radiusOptions.map((option) => <option key={option} value={option}>{option} mi</option>)}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-text-primary">Weekly earnings cap</span>
                            <p className="mb-2 text-xs text-text-secondary">Maximum amount your teen can earn per week (leave blank for no limit)</p>
                            <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" type="number" inputMode="decimal" value={cap} onChange={(event) => setCap(event.target.value)} placeholder="Optional" />
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                            <input type="checkbox" checked={autoApprove} onChange={(event) => setAutoApprove(event.target.checked)} className="h-5 w-5 rounded border-border accent-primary" />
                            <div>
                                <span className="text-sm font-semibold text-text-primary">Auto-approve tasks within limits</span>
                                <p className="text-xs text-text-secondary">Automatically approve tasks that match your safety settings</p>
                            </div>
                        </label>

                        <div>
                            <p className="text-sm font-semibold text-text-primary">Approved task categories</p>
                            <p className="mb-3 text-xs text-text-secondary">Select which types of tasks your teen is allowed to do</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {categoryOptions.map((category) => (
                                    <label key={category.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:border-primary/50 transition">
                                        <input type="checkbox" checked={categories.includes(category.id)} onChange={(event) => {
                                            setCategories((current) => event.target.checked ? [...current, category.id] : current.filter((item) => item !== category.id));
                                        }} className="h-5 w-5 rounded border-border accent-primary" />
                                        <span className="text-sm text-text-primary">{category.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">
                                Back
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition">
                                Review & confirm
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Step 2: Confirmation */}
                {step === 2 ? (
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                        <div>
                            <h2 className="font-heading text-2xl font-extrabold text-text-primary">Confirm your setup</h2>
                            <p className="mt-2 text-text-secondary">Review your preferences before finishing. You can always change these in Settings later.</p>
                        </div>

                        <div className="rounded-xl bg-surface p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Task radius</span>
                                <span className="font-semibold text-text-primary">{radius} mi</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Weekly cap</span>
                                <span className="font-semibold text-text-primary">{cap ? `$${cap}` : 'No limit'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Auto-approve</span>
                                <span className="font-semibold text-text-primary">{autoApprove ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-text-secondary">Categories</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {categories.length > 0 ? categories.map((catId) => {
                                        const cat = categoryOptions.find((c) => c.id === catId);
                                        return <span key={catId} className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">{cat?.label || catId}</span>;
                                    }) : <span className="text-xs text-text-secondary">None selected — all categories will require manual approval</span>}
                                </div>
                            </div>
                            {auth?.profile?.linkedTeenUid ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Linked teen</span>
                                    <span className="font-semibold text-success">Connected ✓</span>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">
                                Back
                            </button>
                            <button type="button" onClick={completeOnboarding} disabled={saving} className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50">
                                {saving ? 'Saving...' : 'Complete setup'}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </AppShell>
    );
}
