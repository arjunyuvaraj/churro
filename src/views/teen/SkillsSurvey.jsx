import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import PageState from '../../components/PageState';

const surveyQuestions = [
  {
    id: 'pet_skills',
    question: 'What pets are you comfortable caring for?',
    options: [
      { id: 'pet_care_dogs', label: 'Dogs' },
      { id: 'pet_care_cats', label: 'Cats' },
      { id: 'pet_care_birds', label: 'Birds & small animals' },
      { id: 'pet_care_other', label: 'All pets' }
    ],
    multiple: true
  },
  {
    id: 'tech_skills',
    question: 'What\'s your tech comfort level?',
    options: [
      { id: 'tech_help_basic', label: 'Basic help (passwords, charging, etc.)' },
      { id: 'tech_help_advanced', label: 'Advanced help (troubleshooting, setup)' }
    ],
    multiple: true
  },
  {
    id: 'yard_skills',
    question: 'Are you interested in outdoor/yard work?',
    options: [
      { id: 'yard_work_raking', label: 'Raking & leaf cleanup' },
      { id: 'yard_work_planting', label: 'Planting & gardening' },
      { id: 'yard_work_general', label: 'General yard maintenance' },
      { id: 'yard_work_power_tools', label: 'Power tools (16+)' }
    ],
    multiple: true
  },
  {
    id: 'tutoring_skills',
    question: 'Can you help with tutoring or homework?',
    options: [
      { id: 'tutoring_math', label: 'Math' },
      { id: 'tutoring_english', label: 'English & writing' },
      { id: 'tutoring_science', label: 'Science' },
      { id: 'tutoring_other', label: 'Other subjects' }
    ],
    multiple: true
  },
  {
    id: 'service_skills',
    question: 'What other services can you provide?',
    options: [
      { id: 'services_babysitting', label: 'Babysitting / childcare' },
      { id: 'services_cleaning', label: 'Cleaning & organizing' },
      { id: 'services_shopping', label: 'Shopping & errands' },
      { id: 'services_house_sitting', label: 'House sitting' },
      { id: 'services_moving', label: 'Moving help (16+)' }
    ],
    multiple: true
  }
];

export default function SkillsSurvey() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!auth) {
    return <PageState title="Churro is not configured" description="Set the Firebase VITE_ environment variables before accessing survey." />;
  }

  function toggleSkill(skillId) {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    // Validate: user must select at least one skill across all questions
    const selectedSkillIds = Object.keys(selectedSkills).filter((key) => selectedSkills[key]);
    if (selectedSkillIds.length === 0) {
      setError('Please select at least one skill from any category.');
      return;
    }

    setLoading(true);
    try {
      await auth.updateTeenSkills(selectedSkillIds);
      navigate('/teen/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save skills. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Let's get started</p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold text-text-primary">Tell us what you're good at</h1>
            <p className="mt-3 text-text-secondary">Your answers help us match you with the perfect tasks. You can always update these later.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {surveyQuestions.map((question, questionIndex) => (
              <div key={question.id}>
                <h2 className="mb-4 font-heading text-lg font-bold text-text-primary">
                  {questionIndex + 1}. {question.question}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleSkill(option.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                        selectedSkills[option.id]
                          ? 'border-primary bg-primary-light'
                          : 'border-border bg-white hover:border-primary-light'
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          selectedSkills[option.id] ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        {selectedSkills[option.id] && <Check size={18} className="text-white" />}
                      </div>
                      <span className="font-medium text-text-primary">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div className="mt-10 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Saving your skills...' : 'Continue to Dashboard'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
