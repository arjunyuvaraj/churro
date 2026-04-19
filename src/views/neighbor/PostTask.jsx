import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import AppShell from '../../components/AppShell';
import { categoryIcons, taskCategories } from '../../lib/taskCategories';
import { db } from '../../lib/firebase';
import { createTask } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';
import { CheckCircle2, ChevronRight, MapPin } from 'lucide-react';

export default function PostTask() {
  const auth = useAuth();
  const navigate = useNavigate();
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

  const stepLabels = ['Category', 'Details', 'Time/Pay', 'Requirements', 'Review'];

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
      <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Post a task</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">Create a neighborhood task</h1>

          <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
            {stepLabels.map((label, idx) => {
              const num = idx + 1;
              const isActive = step === num;
              const isPast = step > num;
              return (
                <div key={label} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-primary text-white' : isPast ? 'bg-success/10 text-success' : 'text-slate-400'}`}>
                    {isPast ? <CheckCircle2 size={16} /> : <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>{num}</span>}
                    {label}
                  </div>
                  {num < stepLabels.length && <ChevronRight size={16} className="mx-2 text-slate-300" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-heading text-xl font-bold">What kind of help do you need?</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {taskCategories.map((item) => {
                  const Icon = categoryIcons[item.id];
                  return (
                    <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`flex min-h-32 flex-col items-start rounded-2xl border-2 p-5 text-left transition ${category === item.id ? 'border-primary bg-primary-light shadow-sm' : 'border-border hover:border-primary/40'}`}>
                      <Icon size={24} className={category === item.id ? 'text-primary-dark' : 'text-text-secondary'} />
                      <span className="mt-4 font-bold text-text-primary">{item.label}</span>
                      <span className="mt-1 text-xs text-text-secondary">{item.requiresPowerTools ? 'Requirements: 16+ years old' : 'All eligible ages'}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-heading text-xl font-bold">Task Details</h2>
              <p className="text-text-secondary text-sm">Provide a clear title and description so teens know what to expect.</p>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Title</span>
                <input className="w-full rounded-xl border border-border px-4 py-3 bg-surface outline-none focus:border-primary transition" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Rake the front yard leaves" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Description</span>
                <textarea className="w-full rounded-xl border border-border px-4 py-3 bg-surface outline-none focus:border-primary transition" rows="5" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the task in a few sentences..." />
              </label>

              <div className="mt-8 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">Back</button>
                <button type="button" disabled={!title.trim()} onClick={() => setStep(3)} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-heading text-xl font-bold">Time & Pay</h2>
              <p className="text-text-secondary text-sm">When do you need this done, and what is the reward?</p>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Reward (Cash or Hours)</span>
                <input className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition" type="text" value={pay} onChange={(event) => setPay(event.target.value)} placeholder="e.g. $15 or 1 hour volunteer" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Date</span>
                  <input className="w-full flex justify-between rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Start time</span>
                  <input className="w-full flex justify-between rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">End time</span>
                  <input className="w-full flex justify-between rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
                </label>
              </div>

              <div className="mt-8 flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">Back</button>
                <button type="button" disabled={!pay.trim() || !date} onClick={() => setStep(4)} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50">Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-heading text-xl font-bold">Requirements & Instructions</h2>
              <p className="text-text-secondary text-sm">Add any special requirements or instructions the teen should know before applying.</p>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Special Instructions</span>
                <textarea className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary transition" rows="4" value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} placeholder="e.g. Please bring your own gloves. Gate code is 1234. Avoid the flower beds on the left." />
              </label>

              <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-orange-600" /> Location Privacy Reminder</p>
                <p className="mt-1 text-xs text-slate-600">Your exact address ({auth?.profile?.address || 'not set'}) will only be revealed to the teen AFTER you approve their application. It will not be shown on the public map.</p>
              </div>

              <div className="mt-8 flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">Back</button>
                <button type="button" onClick={() => setStep(5)} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">Continue</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-bold">Review & Post</h2>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="border-b border-border pb-4 mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{selectedCategory?.label}</p>
                    <p className="mt-1 font-heading text-2xl font-bold">{title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold text-success">{pay}</p>
                  </div>
                </div>

                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-text-secondary mb-1">Time</p>
                    <p className="font-medium">{date} · {startTime} - {endTime}</p>
                  </div>
                  {selectedCategory?.requiresPowerTools && (
                    <div>
                      <p className="text-text-secondary mb-1">Requirements</p>
                      <p className="font-medium text-amber-700">Must be 16+ years old</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-text-secondary mb-1">Description</p>
                    <p className="font-medium whitespace-pre-wrap">{description}</p>
                  </div>
                  {specialInstructions && (
                    <div className="sm:col-span-2">
                      <p className="text-text-secondary mb-1">Special Instructions</p>
                      <p className="font-medium">{specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button type="button" onClick={() => setStep(4)} className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">Back</button>
                <button type="button" disabled={saving} onClick={handlePost} className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-dark transition disabled:opacity-50">
                  {saving ? 'Posting...' : '🚀 Post Task to Map'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
