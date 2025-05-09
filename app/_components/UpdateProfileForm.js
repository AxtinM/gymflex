"use client";

import { useState, useTransition } from "react"; // Added useTransition
import { updateUserProfileAction } from "../_lib/actions"; // Changed action import
import SubmitButton from "./SubmitButton";
// import { toast } from 'react-hot-toast'; // Optional for notifications

function UpdateProfileForm({ user }) { // Changed prop name from guest to user
  // Removed unused useState for count
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Only need fullName and email from the user object
  const { fullName, email } = user;

  // Client-side action handler to show feedback
  const handleFormAction = (formData) => {
    setFormError(null);
    setFormSuccess(null);
    startTransition(async () => {
      const result = await updateUserProfileAction(formData);
      if (result?.error) {
        setFormError(result.error);
        // toast.error(result.error);
      } else if (result?.success) {
        setFormSuccess(result.success);
        // toast.success(result.success);
      }
    });
  };

  return (
    // Use the client-side handler for the form action
    <form
      action={handleFormAction}
      className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col max-w-2xl mx-auto" // Added max-width and centering
    >
      <div className="space-y-2">
        <label htmlFor="fullName">Full name</label>
        <input
          // Now editable
          defaultValue={fullName}
          name="fullName"
          id="fullName" // Added id for label association
          disabled={isPending} // Disable while pending
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
          required // Make name required
        />
      </div>

      <div className="space-y-2">
        <label>Email address</label>
        <input
          disabled // Email should not be editable
          defaultValue={email}
          name="email"
          className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        />
      </div>

      {/* Removed Nationality and National ID sections */}
      
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      {formSuccess && <p className="text-green-500 text-sm">{formSuccess}</p>}

      <div className="flex justify-end items-center gap-6 mt-4"> {/* Added margin-top */}
        <SubmitButton pendingLabel="Updating...">Update profile</SubmitButton>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
