import { useState } from 'react';
import { Flag } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, firebaseReady } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';

const reasons = [
  'Inappropriate content',
  'Safety concern',
  'Spam or scam',
  'Inaccurate listing',
  'Other'
];

export default function ReportButton({ targetType, targetId, className = '' }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!firebaseReady || !db || !auth?.currentUser || !selectedReason) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'moderation_flags'), {
        targetType,
        targetId,
        reporterUid: auth.currentUser.uid,
        reason: selectedReason,
        detail,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success animate-fade-in">
        Report submitted. Our team will review it.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary hover:text-danger hover:border-danger transition ${className}`}
        aria-label={`Report this ${targetType}`}
      >
        <Flag size={16} />
        <span>Report</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-scale-in">
      <h3 className="font-heading font-bold text-text-primary">Report this {targetType}</h3>
      <div className="space-y-2">
        {reasons.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => setSelectedReason(reason)}
            className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
              selectedReason === reason
                ? 'border-primary bg-primary-light text-text-primary'
                : 'border-border text-text-secondary hover:border-primary/50'
            }`}
          >
            {reason}
          </button>
        ))}
      </div>
      <textarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        rows={2}
        placeholder="Any additional details (optional)"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!selectedReason || submitting}
          onClick={handleSubmit}
          className="flex-1 rounded-lg bg-danger px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Submit Report'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setSelectedReason(''); setDetail(''); }}
          className="rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
