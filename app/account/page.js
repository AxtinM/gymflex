console.log("Loaded account/page.js");
import { auth } from "@/app/_lib/auth";
import { getUserOrders, getAdministeredGyms } from "@/app/_lib/data-service"; // Added getAdministeredGyms
import Link from "next/link";

// Component for Admin Links Section
async function AdminDashboardLinks({ userId, roles }) {
  let administeredGyms = [];
  const isSuperAdmin = roles.includes('super_admin');
  const isGymAdmin = roles.includes('gym_admin');

  if (isGymAdmin) {
    try {
      administeredGyms = await getAdministeredGyms(userId);
    } catch (error) {
      console.error("Failed to load administered gyms for account page:", error);
      // Handle error gracefully, maybe show a message
    }
  }

  if (!isSuperAdmin && !isGymAdmin) {
    return null; // No admin roles, don't render anything
  }

  return (
    <div className="mb-10 p-6 bg-primary-800 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-accent-400 mb-4">Admin Access</h2>
      {isSuperAdmin && (
        <div className="mb-4">
          <Link href="/superadmin/dashboard" className="inline-block bg-accent-600 text-primary-800 px-5 py-2 rounded-md hover:bg-accent-700 transition-colors font-semibold">
            Go to Superadmin Dashboard
          </Link>
        </div>
      )}
      {isGymAdmin && administeredGyms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-primary-200 mb-2">Manage Your Gyms:</h3>
          <ul className="space-y-1">
            {administeredGyms.map(gym => (
              <li key={gym.id}>
                <Link href={`/gym-admin/${gym.id}/dashboard`} className="text-primary-300 hover:text-accent-400 transition-colors">
                  &rarr; {gym.name} Dashboard
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
       {isGymAdmin && administeredGyms.length === 0 && (
         <p className="text-primary-400">You are a gym admin but currently not assigned to manage any specific gyms.</p>
       )}
    </div>
  );
}


function OrderCard({ order }) {
  const { status } = order;
  let statusClass = "bg-yellow-500"; // pending_approval
  if (status === "active") statusClass = "bg-green-500";
  if (status === "expired" || status === "cancelled") statusClass = "bg-red-500";

  return (
    <div className="bg-primary-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-accent-500">{order.membershipName}</h3>
        <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${statusClass}`}>
          {status.replace("_", " ").toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-primary-300 mb-1">Gym: {order.gymName}</p>
      <p className="text-sm text-primary-300 mb-1">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
      {order.startDate && <p className="text-sm text-primary-300 mb-1">Start Date: {new Date(order.startDate).toLocaleDateString()}</p>}
      {order.endDate && <p className="text-sm text-primary-300 mb-1">End Date: {new Date(order.endDate).toLocaleDateString()}</p>}
      <p className="text-lg font-semibold text-primary-100 mt-2">Price: ${parseFloat(order.price_paid).toFixed(2)}</p>
      
      {order.status === "active" && (
        // Removed inner <a> tag and applied classes to Link
        <Link
          href={`/gyms/${order.gymId}/social`}
          className="mt-4 inline-block bg-accent-600 text-primary-800 text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent-700 transition-colors"
        >
          Go to Gym Social Page
        </Link>
      )}
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    // This should ideally be caught by middleware protecting the /account route
    // For now, redirect or show message if somehow accessed without session
    // redirect("/login?message=Please log in to view your account.");
    return (
      <div className="text-center py-10">
        <p className="text-xl text-primary-200">Please log in to view your account details.</p>
        <Link href="/login" className="mt-4 inline-block bg-accent-500 px-6 py-3 rounded-md text-lg font-semibold hover:bg-accent-600 transition-all">
          Login
        </Link>
      </div>
    );
  }

  const userId = session.user.id;
  const userRoles = session.user.roles || []; // Get roles from session
  const orders = await getUserOrders(userId);

  // Check for query param message (e.g., after order placement)
  // This is a simple way, a more robust solution might use toasts/notifications
  // const searchParams = useSearchParams(); // Only in Client Components
  // const message = searchParams.get('message'); 

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-accent-500 mb-8">My Account</h1>
      
      {/* {message && <p className="mb-4 p-3 bg-green-600 text-white rounded-md">{message}</p>} */}

      {/* Admin Links Section */}
      <AdminDashboardLinks userId={userId} roles={userRoles} />

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-primary-100 mb-2">Welcome, {session.user.name || "User"}!</h2>
        <p className="text-primary-300">Here you can view your membership orders and their status.</p>
        {/* Link to profile edit page can be added here later */}
        {/* <Link href="/account/profile" className="text-accent-400 hover:text-accent-300">Edit Profile</Link> */}
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-primary-100 mb-6">My Membership Orders</h2>
        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <p className="text-primary-400 text-lg">You have not placed any membership orders yet.</p>
        )}
      </div>
    </div>
  );
}
