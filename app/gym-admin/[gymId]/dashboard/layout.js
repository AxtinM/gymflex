import { auth } from "@/app/_lib/auth";
import { isUserAdminForGym, getGymById } from "@/app/_lib/data-service";
import { redirect } from "next/navigation";
import Link from "next/link";

// Basic Admin Navigation (can be expanded)
function AdminNav({ gymId, gymName }) {
  const basePath = `/gym-admin/${gymId}/dashboard`;
  return (
    <nav className="bg-primary-800 p-4 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold text-accent-500 mb-3">Admin for: {gymName}</h2>
      <ul className="space-y-2">
        <li><Link href={`${basePath}`} className="text-primary-300 hover:text-accent-400 transition-colors block">Dashboard Home</Link></li>
        <li><Link href={`${basePath}/profile`} className="text-primary-300 hover:text-accent-400 transition-colors block">Manage Gym Profile</Link></li>
        <li><Link href={`${basePath}/memberships`} className="text-primary-300 hover:text-accent-400 transition-colors block">Manage Memberships</Link></li>
        <li><Link href={`${basePath}/orders`} className="text-primary-300 hover:text-accent-400 transition-colors block">Manage Client Orders</Link></li>
        <li><Link href={`${basePath}/events`} className="text-primary-300 hover:text-accent-400 transition-colors block">Manage Events</Link></li>
      </ul>
    </nav>
  );
}


export default async function GymAdminDashboardLayout({ children, params }) {
  const { gymId } = params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?message=Please log in to access the admin dashboard&redirectTo=/gym-admin/${gymId}/dashboard`);
  }

  const userId = session.user.id;
  const userRoles = session.user.roles || [];

  // Check if user has either 'gym_admin' or 'super_admin' role
  const isGymAdmin = userRoles.includes('gym_admin');
  const isSuperAdmin = userRoles.includes('super_admin');

  if (!isGymAdmin && !isSuperAdmin) { // Deny if neither role is present
    return (
      <div className="text-center py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-red-500 mb-4">Access Denied</h1>
        <p className="text-primary-200 mb-6 text-lg">
          You do not have permission to access gym admin dashboards.
        </p>
        <Link href="/" className="inline-block bg-accent-500 text-primary-800 px-6 py-3 rounded-md hover:bg-accent-600 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  // If the user is a gym_admin (but not super_admin), check specific gym authorization
  let isAuthorized = isSuperAdmin; // Superadmins are always authorized
  if (isGymAdmin && !isSuperAdmin) {
      isAuthorized = await isUserAdminForGym(userId, gymId);
  }

  if (!isAuthorized) { // Deny access if not superadmin AND not authorized for this gym
    return (
      <div className="text-center py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-red-500 mb-4">Authorization Failed</h1>
        <p className="text-primary-200 mb-6 text-lg">
          You are not authorized to manage this specific gym.
        </p>
        <Link href="/account" className="inline-block bg-accent-500 text-primary-800 px-6 py-3 rounded-md hover:bg-accent-600 transition-colors">
          Go to My Account
        </Link>
      </div>
    );
  }

  let gymName = "Selected Gym";
  try {
    const gym = await getGymById(gymId);
    if(gym) gymName = gym.name;
  } catch(e) { /* Use default name if fetch fails */ }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:gap-8">
        <aside className="md:w-1/4 lg:w-1/5 mb-8 md:mb-0">
          <AdminNav gymId={gymId} gymName={gymName} />
        </aside>
        <main className="md:w-3/4 lg:w-4/5">
          {children}
        </main>
      </div>
    </div>
  );
}