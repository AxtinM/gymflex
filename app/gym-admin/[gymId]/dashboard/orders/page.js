import { getGymOrders } from "@/app/_lib/data-service";
import OrderList from "@/app/_components/gym-admin/OrderList";

export default async function ManageOrdersPage({ params }) {
  const { gymId } = params;
  let initialOrders = [];
  let fetchError = null;
  try {
    initialOrders = await getGymOrders(gymId);
  } catch (err) {
    console.error("Failed to load initial orders:", err);
    fetchError = err.message || "Failed to load orders.";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Manage Client Orders</h1>
      {fetchError ? (
        <p className="text-red-500 mt-8">Error loading orders: {fetchError}</p>
      ) : (
        <OrderList gymId={gymId} initialOrders={initialOrders} />
      )}
    </div>
  );
}