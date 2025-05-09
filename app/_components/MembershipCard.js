"use client";

import { useTransition } from 'react';
import { createMembershipOrderAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast'; // Or your preferred notification library

export default function MembershipCard({ membership, gymId, currentUserId }) {
  let [isPending, startTransition] = useTransition();

  const handleSelectPlan = () => {
    if (!currentUserId) {
      // This should ideally be handled by redirecting to login from server action,
      // but client-side check can provide immediate feedback or redirect.
      // toast.error("Please log in to select a plan.");
      window.location.href = "/login?message=Please log in to select a membership.";
      return;
    }

    startTransition(async () => {
      const result = await createMembershipOrderAction(membership.id, gymId);
      if (result?.error) {
        // toast.error(result.error);
        alert(`Error: ${result.error}`); // Simple alert for now
      } else {
        // Redirect is handled by the server action on success
        // toast.success("Order placed successfully for approval!");
      }
    });
  };

  return (
    <div className="bg-primary-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <h3 className="text-2xl font-semibold text-accent-500 mb-2">{membership.name}</h3>
      <p className="text-4xl font-bold text-primary-100 mb-3">
        ${parseFloat(membership.price).toFixed(2)}
        {membership.duration_days && <span className="text-lg font-normal text-primary-400"> / {membership.duration || `${membership.duration_days} days`}</span>}
      </p>
      <p className="text-primary-300 mb-4 min-h-[60px] flex-grow">{membership.description || "No description available."}</p>
      <button
        onClick={handleSelectPlan}
        disabled={isPending || !currentUserId} // Disable if pending or no user
        className="mt-auto w-full bg-accent-600 text-primary-800 font-semibold py-3 px-6 rounded-md hover:bg-accent-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isPending ? "Processing..." : (currentUserId ? "Select Plan" : "Login to Select")}
      </button>
    </div>
  );
}