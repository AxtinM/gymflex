import { 
  getTotalUserCount, 
  getTotalGymCount, 
  getTotalActiveMembershipCount 
} from "@/app/_lib/data-service";

export const metadata = {
  title: "Site Analytics",
};

// Helper component for displaying a stat card
function StatCard({ title, value, isLoading, error }) {
  let displayValue = "-";
  if (isLoading) displayValue = "...";
  if (error) displayValue = "Error";
  if (!isLoading && !error) displayValue = value;

  return (
     <div className="bg-primary-800 p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-accent-500 mb-2">{title}</h3>
      <p className={`text-4xl font-bold text-primary-100 ${error ? 'text-red-500' : ''}`}>
        {displayValue}
      </p>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export default async function SiteAnalyticsPage() {
  // Fetch stats concurrently
  let userCount = 0, gymCount = 0, activeMembershipCount = 0;
  let userError, gymError, membershipError;
  let isLoading = true; // Assume loading initially

  try {
    const [userResult, gymResult, membershipResult] = await Promise.allSettled([
      getTotalUserCount(),
      getTotalGymCount(),
      getTotalActiveMembershipCount()
    ]);

    if (userResult.status === 'fulfilled') userCount = userResult.value;
    else userError = userResult.reason?.message || "Failed to load";

    if (gymResult.status === 'fulfilled') gymCount = gymResult.value;
    else gymError = gymResult.reason?.message || "Failed to load";

    if (membershipResult.status === 'fulfilled') activeMembershipCount = membershipResult.value;
    else membershipError = membershipResult.reason?.message || "Failed to load";
    
  } catch (error) {
      // This catch block might not be strictly necessary with Promise.allSettled
      // but good for catching unexpected issues.
      console.error("Unexpected error fetching analytics:", error);
      userError = userError || "Unexpected error";
      gymError = gymError || "Unexpected error";
      membershipError = membershipError || "Unexpected error";
  } finally {
      isLoading = false; // Set loading to false regardless of outcome
  }


  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">
        Site Analytics Overview
      </h1>
      <p className="text-lg text-primary-300 mb-8">
        A quick glance at the platform's key metrics.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <StatCard 
            title="Total Registered Users" 
            value={userCount} 
            isLoading={isLoading} 
            error={userError} 
         />
         <StatCard 
            title="Total Registered Gyms" 
            value={gymCount} 
            isLoading={isLoading} 
            error={gymError} 
         />
         <StatCard 
            title="Active Memberships" 
            value={activeMembershipCount} 
            isLoading={isLoading} 
            error={membershipError} 
         />
         {/* Add more stat cards here as needed */}
      </div>
    </div>
  );
}