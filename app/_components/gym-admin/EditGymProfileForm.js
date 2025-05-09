"use client"; 

import { useState, useTransition } from "react";
// Removed getGymById import - data passed via props
import { updateGymProfileAction } from "@/app/_lib/actions";
// import { toast } from "react-hot-toast"; 

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
function Textarea({ label, id, defaultValue, disabled, rows = 4, ...props }) {
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

// This component receives the initial gym data as a prop
export default function EditGymProfileForm({ gym }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  
  // No need for internal gym state or useEffect for initial load

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    const formData = new FormData(event.target);

    startTransition(async () => {
      // Pass gymId to the action
      const result = await updateGymProfileAction(gym.id, formData); 
      if (result?.error) {
        setFormError(result.error);
        // toast.error(result.error);
      } else if (result?.success) {
        setFormSuccess(result.success);
        // toast.success(result.success);
        // Revalidation is handled by the server action, no need to re-fetch here
      }
    });
  };
  
  // Use initial data passed via props for defaults
  const defaultOpeningHours = gym.opening_hours || {};
  const defaultPhotosString = Array.isArray(gym.photos) ? gym.photos.join(", ") : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-primary-800 p-8 rounded-lg shadow-lg">
      <Input label="Gym Name" id="name" defaultValue={gym.name} disabled={isPending} required />
      <Textarea label="Address" id="address" defaultValue={gym.address} disabled={isPending} />
      <Input label="Contact Phone" id="contact_phone" type="tel" defaultValue={gym.contact_phone} disabled={isPending} />
      <Input label="Contact Email" id="contact_email" type="email" defaultValue={gym.contact_email} disabled={isPending} />
      <Textarea label="Facilities Description" id="facilities_description" defaultValue={gym.facilities_description} rows={6} disabled={isPending} />

      <fieldset className="border border-primary-700 p-4 rounded-md">
        <legend className="text-lg font-semibold text-primary-200 px-2">Opening Hours</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(day => (
            <Input 
              key={day}
              label={day.charAt(0).toUpperCase() + day.slice(1)} 
              id={`opening_hours_${day}`} 
              defaultValue={defaultOpeningHours[day] || ""} 
              disabled={isPending}
              placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
            />
          ))}
        </div>
      </fieldset>

      <Textarea 
        label="Photo URLs (comma-separated)" 
        id="photos" 
        defaultValue={defaultPhotosString} 
        rows={3} 
        disabled={isPending}
        placeholder="e.g., https://example.com/image1.jpg, https://example.com/image2.jpg"
      />
      
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      {formSuccess && <p className="text-green-500 text-sm">{formSuccess}</p>}

      <button 
        type="submit" 
        disabled={isPending}
        className="px-6 py-3 bg-accent-600 text-primary-800 font-semibold rounded-md hover:bg-accent-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
}