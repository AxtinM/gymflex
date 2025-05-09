// Removed "use client"; - This will now be a Server Component initially

import { getAllGyms } from "@/app/_lib/data-service"; // Fetch all gyms
import CreateGymForm from "@/app/_components/superadmin/CreateGymForm"; // Import Client Component
import GymList from "@/app/_components/superadmin/GymList"; // Import Client Component
// import Link from 'next/link'; // Link is used within GymList now

// Reusable Input component (assuming it exists or define here/import)
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

// Reusable Textarea component (assuming it exists or define here/import)
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

// Component to display a gym in the list
function GymListItem({ gym, onDelete }) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the gym "${gym.name}"? This will also delete all associated memberships, orders, events, and admin assignments.`)) {
      startDeleteTransition(async () => {
        const result = await deleteGymAction(gym.id);
        if (result?.error) {
          alert(`Error deleting gym: ${result.error}`);
          // toast.error(`Error deleting gym: ${result.error}`);
        } else {
          // toast.success("Gym deleted.");
          onDelete(); // Trigger re-fetch in parent
        }
      });
    }
  };

  return (
    <div className="bg-primary-800 p-4 rounded-lg shadow flex justify-between items-center gap-4">
      <div>
        <h3 className="text-lg font-semibold text-accent-500">{gym.name}</h3>
        <p className="text-sm text-primary-300">{gym.address || "No address"}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
         {/* Link to the Gym Admin edit page (reusing that form/action) */}
         <Link href={`/gym-admin/${gym.id}/dashboard/profile`} >
            <a className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Edit</a>
         </Link>
        <button 
          onClick={handleDelete} 
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}


// TODO: Extract Form and List into separate Client Components

export default async function ManageGymsPage() { // Now an async Server Component
  
  // Fetch initial data on the server
  let initialGyms = [];
  let fetchError = null;
  try {
    initialGyms = await getAllGyms();
  } catch (err) {
    console.error("Failed to load initial gyms:", err);
    fetchError = err.message || "Failed to load gyms.";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Manage Gyms</h1>

      {/* Render the CreateGymForm Client Component */}
      {/* Pass the fetchGyms function (or similar logic) if needed for revalidation */}
      <CreateGymForm onSuccess={null} />
      {/* Note: onSuccess prop isn't strictly needed if GymList handles its own re-fetch */}

      {/* Render the GymList Client Component, passing initial data */}
      {fetchError ? (
        <p className="text-red-500 mt-8">Error loading gyms: {fetchError}</p>
      ) : (
        <GymList initialGyms={initialGyms} />
      )}
    </div>
  );
}