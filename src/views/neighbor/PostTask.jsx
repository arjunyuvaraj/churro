import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { categoryIcons, taskCategories } from '../../lib/taskCategories';
import { db } from '../../lib/firebase';
import { createTask } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function PostTask() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('grocery_run');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCategory = useMemo(() => taskCategories.find((item) => item.id === category), [category]);

  async function handlePost() {
    setSaving(true);
    let coords = { lat: 37.7749, lng: -122.4194 };
    
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
        console.warn('Geolocation failed, using default', err);
      }
    }

    await createTask({
      taskId: crypto.randomUUID(),
      neighborUid: auth.currentUser.uid,
      neighborName: auth.firstName || 'Neighbor',
      neighborAddress: auth.profile.address,
      neighborRating: auth.profile.averageRating || 4,
      category,
      requiresPowerTools: category === 'yard_power',
      title,
      description,
      specialInstructions,
      pay: String(pay).trim(),
      date,
      startTime,
      endTime,
      latitude: coords.lat,
      longitude: coords.lng
    });
    setSaving(false);
    navigate('/neighbor');
  }



  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Post a task</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">Create a neighborhood task</h1>
          <p className="mt-3 rounded-xl bg-primary-light p-4 text-sm text-text-primary">Churro connects you with local teens for safe, age-appropriate tasks. Do not post tasks involving driving, hazardous equipment, or work after 9pm. Violations result in immediate account removal.</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          {step === 1 ? (
            <div>
              <h2 className="font-heading text-xl font-bold">Step 1. Category</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {taskCategories.map((item) => {
                  const Icon = categoryIcons[item.id];
                  return (
                    <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`flex min-h-28 flex-col items-start rounded-2xl border p-4 text-left ${category === item.id ? 'border-primary bg-primary-light' : 'border-border'}`}>
                      <Icon size={20} />
                      <span className="mt-3 font-semibold">{item.label}</span>
                      <span className="mt-1 text-xs text-text-secondary">{item.requiresPowerTools ? '16+ only' : 'All eligible ages'}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => setStep(2)} className="mt-5 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">Next</button>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold">Step 2. Details</h2>
              <label className="block"><span className="mb-1 block text-sm font-semibold">Title</span><input className="w-full rounded-xl border border-border px-4 py-3" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold">Description</span><textarea className="w-full rounded-xl border border-border px-4 py-3" rows="4" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold">Reward (Cash or Hours)</span><input className="w-full rounded-xl border border-border px-4 py-3 transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10" type="text" value={pay} onChange={(event) => setPay(event.target.value)} placeholder="e.g., $15 or 1 hour volunteer" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-1 block text-sm font-semibold">Date</span><input className="w-full rounded-xl border border-border px-4 py-3" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
                <label className="block"><span className="mb-1 block text-sm font-semibold">Start time</span><input className="w-full rounded-xl border border-border px-4 py-3" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
              </div>
              <label className="block"><span className="mb-1 block text-sm font-semibold">End time</span><input className="w-full rounded-xl border border-border px-4 py-3" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold">Special instructions</span><textarea className="w-full rounded-xl border border-border px-4 py-3" rows="3" value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} /></label>
              <div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary-dark">Back</button><button type="button" onClick={() => setStep(3)} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">Review</button></div>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold">Step 3. Review</h2>
              <div className="rounded-xl bg-surface p-4 text-sm">
                <p><span className="font-semibold">Category:</span> {selectedCategory?.label}</p>
                <p><span className="font-semibold">Title:</span> {title}</p>
                <p><span className="font-semibold">Reward:</span> {pay}</p>
                <p><span className="font-semibold">Time:</span> {date} {startTime} - {endTime}</p>
              </div>
              <div className="flex gap-3"><button type="button" onClick={() => setStep(2)} className="rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary-dark">Back</button><button type="button" disabled={saving} onClick={handlePost} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">{saving ? 'Posting...' : 'Post Task'}</button></div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
