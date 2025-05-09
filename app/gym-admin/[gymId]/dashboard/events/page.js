import { getGymEvents } from "@/app/_lib/data-service";
import CreateEventForm from "@/app/_components/gym-admin/CreateEventForm";
import EventList from "@/app/_components/gym-admin/EventList";

export default async function ManageEventsPage({ params }) {
  const { gymId } = params;
  let initialEvents = [];
  let fetchError = null;
  try {
    initialEvents = await getGymEvents(gymId);
  } catch (err) {
    console.error("Failed to load initial events:", err);
    fetchError = err.message || "Failed to load events.";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Manage Events</h1>
      {/* Render CreateEventForm Client Component */}
      <CreateEventForm gymId={gymId} onSuccess={null} />

      {/* Render EventList Client Component */}
      {fetchError ? (
        <p className="text-red-500 mt-8">Error loading events: {fetchError}</p>
      ) : (
        <EventList gymId={gymId} initialEvents={initialEvents} />
      )}
    </div>
  );
}