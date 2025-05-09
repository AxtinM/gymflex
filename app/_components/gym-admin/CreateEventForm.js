"use client";

import { useState, useTransition, useRef } from "react";
import { createEventAction } from "@/app/_lib/actions";

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

// Reusable Textarea component (assuming it exists or define here/import)
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

export default function CreateEventForm({ gymId, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState(null);
  const formRef = useRef(null);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.target);

    startTransition(async () => {
      const result = await createEventAction(gymId, formData);
      if (result?.error) {
        setFormError(result.error);
        // toast.error(result.error);
      } else {
        // toast.success(result.success || "Event created.");
        formRef.current?.reset(); // Reset form fields using ref
        if (onSuccess) onSuccess(); // Call callback to trigger re-fetch in parent
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleCreateSubmit} className="bg-primary-900 p-6 rounded-lg shadow-lg mb-8 space-y-4">
      <h2 className="text-xl font-semibold text-accent-400 mb-4">Add New Event</h2>
      <Input label="Event Title" id="title" required disabled={isPending} />
      <Textarea label="Description" id="description" rows={4} disabled={isPending} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Date and Time" id="event_date_time" type="datetime-local" required disabled={isPending} />
        <Input label="Location Details" id="location_details" placeholder="e.g., Studio 1, Online via Zoom" disabled={isPending} />
      </div>
      
      {formError && <p className="text-red-500 text-sm">{formError}</p>}

      <button 
        type="submit" 
        disabled={isPending}
        className="px-5 py-2 bg-accent-600 text-primary-800 font-semibold rounded-md hover:bg-accent-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isPending ? "Adding Event..." : "Add Event"}
      </button>
    </form>
  );
}