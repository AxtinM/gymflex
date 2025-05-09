"use client";

import { useState, useTransition, useRef } from 'react';
import { createMembershipAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

// Reusable Input component (can be moved to a shared components folder)
function Input({ label, id, type = "text", defaultValue, disabled, required, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-primary-200 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        className="w-full bg-primary-700 text-primary-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:bg-primary-600"
        {...props}
      />
    </div>
  );
}

// Reusable Textarea component (can be moved to a shared components folder)
function Textarea({ label, id, defaultValue, disabled, rows = 3, ...props }) {
   return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-primary-200 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        defaultValue={defaultValue}
        disabled={disabled}
        rows={rows}
        className="w-full bg-primary-700 text-primary-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:bg-primary-600"
        {...props}
      />
    </div>
  );
}

export default function CreateMembershipForm({ gymId, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState(null);
  const formRef = useRef(null);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.target);

    startTransition(async () => {
      const result = await createMembershipAction(gymId, formData);
      if (result?.error) {
        setFormError(result.error);
        // toast.error(result.error);
      } else {
        // toast.success(result.success || "Membership created.");
        formRef.current?.reset(); // Reset form fields using ref
        if (onSuccess) onSuccess(); // Call callback to trigger re-fetch in parent
      }
    });
  };

   return (
     <form ref={formRef} onSubmit={handleCreateSubmit} className="bg-primary-900 p-6 rounded-lg shadow-lg mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-accent-400 mb-4">Add New Membership Plan</h2>
        <Input label="Plan Name" id="name" required disabled={isPending} />
        <Textarea label="Description" id="description" disabled={isPending} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Price ($)" id="price" type="number" step="0.01" required disabled={isPending} />
          <Input label="Duration Label" id="duration" placeholder="e.g., 1 month, 1 year" disabled={isPending} />
          <Input label="Duration (Days)" id="duration_days" type="number" placeholder="e.g., 30, 365 (optional)" disabled={isPending} />
        </div>
        
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        
        <button 
          type="submit" 
          disabled={isPending}
          className="px-5 py-2 bg-accent-600 text-primary-800 font-semibold rounded-md hover:bg-accent-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isPending ? "Adding Plan..." : "Add Plan"}
        </button>
      </form>
   );
}