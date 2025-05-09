"use server";

import { auth, signIn, signOut } from "./auth";
import {
  // getBookings, // Removed as it's related to old cabin bookings
  // updateUser as updateUserService, // Removed for now
  // createBooking as createBookingService, // Removed
  // deleteBooking as deleteBookingService, // Removed
  // updateBooking as updateBookingService, // Removed
  getMembershipById, // Added
  createOrder, // Added
  updateGym, // Added for updateGymProfileAction
  isUserAdminForGym, // Added for authorization checks
  createMembership, // Added for membership actions
  updateMembership, // Added for membership actions
  deleteMembership, // Added for membership actions
  updateOrderStatus, // Added for order actions
  createEvent, // Added for event actions
  updateEvent, // Added for event actions
  deleteEvent, // Added for event actions
  createGym, // Added for superadmin actions
  deleteGym, // Added for superadmin actions
  assignGymAdmin, // Added for superadmin actions
  removeGymAdmin, // Added for superadmin actions
  updateUser // Added for profile update action
} from "./data-service";
// import { supabase } from "./supabase"; // Removed Supabase
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserProfileAction(formData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in");

  const userId = session.user.id;
  const fullName = formData.get("fullName");

  // Basic validation
  if (!fullName || fullName.trim().length === 0) {
    return { error: "Full name cannot be empty." };
  }

  const updateData = { fullName: fullName.trim() };

  try {
    // Need to import updateUser from data-service
    await updateUser(userId, updateData);
    revalidatePath("/account/profile");
    // Also update the name in the session? NextAuth might handle this if configured,
    // or might need manual update trigger if name is used elsewhere from session.
    return { success: "Profile updated successfully." };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return { error: `Profile could not be updated: ${error.message}` };
  }
}

// Old booking/reservation actions (createBookingAction, deleteReservationAction, updateReservationAction) removed.

export async function createMembershipOrderAction(membershipId, gymId) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    // throw new Error("You must be logged in to create an order.");
    // Or redirect to login
    redirect("/login?message=Please log in to select a membership.");
    return; // Important to stop execution after redirect
  }

  const userId = session.user.id;

  try {
    const membership = await getMembershipById(membershipId);
    if (!membership) {
      throw new Error("Selected membership plan not found.");
    }

    if (membership.gymId !== gymId) {
      // This is a sanity check in case the client sends inconsistent data
      throw new Error("Membership does not belong to the specified gym.");
    }

    const orderData = {
      userId: userId,
      membershipId: membership.id,
      price_paid: membership.price,
      status: "pending_approval", // Initial status
      startDate: null, // Will be set upon approval
      endDate: null,   // Will be set upon approval
    };

    await createOrder(orderData);

    // Revalidate paths that might show orders or user's memberships
    revalidatePath("/account"); // A general account page
    revalidatePath(`/gyms/${gymId}`); // Revalidate the gym page itself
    // Potentially revalidate a specific "my orders" page if it exists

  } catch (error) {
    console.error("Failed to create membership order:", error);
    // Return a more user-friendly error message or object
    return { error: `Could not create order: ${error.message}` };
  }

  // Redirect to a confirmation page or user's account/orders page
  // For now, let's redirect to the user's account page
  redirect("/account?message=Order successfully placed for approval!");
}

