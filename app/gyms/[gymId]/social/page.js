import { auth } from "@/app/_lib/auth";
import { getGymEvents, checkActiveMembership, getGymById } from "@/app/_lib/data-service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation"; // For redirecting

function EventCard({ event }) {
  return (
    <div className="bg-primary-800 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-accent-500 mb-2">{event.title}</h3>
      <p className="text-sm text-primary-400 mb-1">
        Date: {new Date(event.event_date_time).toLocaleString()}
      </p>
      {event.location_details && <p className="text-sm text-primary-400 mb-3">Location: {event.location_details}</p>}
      <p className="text-primary-300 whitespace-pre-line">{event.description || "No further details."}</p>
    </div>
  );
}

export async function generateMetadata({ params }) {
  try {
    const gym = await getGymById(params.gymId); // Fetch gym name for title
    if (!gym) return { title: "Gym Socials Not Found" };
    return {
      title: `${gym.name} - Social Hub & Events`,
      description: `Upcoming events and social activities for ${gym.name}.`,
    };
  } catch (error) {
    return { title: "Error Loading Gym Socials" };
  }
}

export default async function GymSocialPage({ params }) {
  const { gymId } = params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?message=Please log in to view gym socials&redirectTo=/gyms/${gymId}/social`);
  }

  const userId = session.user.id;
  const hasActiveMembership = await checkActiveMembership(userId, gymId);

  if (!hasActiveMembership) {
    return (
      <div className="text-center py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-red-500 mb-4">Access Denied</h1>
        <p className="text-primary-200 mb-6 text-lg">
          You need an active membership for this gym to view its social hub and events.
        </p>
        <Link href={`/gyms/${gymId}`} className="inline-block bg-accent-500 text-primary-800 px-6 py-3 rounded-md hover:bg-accent-600 transition-colors mr-4">
          View Gym Details
        </Link>
        <Link href="/account" className="inline-block bg-primary-700 text-primary-100 px-6 py-3 rounded-md hover:bg-primary-600 transition-colors">
          My Memberships
        </Link>
      </div>
    );
  }

  // Fetch gym name for display (optional, could also pass from previous page or rely on metadata)
  let gymName = "This Gym"; 
  try {
    const gym = await getGymById(gymId);
    if (gym) gymName = gym.name;
  } catch(e) { /* ignore, use default name */ }


  const events = await getGymEvents(gymId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-accent-500 mb-3">Social Hub for {gymName}</h1>
      <p className="text-lg text-primary-300 mb-8">Welcome! Here are the latest events and updates.</p>

      {events && events.length > 0 ? (
        <div className="space-y-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-primary-800 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-primary-100 mb-3">No Events Yet</h2>
          <p className="text-primary-400">There are currently no events scheduled for this gym. Please check back later!</p>
        </div>
      )}
    </div>
  );
}