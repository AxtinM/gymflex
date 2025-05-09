"use client";

import { useState, useTransition } from 'react';
import { deleteEventAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

function EventListItem({ event, gymId, onDeleteSuccess }) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      startDeleteTransition(async () => {
        const result = await deleteEventAction(event.id, gymId);
        if (result?.error) {
          alert(`Error deleting event: ${result.error}`);
          // toast.error(`Error deleting event: ${result.error}`);
        } else {
          // toast.success("Event deleted.");
          if (onDeleteSuccess) onDeleteSuccess();
        }
      });
    }
  };

  return (
    <div className="bg-primary-800 p-6 rounded-lg shadow flex justify-between items-start gap-4">
      <div>
        <h3 className="text-2xl font-semibold text-accent-500 mb-2">{event.title}</h3>
        <p className="text-sm text-primary-400 mb-1">
          Date: {new Date(event.event_date_time).toLocaleString()}
        </p>
        {event.location_details && <p className="text-sm text-primary-400 mb-3">Location: {event.location_details}</p>}
        <p className="text-primary-300 whitespace-pre-line">{event.description || "No further details."}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
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

export default function EventList({ gymId, initialEvents = [] }) {
  const [events, setEvents] = useState(initialEvents);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-primary-100 mb-4">Upcoming & Past Events</h2>
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map(event => (
            <EventListItem
              key={event.id}
              event={event}
              gymId={gymId}
              onDeleteSuccess={null}
            />
          ))}
        </div>
      ) : (
        <p className="text-primary-400">No events have been created for this gym yet.</p>
      )}
    </div>
  );
}