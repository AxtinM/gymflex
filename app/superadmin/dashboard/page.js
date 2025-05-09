// Placeholder page for the Superadmin Dashboard home

export const metadata = {
  title: "Superadmin Dashboard",
};

export default function SuperAdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">
        Superadmin Dashboard
      </h1>
      <p className="text-lg text-primary-300 mb-4">
        Welcome, Superadmin! This is the central control panel for managing the entire GymFlex platform.
      </p>
      <p className="text-primary-300">
        Use the navigation menu to manage gyms, gym administrators, and view site analytics.
      </p>
      
      {/* Placeholder for key site statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-primary-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-accent-500 mb-2">Total Gyms</h3>
          <p className="text-3xl font-bold text-primary-100">0</p> {/* TODO: Fetch actual data */}
        </div>
        <div className="bg-primary-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-accent-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary-100">0</p> {/* TODO: Fetch actual data */}
        </div>
        <div className="bg-primary-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-accent-500 mb-2">Active Memberships</h3>
          <p className="text-3xl font-bold text-primary-100">0</p> {/* TODO: Fetch actual data */}
        </div>
      </div>
    </div>
  );
}