import { useState } from 'react';
import RatingStars from './RatingStars';
import { submitRating } from '../lib/useTask';
import { useAuth } from '../lib/useAuth';

export default function RatingPrompt({ task, ratedUid, title }) {
  const auth = useAuth();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    await submitRating({
      taskId: task.id,
      raterUid: auth.currentUser.uid,
      raterRole: auth.role,
      ratedUid,
      stars,
      comment
    });
    setSubmitted(true);
    setSaving(false);
  }

  if (submitted) {
    return <div className="rounded-2xl border border-border bg-white p-5 text-sm font-semibold text-success">Thanks. Your rating was saved.</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <div className="mt-4">
        <RatingStars value={stars} onChange={setStars} />
      </div>
      <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} className="mt-4 w-full rounded-xl border border-border px-4 py-3" placeholder="Optional comment" />
      <button type="button" disabled={saving} onClick={handleSubmit} className="mt-4 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
        {saving ? 'Saving...' : 'Submit rating'}
      </button>
    </div>
  );
}