export async function updateGymProfileAction(gymId, formData) {
  const session = await auth();
  // Authorization check: Allow superadmin OR specific gym admin
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a gym profile.");
  }
  const isSuperAdmin = session.user.roles?.includes('super_admin');
  const isAuthorizedGymAdmin = !isSuperAdmin && (await isUserAdminForGym(session.user.id, gymId));

  if (!isSuperAdmin && !isAuthorizedGymAdmin) {
     throw new Error("Unauthorized: You do not have permission to update this gym profile.");
  }

  const rawFormData = {
    name: formData.get("name"),
    address: formData.get("address"),
    contact_phone: formData.get("contact_phone"),
    contact_email: formData.get("contact_email"),
    facilities_description: formData.get("facilities_description"),
    // For JSON fields like opening_hours_json and photos_json,
    // the form needs to submit them as valid JSON strings, or handle parsing here.
    // For simplicity, let's assume opening_hours are submitted as individual day fields
    // and photos as a comma-separated list of URLs for now.
    // More complex forms might use client-side JS to construct the JSON.
  };

  // Example: Constructing opening_hours_json from individual day inputs
  const opening_hours = {};
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  let hasOpeningHoursData = false;
  days.forEach(day => {
    const hours = formData.get(`opening_hours_${day}`);
    if (hours) {
      opening_hours[day] = hours;
      hasOpeningHoursData = true;
    }
  });
  if(hasOpeningHoursData) rawFormData.opening_hours_json = JSON.stringify(opening_hours);
  else rawFormData.opening_hours_json = null; // Or keep existing if not provided

  // Example: Handling photos_json from a comma-separated string of URLs
  const photosString = formData.get("photos"); // Assuming a textarea input named "photos"
  if (photosString) {
    rawFormData.photos_json = JSON.stringify(photosString.split(',').map(url => url.trim()).filter(url => url));
  } else {
    rawFormData.photos_json = JSON.stringify([]); // Default to empty array if not provided
  }
  
  // Basic Validation (can be expanded with Zod or similar)
  if (!rawFormData.name) {
    return { error: "Gym name is required." };
  }
  if (rawFormData.contact_email && !/\S+@\S+\.\S+/.test(rawFormData.contact_email)) {
     return { error: "Invalid contact email format." };
  }

  try {
    await updateGym(gymId, rawFormData); // updateGym from data-service
    revalidatePath(`/gym-admin/${gymId}/dashboard/profile`);
    revalidatePath(`/gyms/${gymId}`); // Revalidate public gym page
    return { success: "Gym profile updated successfully." };
  } catch (error) {
    console.error("Failed to update gym profile:", error);
    return { error: `Could not update gym profile: ${error.message}` };
  }
}

// Membership Actions
export async function createMembershipAction(gymId, formData) {
  const session = await auth();
  // Authorization check: Allow superadmin OR specific gym admin
  if (!session?.user?.id) {
    throw new Error("You must be logged in.");
  }
  const isSuperAdmin = session.user.roles?.includes('super_admin');
  const isAuthorizedGymAdmin = !isSuperAdmin && (await isUserAdminForGym(session.user.id, gymId));

  if (!isSuperAdmin && !isAuthorizedGymAdmin) {
     throw new Error("Unauthorized: You do not have permission to add memberships to this gym.");
  }

  const membershipData = {
    gymId: gymId,
    name: formData.get("name"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price")),
    duration: formData.get("duration"),
    duration_days: parseInt(formData.get("duration_days"), 10) || null, // Ensure it's a number or null
  };

  // Basic Validation
  if (!membershipData.name || !membershipData.price || isNaN(membershipData.price)) {
    return { error: "Membership name and a valid price are required." };
  }
  if (membershipData.duration_days && isNaN(membershipData.duration_days)) {
     return { error: "Duration (days) must be a valid number if provided." };
  }

  try {
    await createMembership(membershipData);
    revalidatePath(`/gym-admin/${gymId}/dashboard/memberships`);
    revalidatePath(`/gyms/${gymId}`); // Revalidate public page
    return { success: "Membership created successfully." };
  } catch (error) {
    console.error("Failed to create membership:", error);
    return { error: `Could not create membership: ${error.message}` };
  }
}

export async function updateMembershipAction(membershipId, gymId, formData) {
  const session = await auth();
  // Authorization check: Allow superadmin OR specific gym admin
  if (!session?.user?.id) {
    throw new Error("You must be logged in.");
  }
  const isSuperAdmin = session.user.roles?.includes('super_admin');
  const isAuthorizedGymAdmin = !isSuperAdmin && (await isUserAdminForGym(session.user.id, gymId));

  if (!isSuperAdmin && !isAuthorizedGymAdmin) {
     throw new Error("Unauthorized: You do not have permission to update memberships for this gym.");
  }

  const updatedFields = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price")),
    duration: formData.get("duration"),
    duration_days: parseInt(formData.get("duration_days"), 10) || null,
  };

  // Basic Validation
  if (!updatedFields.name || !updatedFields.price || isNaN(updatedFields.price)) {
    return { error: "Membership name and a valid price are required." };
  }
   if (updatedFields.duration_days && isNaN(updatedFields.duration_days)) {
     return { error: "Duration (days) must be a valid number if provided." };
  }

  try {
    await updateMembership(membershipId, updatedFields);
    revalidatePath(`/gym-admin/${gymId}/dashboard/memberships`);
    revalidatePath(`/gyms/${gymId}`);
    return { success: "Membership updated successfully." };
  } catch (error) {
    console.error(`Failed to update membership ${membershipId}:`, error);
    return { error: `Could not update membership: ${error.message}` };
  }
}

