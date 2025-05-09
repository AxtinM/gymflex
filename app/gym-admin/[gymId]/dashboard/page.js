import { getGymById } from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
// We might not need isUserAdminForGym here if layout handles it,
// but it could be used for an extra check or to fetch specific admin data.

export async function generateMetadata({ params }) {
  try {
    const gym = await getGymById(params.gymId);
    if (!gym) return { title: "Admin Dashboard" }; // Fallback
    return {
      title: `Dashboard - ${gym.name}`,
    };
  } catch (error) {
    return { title: "Admin Dashboard" };
  }
}

export default async function GymAdminDashboardPage({ params }) {
  const { gymId } = params;
  // const session = await auth(); // Session data available if needed
  // const userId = session?.user?.id;

  let gymName = "Your Gym";
  try {
    const gym = await getGymById(gymId);
    if (gym) gymName = gym.name;
  } catch (e) { /* ignore, use default */ }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">
        Welcome to the Admin Dashboard for {gymName}
      </h1>
      <p className="text-lg text-primary-300 mb-4">
        This is your central hub for managing gym details, memberships, client orders, and events.
      </p>
      <p className="text-primary-300">
        Please use the navigation menu on the left to access different management sections.
      </p>
      
      {/* Placeholder for quick stats or summary cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-primary-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-accent-500 mb-2">Total Memberships</h3>
          <p className="text-3xl font-bold text-primary-100">0</p> {/* TODO: Fetch actual data */}
        </div>
        <div className="bg-primary-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-accent-500 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-primary-100">0</p> {/* TODO: Fetch actual data */}
        </div>
        <div className="bg-primary-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-accent-500 mb-2">Active Events</h3>
          <p className="text-3xl font-bold text-primary-100">0</p> {/* TODO: Fetch actual data */}
        </div>
      </div>
    </div>
  );
}