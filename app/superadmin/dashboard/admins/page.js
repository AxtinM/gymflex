// Removed "use client"; - This will now be a Server Component initially

import { getAllUsers, getAllGyms, getAllGymAdminAssignments } from "@/app/_lib/data-service";
import AssignAdminForm from "@/app/_components/superadmin/AssignAdminForm"; // Import Client Component
import AdminAssignmentsList from "@/app/_components/superadmin/AdminAssignmentsList"; // Import Client Component
// import { toast } from 'react-hot-toast'; // Not needed here

// Removed TODO comments

export default async function ManageGymAdminsPage() { // Server Component

  // Fetch initial data on the server
  let users = [];
  let gyms = [];
  let assignments = [];
  let fetchError = null;

  try {
    // Fetch all data concurrently
    const [usersData, gymsData, assignmentsData] = await Promise.all([
      getAllUsers(),
      getAllGyms(), // Using getAllGyms, assuming it returns {id, name} needed for dropdown
      getAllGymAdminAssignments()
    ]);
    users = usersData || [];
    gyms = gymsData || [];
    assignments = assignmentsData || [];
  } catch (err) {
    console.error("Failed to load initial admin management data:", err);
    fetchError = err.message || "Failed to load data.";
  }

  if (fetchError) {
     return <p className="text-red-500 text-center py-8">Error loading data: {fetchError}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Manage Gym Admins</h1>

      {/* Render AssignAdminForm Client Component */}
      {/* Pass users and gyms data fetched on the server */}
      {/* onSuccess callback isn't strictly needed if AdminAssignmentsList handles its own refresh */}
      <AssignAdminForm users={users} gyms={gyms} onSuccess={null} />

      {/* Render AdminAssignmentsList Client Component */}
      {/* Pass initial assignments fetched on the server */}
      <AdminAssignmentsList initialAssignments={assignments} />
    </div>
  );
}