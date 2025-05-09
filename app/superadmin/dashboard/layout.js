import { auth } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// Basic Superadmin Navigation
function SuperAdminNav() {
  const basePath = `/superadmin/dashboard`;
  return (
    <nav className="bg-primary-800 p-4 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold text-accent-400 mb-3">Superadmin Menu</h2>
      <ul className="space-y-2">
        <li><Link href={`${basePath}`} className="text-primary-300 hover:text-accent-400 transition-colors block">Dashboard Home</Link></li>
        <li><Link href={`${basePath}/gyms`} className="text-primary-300 hover:text-accent-400 transition-colors block">Manage Gyms</Link></li>
        <li><Link href={`${basePath}/admins`} className="text-primary-300 hover:text-accent-400 transition-colors block">Manage Gym Admins</Link></li>
        <li><Link href={`${basePath}/analytics`} className="text-primary-300 hover:text-accent-400 transition-colors block">Site Analytics</Link></li>
      </ul>
    </nav>
  );
}

export default async function SuperAdminDashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?message=Please log in to access the superadmin dashboard&redirectTo=/superadmin/dashboard`);
  }

  const userRoles = session.user.roles || [];

  if (!userRoles.includes('super_admin')) {
    // If not a super_admin, redirect to their regular account page or show access denied
    // redirect('/account?error=Access Denied'); 
    return (
      <div className="text-center py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-red-500 mb-4">Access Denied</h1>
        <p className="text-primary-200 mb-6 text-lg">
          You do not have permission to access the superadmin dashboard.
        </p>
        <Link href="/account" className="inline-block bg-accent-500 text-primary-800 px-6 py-3 rounded-md hover:bg-accent-600 transition-colors">
          Go to My Account
        </Link>
      </div>
    );
  }

  // User is a super_admin, render the layout
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:gap-8">
        <aside className="md:w-1/4 lg:w-1/5 mb-8 md:mb-0">
          <SuperAdminNav />
        </aside>
        <main className="md:w-3/4 lg:w-4/5">
          {children}
        </main>
      </div>
    </div>
  );
}