export async function deleteMembershipAction(membershipId, gymId) {
  const session = await auth();
  // Authorization check: Allow superadmin OR specific gym admin
  if (!session?.user?.id) {
    throw new Error("You must be logged in.");
  }
  const isSuperAdmin = session.user.roles?.includes('super_admin');
  const isAuthorizedGymAdmin = !isSuperAdmin && (await isUserAdminForGym(session.user.id, gymId));

  if (!isSuperAdmin && !isAuthorizedGymAdmin) {
     throw new Error("Unauthorized: You do not have permission to delete memberships for this gym.");
  }

  try {
    await deleteMembership(membershipId);
    revalidatePath(`/gym-admin/${gymId}/dashboard/memberships`);
    revalidatePath(`/gyms/${gymId}`);
    return { success: "Membership deleted successfully." };
  } catch (error) {
    console.error(`Failed to delete membership ${membershipId}:`, error);
    return { error: `Could not delete membership: ${error.message}` };
  }
}
// End Membership Actions

// Order Actions
export async function updateOrderStatusAction(orderId, newStatus, gymId) {
  const session = await auth();
  // Authorization check: Allow superadmin OR specific gym admin
  if (!session?.user?.id) {
    throw new Error("You must be logged in.");
  }
  const isSuperAdmin = session.user.roles?.includes('super_admin');
  const isAuthorizedGymAdmin = !isSuperAdmin && (await isUserAdminForGym(session.user.id, gymId));

  if (!isSuperAdmin && !isAuthorizedGymAdmin) {
     throw new Error("Unauthorized: You do not have permission to manage orders for this gym.");
  }

  if (!['active', 'cancelled'].includes(newStatus)) {
    return { error: "Invalid target status provided." };
  }

  let startDate = null;
  let endDate = null;

  if (newStatus === 'active') {
    // Fetch membership details to get duration
    // Need to get the order first to find the membershipId
    // This could be optimized by passing membershipId/duration_days directly,
    // but fetching ensures data integrity.
    let order;
    try {
      // We need a getOrderById function
      // For now, let's assume we fetch it or have the necessary info.
      // Placeholder: Fetch order details including membershipId
      // const order = await getOrderById(orderId);
      // const membership = await getMembershipById(order.membershipId);
      
      // *** TEMPORARY PLACEHOLDER LOGIC ***
      // Assume we know the membership duration (e.g., 30 days) for now
      // Replace this with actual fetching logic later
      const membership = await getMembershipByIdFromOrder(orderId); // Need this function
      if (!membership || !membership.duration_days) {
          throw new Error('Could not determine membership duration to activate order.');
      }
      // *** END PLACEHOLDER ***

      startDate = new Date(); // Set start date to today
      endDate = new Date();
      endDate.setDate(startDate.getDate() + membership.duration_days);
      
      // Format dates for SQL (YYYY-MM-DD)
      const formatDate = (date) => date.toISOString().split('T')[0];
      startDate = formatDate(startDate);
      endDate = formatDate(endDate);

    } catch (fetchError) {
       console.error("Error fetching details to activate order:", fetchError);
       return { error: `Could not activate order: ${fetchError.message}` };
    }
  }
  // If status is 'cancelled', startDate and endDate remain null

  try {
    await updateOrderStatus(orderId, newStatus, startDate, endDate);
    revalidatePath(`/gym-admin/${gymId}/dashboard/orders`);
    // Also revalidate user's account page if they might see the change
    // Need userId for this - could fetch order again or pass userId if needed
    // revalidatePath(`/account`);
    return { success: `Order status updated to ${newStatus}.` };
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error);
    return { error: `Could not update order status: ${error.message}` };
  }
}
// End Order Actions

