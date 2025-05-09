"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/app/_lib/actions";
// import { toast } from "react-hot-toast";

function OrderRow({ order, gymId, onStatusUpdate }) {
  const [isApproving, startApproveTransition] = useTransition();
  const [isRejecting, startRejectTransition] = useTransition();

  const handleApprove = () => {
    startApproveTransition(async () => {
      const result = await updateOrderStatusAction(order.id, "active", gymId);
      if (result?.error) {
        alert(`Error approving order: ${result.error}`);
        // toast.error(`Error approving order: ${result.error}`);
      } else {
        // toast.success("Order approved and activated.");
        if (onStatusUpdate) onStatusUpdate();
      }
    });
  };

  const handleReject = () => {
    if (confirm(`Are you sure you want to reject this order for ${order.userName}?`)) {
      startRejectTransition(async () => {
        const result = await updateOrderStatusAction(order.id, "cancelled", gymId);
        if (result?.error) {
          alert(`Error rejecting order: ${result.error}`);
          // toast.error(`Error rejecting order: ${result.error}`);
        } else {
          // toast.success("Order rejected.");
          if (onStatusUpdate) onStatusUpdate();
        }
      });
    }
  };

  const isPendingAction = isApproving || isRejecting;

  return (
    <tr className="border-b border-primary-800 hover:bg-primary-800">
      <td className="px-4 py-3 text-sm text-primary-300">{new Date(order.orderDate).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-primary-200">{order.userName} ({order.userEmail})</td>
      <td className="px-4 py-3 text-primary-200">{order.membershipName}</td>
      <td className="px-4 py-3 text-primary-100 font-semibold">${parseFloat(order.price_paid).toFixed(2)}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          order.status === 'pending_approval' ? 'bg-yellow-500 text-yellow-900' :
          order.status === 'active' ? 'bg-green-500 text-green-900' :
          'bg-red-500 text-red-900'
        }`}>
          {order.status.replace("_", " ").toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-primary-300">{order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-primary-300">{order.endDate ? new Date(order.endDate).toLocaleDateString() : 'N/A'}</td>
      <td className="px-4 py-3 text-right">
        {order.status === "pending_approval" && (
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleApprove}
              disabled={isPendingAction}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>
            <button
              onClick={handleReject}
              disabled={isPendingAction}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function OrderList({ gymId, initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders);

  // No client-side refetch; rely on server revalidation and page reload for now

  return (
    <div className="overflow-x-auto bg-primary-900 rounded-lg shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-primary-800 text-left">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Order Date</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Client</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Membership</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Start Date</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">End Date</th>
            <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-800">
          {orders.length > 0 ? (
            orders.map(order => (
              <OrderRow key={order.id} order={order} gymId={gymId} onStatusUpdate={null} />
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-6 text-primary-400">No orders found for this gym.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}