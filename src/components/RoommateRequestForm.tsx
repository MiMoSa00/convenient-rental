'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function RoommateRequestForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    budget: 0,
    moveInDate: '',
    duration: 6,
    lifestyle: [] as string[],
    location: '',
    cleaningHabits: '',
    smokingTolerance: '',
    petPreference: '',
    workSchedule: '',
    guestHabits: '',
  });

  const lifestyleOptions = [
    'Early Bird',
    'Night Owl',
    'Social',
    'Quiet',
    'Student',
    'Professional',
    'Remote Worker',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/roommate-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to matches page
      router.push(`/roommate-matches/${data.request.id}`);
    } catch (error) {
      console.error('Error submitting roommate request:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4">
        Please sign in to create a roommate request.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Find Your Perfect Roommate</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Monthly Budget (USD)
          </label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Move-in Date
          </label>
          <input
            type="date"
            value={formData.moveInDate}
            onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stay Duration (months)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Preferred Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Lifestyle
          </label>
          <div className="grid grid-cols-2 gap-2">
            {lifestyleOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.lifestyle.includes(option)}
                  onChange={(e) => {
                    const newLifestyle = e.target.checked
                      ? [...formData.lifestyle, option]
                      : formData.lifestyle.filter((item) => item !== option);
                    setFormData({ ...formData, lifestyle: newLifestyle });
                  }}
                  className="rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cleaning Habits
          </label>
          <select
            value={formData.cleaningHabits}
            onChange={(e) => setFormData({ ...formData, cleaningHabits: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select...</option>
            <option value="Very Neat">Very Neat</option>
            <option value="Moderately Neat">Moderately Neat</option>
            <option value="Somewhat Messy">Somewhat Messy</option>
            <option value="Very Messy">Very Messy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Smoking Tolerance
          </label>
          <select
            value={formData.smokingTolerance}
            onChange={(e) => setFormData({ ...formData, smokingTolerance: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select...</option>
            <option value="No Smoking">No Smoking</option>
            <option value="Outside Only">Outside Only</option>
            <option value="Indoors OK">Indoors OK</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pet Preference
          </label>
          <select
            value={formData.petPreference}
            onChange={(e) => setFormData({ ...formData, petPreference: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select...</option>
            <option value="No Pets">No Pets</option>
            <option value="Small Pets Only">Small Pets Only</option>
            <option value="Any Pets OK">Any Pets OK</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Work Schedule
          </label>
          <select
            value={formData.workSchedule}
            onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select...</option>
            <option value="9-5">9-5</option>
            <option value="Night Shift">Night Shift</option>
            <option value="Flexible">Flexible</option>
            <option value="Work from Home">Work from Home</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Guest Habits
          </label>
          <select
            value={formData.guestHabits}
            onChange={(e) => setFormData({ ...formData, guestHabits: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select...</option>
            <option value="Rarely">Rarely</option>
            <option value="Occasionally">Occasionally</option>
            <option value="Frequently">Frequently</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Finding Matches...' : 'Find Matches'}
      </button>
    </form>
  );
}