// Event Actions
export async function createEventAction(gymId, formData) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !(await isUserAdminForGym(session.user.id, gymId))) {
     throw new Error("Unauthorized: You do not have permission to create events for this gym.");
  }

  const eventData = {
    gymId: gymId,
    title: formData.get("title"),
    description: formData.get("description"),
    event_date_time: formData.get("event_date_time"), // Ensure this is a valid date/time string format for DB
    location_details: formData.get("location_details"),
    created_by_gym_admin_id: session.user.id,
  };

  // Basic Validation
  if (!eventData.title || !eventData.event_date_time) {
    return { error: "Event title and date/time are required." };
  }
  // Add date validation if needed
  try {
     new Date(eventData.event_date_time); // Check if date is parseable
  } catch(e) {
     return { error: "Invalid date/time format." };
  }


  try {
    // Need to import createEvent from data-service
    await createEvent(eventData);
    revalidatePath(`/gym-admin/${gymId}/dashboard/events`);
    revalidatePath(`/gyms/${gymId}/social`); // Revalidate public social page
    return { success: "Event created successfully." };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { error: `Could not create event: ${error.message}` };
  }
}

export async function updateEventAction(eventId, gymId, formData) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !(await isUserAdminForGym(session.user.id, gymId))) {
     throw new Error("Unauthorized: You do not have permission to update events for this gym.");
  }

  const updatedFields = {
    title: formData.get("title"),
    description: formData.get("description"),
    event_date_time: formData.get("event_date_time"),
    location_details: formData.get("location_details"),
  };

  // Basic Validation
  if (!updatedFields.title || !updatedFields.event_date_time) {
    return { error: "Event title and date/time are required." };
  }
   try {
     new Date(updatedFields.event_date_time); // Check if date is parseable
  } catch(e) {
     return { error: "Invalid date/time format." };
  }

  try {
    // Need to import updateEvent from data-service
    await updateEvent(eventId, updatedFields);
    revalidatePath(`/gym-admin/${gymId}/dashboard/events`);
    revalidatePath(`/gyms/${gymId}/social`);
    return { success: "Event updated successfully." };
  } catch (error) {
    console.error(`Failed to update event ${eventId}:`, error);
    return { error: `Could not update event: ${error.message}` };
  }
}

export async function deleteEventAction(eventId, gymId) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !(await isUserAdminForGym(session.user.id, gymId))) {
     throw new Error("Unauthorized: You do not have permission to delete events for this gym.");
  }

  try {
    // Need to import deleteEvent from data-service
    await deleteEvent(eventId);
    revalidatePath(`/gym-admin/${gymId}/dashboard/events`);
    revalidatePath(`/gyms/${gymId}/social`);
    return { success: "Event deleted successfully." };
  } catch (error) {
    console.error(`Failed to delete event ${eventId}:`, error);
    return { error: `Could not delete event: ${error.message}` };
  }
}
// End Event Actions

// Superadmin Gym Actions
export async function createGymAction(formData) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !session.user.roles?.includes('super_admin')) {
     throw new Error("Unauthorized: Only superadmins can create gyms.");
  }

  // Similar data handling as updateGymProfileAction, but for creation
  const gymData = {
    name: formData.get("name"),
    address: formData.get("address"),
    contact_phone: formData.get("contact_phone"),
    contact_email: formData.get("contact_email"),
    facilities_description: formData.get("facilities_description"),
    created_by_superadmin_id: session.user.id, // Record who created it
  };

  // Handle JSON fields (simplified example, assumes basic inputs)
  const opening_hours = {};
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  let hasOpeningHoursData = false;
  days.forEach(day => {
    const hours = formData.get(`opening_hours_${day}`);
    if (hours) {
      opening_hours[day] = hours;
      hasOpeningHoursData = true;
    }
  });
  gymData.opening_hours_json = hasOpeningHoursData ? JSON.stringify(opening_hours) : null;

  const photosString = formData.get("photos");
  gymData.photos_json = photosString ? JSON.stringify(photosString.split(',').map(url => url.trim()).filter(url => url)) : JSON.stringify([]);

  // Validation
  if (!gymData.name) {
    return { error: "Gym name is required." };
  }

  try {
    await createGym(gymData);
    revalidatePath('/superadmin/dashboard/gyms');
    revalidatePath('/'); // Revalidate homepage gym list
    return { success: "Gym created successfully." };
  } catch (error) {
    console.error("Failed to create gym:", error);
    return { error: `Could not create gym: ${error.message}` };
  }
}

