"use client";

import { useState, useTransition, useRef } from 'react';
import { createGymAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

// Reusable Input component (can be moved to a shared components folder)
function Input({ label, id, type = "text", defaultValue, disabled, required, ...props }) {
  return (
    <div className="mb-4">
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
    <div className="mb-4">
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

export default function CreateGymForm({ onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState(null);
  const formRef = useRef(null); // Use ref to reset the form

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.target);

    startTransition(async () => {
      const result = await createGymAction(formData);
      if (result?.error) {
        setFormError(result.error);
        // toast.error(result.error);
      } else {
        // toast.success(result.success || "Gym created successfully.");
        formRef.current?.reset(); // Reset form fields using ref
        if (onSuccess) onSuccess(); // Call callback to trigger re-fetch in parent
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleCreateSubmit} className="bg-primary-900 p-6 rounded-lg shadow-lg mb-8 space-y-1">
      <h2 className="text-xl font-semibold text-accent-400 mb-4">Add New Gym</h2>
      <Input label="Gym Name" id="name" required disabled={isPending} />
      <Textarea label="Address" id="address" disabled={isPending} />
      <Input label="Contact Phone" id="contact_phone" type="tel" disabled={isPending} />
      <Input label="Contact Email" id="contact_email" type="email" disabled={isPending} />
      <Textarea label="Facilities Description" id="facilities_description" rows={4} disabled={isPending} />
      <fieldset className="border border-primary-700 p-4 rounded-md mt-4">
        <legend className="text-lg font-semibold text-primary-200 px-2">Opening Hours (Optional)</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
          {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(day => (
            <Input 
              key={day}
              label={day.charAt(0).toUpperCase() + day.slice(1)} 
              id={`opening_hours_${day}`} 
              disabled={isPending}
              placeholder="e.g., 9 AM - 5 PM or Closed"
            />
          ))}
        </div>
      </fieldset>
      <Textarea 
        label="Photo URLs (comma-separated, optional)" 
        id="photos" 
        rows={2} 
        disabled={isPending}
        placeholder="e.g., https://example.com/image1.jpg, https://example.com/image2.jpg"
      />
      
      {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}

      <button 
        type="submit" 
        disabled={isPending}
        className="mt-4 px-5 py-2 bg-accent-600 text-primary-800 font-semibold rounded-md hover:bg-accent-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isPending ? "Adding Gym..." : "Add Gym"}
      </button>
    </form>
  );
}