import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { useAuth } from '../../lib/useAuth';
import { createTask } from '../../lib/useTask';

export default function BulkTaskSchedule() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    specialInstructions: '',
    requiresPowerTools: false,
    pay: '',
    startTime: '',
    endTime: ''
  });

  function addDate() {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDates([...selectedDates, today]);
  }

  function removeDate(index) {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  }

  function handleDateChange(index, newDate) {
    const updated = [...selectedDates];
    updated[index] = newDate;
    setSelectedDates(updated);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!formData.category || !formData.title || !formData.pay || selectedDates.length === 0) {
      setError('Please fill in all fields and select at least one date.');
      return;
    }

    setLoading(true);
    try {
      const tasksToCreate = selectedDates.map((date) => ({
        ...formData,
        date,
        pay: Number.parseFloat(formData.pay)
      }));

      // Create all tasks sequentially
      for (const taskData of tasksToCreate) {
        await createTask({
          ...taskData,
          neighborUid: auth.currentUser.uid,
          neighborName: auth.profile.fullName.split(/\s+/)[0],
          neighborAddress: auth.profile.address,
          latitude: 37.7749, // Hardcoded for MVP
          longitude: -122.4194
        });
      }

      navigate('/neighbor', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Bulk schedule</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">Post the same task multiple times</h1>
          <p className="mt-2 text-text-secondary">Create the same task for multiple dates in one go. Useful for recurring work like weekly yard maintenance.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 space-y-6">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>}

          {/* Task details */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold">Task details</h2>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Category</span>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                required
              >
                <option value="">Select a category...</option>
                <option value="grocery_run">Grocery run / errands</option>
                <option value="babysitting">Babysitting / childcare</option>
                <option value="pet_care">Pet care</option>
                <option value="tech_help">Tech help</option>
                <option value="light_cleaning">Light cleaning / organizing</option>
                <option value="tutoring">Tutoring / homework help</option>
                <option value="yard_manual">Yard work - manual tools only</option>
                <option value="house_sitting">House sitting</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Task title</span>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                placeholder="e.g., Weekly yard cleanup"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                rows="3"
                placeholder="What should the teen know about this task?"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Pay per task ($)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pay}
                onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                placeholder="15.00"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Start time</span>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">End time</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                  required
                />
              </label>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requiresPowerTools}
                onChange={(e) => setFormData({ ...formData, requiresPowerTools: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm font-semibold">Requires power tools (16+ only)</span>
            </label>
          </div>

          {/* Date selection */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Select dates</h2>
              <button
                type="button"
                onClick={addDate}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Add date
              </button>
            </div>

            {selectedDates.length === 0 && <p className="text-sm text-text-secondary">Add at least one date to create tasks.</p>}

            <div className="space-y-2">
              {selectedDates.map((date, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    className="flex-1 rounded-xl border border-border px-4 py-2 outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeDate(index)}
                    className="rounded-lg border border-border p-2 text-danger hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? `Creating ${selectedDates.length} tasks...` : `Create ${selectedDates.length} task${selectedDates.length !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/neighbor')}
              className="rounded-lg border border-border px-4 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