export async function deleteGymAction(gymId) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !session.user.roles?.includes('super_admin')) {
     throw new Error("Unauthorized: Only superadmins can delete gyms.");
  }

  try {
    await deleteGym(gymId);
    revalidatePath('/superadmin/dashboard/gyms');
    revalidatePath('/'); // Revalidate homepage gym list
    // Also revalidate specific gym page if it exists? Might be overkill or handled by 404.
    // revalidatePath(`/gyms/${gymId}`);
    return { success: "Gym deleted successfully." };
  } catch (error) {
    console.error(`Failed to delete gym ${gymId}:`, error);
    return { error: `Could not delete gym: ${error.message}` };
  }
}
// End Superadmin Gym Actions

// Superadmin - Gym Admin Management Actions
export async function assignGymAdminAction(userId, gymId) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !session.user.roles?.includes('super_admin')) {
     throw new Error("Unauthorized: Only superadmins can assign gym admins.");
  }
  
  // TODO: Optional - Check if the target user actually exists and has the 'gym_admin' role in UserRoles table first.
  // This prevents assigning non-admins or non-existent users to gyms.

  try {
    await assignGymAdmin(userId, gymId);
    revalidatePath('/superadmin/dashboard/admins'); // Revalidate the admin management page
    // Optionally revalidate the user's account page if they might see changes there
    // revalidatePath(`/account`);
    return { success: "Gym admin assigned successfully." };
  } catch (error) {
    console.error(`Failed to assign gym admin (User: ${userId}, Gym: ${gymId}):`, error);
    return { error: `Could not assign gym admin: ${error.message}` };
  }
}

export async function removeGymAdminAction(userId, gymId) {
  const session = await auth();
  // Authorization check
  if (!session?.user?.id || !session.user.roles?.includes('super_admin')) {
     throw new Error("Unauthorized: Only superadmins can remove gym admins.");
  }

  try {
    const result = await removeGymAdmin(userId, gymId);
    revalidatePath('/superadmin/dashboard/admins');
    // revalidatePath(`/account`);
    return { success: result.message }; // Return message from data service
  } catch (error) {
    console.error(`Failed to remove gym admin (User: ${userId}, Gym: ${gymId}):`, error);
    return { error: `Could not remove gym admin: ${error.message}` };
  }
}
// End Superadmin - Gym Admin Management Actions

// Need to import updateUser from data-service at the top

// Helper function needed for the placeholder logic above
// TODO: Implement this properly or refactor action
async function getMembershipByIdFromOrder(orderId) {
    // Placeholder implementation - requires a proper getOrderById function first
    console.warn("Using placeholder getMembershipByIdFromOrder - Implement properly!");
    // Example: Fetch order, then fetch membership
    // const [orderRows] = await pool.query('SELECT membershipId FROM Orders WHERE id = ?', [orderId]);
    // if (!orderRows || orderRows.length === 0) return null;
    // return await getMembershipById(orderRows[0].membershipId);
    return { duration_days: 30 }; // Dummy return
}


// Need to import createEvent, updateEvent, deleteEvent from data-service at the top
// import bcrypt from 'bcryptjs'; // Removed temporary import

export async function signInAction() {
  // Removed temporary hash generation code

  // This action currently attempts Google sign-in.
  // It might need to be removed or adapted if only Credentials provider is used.
  // For now, leaving the Google sign-in attempt as placeholder.
  // Consider commenting out or providing a placeholder if Google auth is fully disabled.
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
