"use client";

import { useState, useTransition } from 'react';
import { assignGymAdminAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

export default function AssignAdminForm({ users = [], gyms = [], onSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedGymId, setSelectedGymId] = useState('');
  const [isAssigning, startAssignTransition] = useTransition();
  const [formError, setFormError] = useState('');

  const handleAssignSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!selectedUserId || !selectedGymId) {
      setFormError('Please select both a user and a gym.');
      return;
    }

    startAssignTransition(async () => {
      const result = await assignGymAdminAction(Number(selectedUserId), Number(selectedGymId));
      if (result?.error) {
        setFormError(result.error);
        // toast.error(result.error);
      } else {
        // toast.success("Admin assigned successfully.");
        setSelectedUserId(''); // Reset form
        setSelectedGymId('');
        if (onSuccess) onSuccess(); // Trigger re-fetch in parent
      }
    });
  };

  return (
     <form onSubmit={handleAssignSubmit} className="bg-primary-900 p-6 rounded-lg shadow-lg mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-accent-400 mb-4">Assign Gym Admin Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* User Select */}
          <div className="md:col-span-1">
            <label htmlFor="user-select" className="block text-sm font-medium text-primary-200 mb-1">Select User</label>
            <select 
              id="user-select" 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isAssigning}
              required
              className="w-full bg-primary-700 text-primary-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:bg-primary-600"
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
              ))}
            </select>
          </div>
          {/* Gym Select */}
          <div className="md:col-span-1">
            <label htmlFor="gym-select" className="block text-sm font-medium text-primary-200 mb-1">Select Gym</label>
            <select 
              id="gym-select" 
              value={selectedGymId} 
              onChange={(e) => setSelectedGymId(e.target.value)}
              disabled={isAssigning}
              required
              className="w-full bg-primary-700 text-primary-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:bg-primary-600"
            >
              <option value="">-- Select Gym --</option>
              {gyms.map(gym => (
                <option key={gym.id} value={gym.id}>{gym.name}</option>
              ))}
            </select>
          </div>
          {/* Submit Button */}
          <div className="md:col-span-1">
            <button 
              type="submit" 
              disabled={isAssigning || !selectedUserId || !selectedGymId}
              className="w-full px-5 py-2 bg-accent-600 text-primary-800 font-semibold rounded-md hover:bg-accent-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isAssigning ? "Assigning..." : "Assign Admin"}
            </button>
          </div>
        </div>
         {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
      </form>
  );
}