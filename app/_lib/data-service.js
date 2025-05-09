import { notFound } from "next/navigation";
import { eachDayOfInterval, formatISO } from "date-fns";
import { pool } from './db'; // Import the MySQL pool

/////////////
// GET

export async function getCabin(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM cabins WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      notFound(); // Triggers Next.js not-found page
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to get cabin:', error);
    throw new Error(`Cabin with id ${id} could not be loaded`);
  }
}

export async function getCabinPrice(id) {
  try {
    const [rows] = await pool.query('SELECT regularPrice, discount FROM cabins WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return null; // Or throw an error if a cabin price is always expected
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to get cabin price:', error);
    throw new Error('Cabin price could not be loaded');
  }
}

export const getCabins = async function () {
  try {
    const [rows] = await pool.query('SELECT id, name, maxCapacity, regularPrice, discount, image FROM cabins ORDER BY name');
    return rows;
  } catch (error) {
    console.error('Failed to get cabins:', error);
    throw new Error('Cabins could not be loaded');
  }
};

export async function getAllGyms() {
  try {
    // Select fields relevant for a listing page, fetch raw photos_json
    const [rows] = await pool.query(
      'SELECT id, name, address, SUBSTRING(facilities_description, 1, 100) AS short_description, photos_json FROM Gyms ORDER BY name'
    );
    
    // Process photos_json in JavaScript
    return rows.map(row => {
      let main_image = null;
      if (row.photos_json) {
        try {
          // photos_json might be a string or already parsed by the driver depending on DB/driver.
          // If it's a string, parse it. If it's an object/array, use it directly.
          const photos = typeof row.photos_json === 'string' ? JSON.parse(row.photos_json) : row.photos_json;
          if (Array.isArray(photos) && photos.length > 0 && typeof photos[0] === 'string') {
            main_image = photos[0];
          }
        } catch (e) {
          console.error(`Error parsing photos_json for gym ID ${row.id}:`, e, "Raw data:", row.photos_json);
          // main_image remains null if parsing fails or structure is unexpected
        }
      }
      return {
        id: row.id,
        name: row.name,
        address: row.address,
        short_description: row.short_description || "", // Ensure short_description is not null
        main_image: main_image,
        // We don't need to pass the full photos_json string to the client for the listing
      };
    });
  } catch (error) {
    console.error('Failed to get all gyms:', error);
    throw new Error('Gyms could not be loaded');
  }
}

export async function getGymById(gymId) {
  try {
    // Fetch gym details
    const [gymRows] = await pool.query('SELECT * FROM Gyms WHERE id = ?', [gymId]);

    if (!gymRows || gymRows.length === 0) {
      // Or use Next.js notFound() if this page should 404
      throw new Error(`Gym with id ${gymId} not found`);
    }
    const gymData = gymRows[0];

    // Parse JSON fields safely
    let photos = [];
    if (gymData.photos_json) {
      try {
        const parsedPhotos = typeof gymData.photos_json === 'string' ? JSON.parse(gymData.photos_json) : gymData.photos_json;
        if (Array.isArray(parsedPhotos)) {
          photos = parsedPhotos.filter(p => typeof p === 'string');
        }
      } catch (e) {
        console.error(`Error parsing photos_json for gym ID ${gymId}:`, e);
      }
    }

    let opening_hours = null;
    if (gymData.opening_hours_json) {
      try {
        opening_hours = typeof gymData.opening_hours_json === 'string' ? JSON.parse(gymData.opening_hours_json) : gymData.opening_hours_json;
      } catch (e) {
        console.error(`Error parsing opening_hours_json for gym ID ${gymId}:`, e);
      }
    }
    
    // Fetch associated memberships
    const [membershipRows] = await pool.query('SELECT * FROM Memberships WHERE gymId = ? ORDER BY price', [gymId]);

    return {
      ...gymData,
      photos_json: undefined, // Remove raw json string
      opening_hours_json: undefined, // Remove raw json string
      photos: photos, // Parsed array of photo URLs
      opening_hours: opening_hours, // Parsed opening hours object
      memberships: membershipRows || [],
    };

  } catch (error) {
    console.error(`Failed to get gym by id ${gymId}:`, error);
    // Re-throw or handle as appropriate for the page (e.g., could lead to a 404 or error page)
    throw new Error(`Gym with id ${gymId} could not be loaded`);
  }
}

// Renamed from getGuest to getUserByEmail for clarity with users table
export async function getUserByEmail(email) {
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]); // Changed 'users' to 'Users'
    return rows[0] || null; // Return null if no user found, handled by auth logic
  } catch (error) {
    console.error('Failed to get user by email:', error);
    throw new Error('User could not be loaded');
  }
}

export async function getBooking(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      throw new Error(`Booking with id ${id} not found`);
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to get booking:', error);
    throw new Error('Booking could not be loaded');
  }
}

export async function getBookings(guestId) {
  try {
    const query = `
      SELECT 
        b.id, b.createdAt, b.startDate, b.endDate, b.numNights, 
        b.numGuests, b.totalPrice, b.guestId, b.cabinId, 
        c.name AS cabinName, c.image AS cabinImage 
      FROM bookings b 
      JOIN cabins c ON b.cabinId = c.id 
      WHERE b.guestId = ? 
      ORDER BY b.startDate
    `;
    const [rows] = await pool.query(query, [guestId]);
    // Transform to match expected structure if needed by components, e.g., nested cabin object
    // For now, returning flat structure with cabinName and cabinImage
    return rows.map(row => ({
      ...row,
      cabins: { name: row.cabinName, image: row.cabinImage } // Reconstruct nested structure
    }));
  } catch (error) {
    console.error('Failed to get bookings:', error);
    throw new Error('Bookings could not be loaded');
  }
}

export async function getBookedDatesByCabinId(cabinId) {
  try {
    // Get dates from today onwards
    const today = formatISO(new Date(), { representation: 'date' });

    const query = `
      SELECT startDate, endDate 
      FROM bookings 
      WHERE cabinId = ? AND (endDate >= ? OR status = 'checked-in') 
    `;
    // Note: Supabase had `startDate.gte.${today}`. For SQL, it's `endDate >= ?` to include ongoing bookings.
    // Or, if only future bookings matter: `startDate >= ?`
    // The original logic was `startDate.gte.${today},status.eq.checked-in`.
    // Let's refine to: bookings that haven't ended yet OR are currently checked-in.
    // A booking is relevant if its endDate is in the future OR it's currently 'checked-in'.
    // For simplicity, let's consider bookings whose endDate is from today onwards.
    const [rows] = await pool.query(query, [cabinId, today]);

    const bookedDates = rows
      .map((booking) => {
        return eachDayOfInterval({
          start: new Date(booking.startDate),
          end: new Date(booking.endDate),
        });
      })
      .flat();

    return bookedDates;
  } catch (error) {
    console.error('Failed to get booked dates:', error);
    throw new Error('Booked dates could not be loaded');
  }
}

export async function getSettings() {
  try {
    const [rows] = await pool.query('SELECT * FROM settings LIMIT 1');
    if (!rows || rows.length === 0) {
      // Return default settings or throw error if settings are critical
      console.warn("No settings found in database, returning null or default.");
      return null; // Or some default object: { minBookingLength: 0, ... }
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to get settings:', error);
    throw new Error('Settings could not be loaded');
  }
}

export async function getCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v2/all?fields=name,flag"
    );
    if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
    const countries = await res.json();
    return countries.map(country => ({name: country.name, flag: country.flag}));
  } catch(e) {
    console.error("Could not fetch countries", e);
    throw new Error("Could not fetch countries");
  }
}

/////////////
// CREATE

// Renamed from createGuest. Password must be hashed before calling this.
export async function createUser(newUser) {
  const { email, fullName, password_hash } = newUser; // Changed password to password_hash, removed other fields
  try {
    const [result] = await pool.query(
      'INSERT INTO Users (email, fullName, password_hash, createdAt) VALUES (?, ?, ?, NOW())', // Updated table name and columns
      [email, fullName, password_hash]
    );
    // Return only relevant fields, especially not the hash
    return { id: result.insertId, email, fullName };
  } catch (error) {
    console.error('Failed to create user:', error);
    // Check for duplicate email error (ER_DUP_ENTRY for MySQL, typically error code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('A user with this email already exists.');
    }
    throw new Error('User could not be created');
  }
}

export async function getMembershipById(membershipId) {
  try {
    const [rows] = await pool.query('SELECT * FROM Memberships WHERE id = ?', [membershipId]);
    if (!rows || rows.length === 0) {
      throw new Error(`Membership with id ${membershipId} not found`);
    }
    return rows[0];
  } catch (error) {
    console.error(`Failed to get membership by id ${membershipId}:`, error);
    throw new Error(`Membership ${membershipId} could not be loaded`);
  }
}

export async function createOrder(orderData) {
  const { userId, membershipId, price_paid, status, startDate, endDate } = orderData;
  try {
    // Check for existing active or pending order for this user and membership
    const [existingOrders] = await pool.query(
      `SELECT id FROM Orders
       WHERE userId = ? AND membershipId = ?
         AND (status = 'pending_approval' OR status = 'active')`,
      [userId, membershipId]
    );
    if (existingOrders && existingOrders.length > 0) {
      throw new Error('You are already subscribed to this membership.');
    }

    const [result] = await pool.query(
      'INSERT INTO Orders (userId, membershipId, price_paid, status, orderDate, startDate, endDate, createdAt) VALUES (?, ?, ?, ?, NOW(), ?, ?, NOW())',
      [userId, membershipId, price_paid, status, startDate, endDate]
    );
    return { id: result.insertId, ...orderData };
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error(error.message || 'Order could not be created');
  }
}

export async function getUserRoles(userId) {
  try {
    const [rows] = await pool.query(
      `SELECT r.name
       FROM Roles r
       JOIN UserRoles ur ON r.id = ur.roleId
       WHERE ur.userId = ?`,
      [userId]
    );
    return rows.map(row => row.name); // Return an array of role names
  } catch (error) {
    console.error(`Failed to get roles for user ${userId}:`, error);
    throw new Error(`User roles for user ${userId} could not be loaded`);
  }
}

export async function getRoleByName(roleName) {
  try {
    const [rows] = await pool.query('SELECT id FROM Roles WHERE name = ?', [roleName]);
    if (!rows || rows.length === 0) {
      throw new Error(`Role with name ${roleName} not found`);
    }
    return rows[0];
  } catch (error) {
    console.error(`Failed to get role by name ${roleName}:`, error);
    throw new Error(`Role ${roleName} could not be loaded`);
  }
}

export async function assignUserRole(userId, roleId) {
  try {
    const [result] = await pool.query(
      'INSERT INTO UserRoles (userId, roleId) VALUES (?, ?)',
      [userId, roleId]
    );
    return { userId, roleId, affectedRows: result.affectedRows };
  } catch (error) {
    console.error(`Failed to assign role ${roleId} to user ${userId}:`, error);
    // Check for duplicate entry, though primary key should prevent this if called correctly
    if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('This role is already assigned to the user.');
    }
    throw new Error('User role could not be assigned');
  }
}

// Membership CRUD
export async function createMembership(membershipData) {
  const { gymId, name, description, price, duration, duration_days } = membershipData;
  try {
    const [result] = await pool.query(
      'INSERT INTO Memberships (gymId, name, description, price, duration, duration_days, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [gymId, name, description, price, duration, duration_days]
    );
    return { id: result.insertId, ...membershipData };
  } catch (error) {
    console.error('Failed to create membership:', error);
    throw new Error('Membership could not be created');
  }
}

export async function updateMembership(membershipId, updatedFields) {
  const fieldsToUpdate = [];
  const values = [];
  for (const [key, value] of Object.entries(updatedFields)) {
    if (value !== undefined) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (fieldsToUpdate.length === 0) throw new Error("No fields to update for membership.");
  
  const setClause = fieldsToUpdate.join(', ');
  values.push(membershipId);

  try {
    const [result] = await pool.query(
      `UPDATE Memberships SET ${setClause} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) throw new Error('Membership not found or no changes made.');
    return { id: membershipId, ...updatedFields };
  } catch (error) {
    console.error(`Failed to update membership ${membershipId}:`, error);
    throw new Error(`Membership ${membershipId} could not be updated`);
  }
}

export async function deleteMembership(membershipId) {
  try {
    // Check if membership is part of any existing orders first (optional, or handle with DB constraints)
    // For now, direct delete:
    const [result] = await pool.query('DELETE FROM Memberships WHERE id = ?', [membershipId]);
    if (result.affectedRows === 0) {
      throw new Error('Membership not found.');
    }
    return { id: membershipId, message: "Membership deleted successfully." };
  } catch (error) {
    console.error(`Failed to delete membership ${membershipId}:`, error);
    // Handle foreign key constraint errors if orders exist for this membership
    if (error.code === 'ER_ROW_IS_REFERENCED_2') { // MySQL specific error code for FK constraint
        throw new Error('Cannot delete membership as it is associated with existing orders. Please resolve orders first.');
    }
    throw new Error(`Membership ${membershipId} could not be deleted`);
  }
}
// End Membership CRUD

export async function getUserOrders(userId) {
  try {
    const [rows] = await pool.query(
      `SELECT
         o.id, o.orderDate, o.startDate, o.endDate, o.price_paid, o.status,
         m.name AS membershipName, m.description AS membershipDescription,
         g.name AS gymName, g.id AS gymId
       FROM Orders o
       JOIN Memberships m ON o.membershipId = m.id
       JOIN Gyms g ON m.gymId = g.id
       WHERE o.userId = ?
       ORDER BY o.orderDate DESC`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error(`Failed to get orders for user ${userId}:`, error);
    throw new Error('User orders could not be loaded');
  }
}

export async function getGymOrders(gymId) {
  try {
    const [rows] = await pool.query(
      `SELECT
         o.id, o.orderDate, o.startDate, o.endDate, o.price_paid, o.status,
         m.name AS membershipName,
         u.fullName AS userName, u.email AS userEmail
       FROM Orders o
       JOIN Memberships m ON o.membershipId = m.id
       JOIN Users u ON o.userId = u.id
       WHERE m.gymId = ?
       ORDER BY o.orderDate DESC`,
      [gymId]
    );
    return rows;
  } catch (error) {
    console.error(`Failed to get orders for gym ${gymId}:`, error);
    throw new Error('Gym orders could not be loaded');
  }
}

export async function getGymEvents(gymId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Events WHERE gymId = ? ORDER BY event_date_time DESC',
      [gymId]
    );
    return rows;
  } catch (error) {
    console.error(`Failed to get events for gym ${gymId}:`, error);
    throw new Error('Gym events could not be loaded');
  }
}

export async function checkActiveMembership(userId, gymId) {
  try {
    const [rows] = await pool.query(
      `SELECT o.id
       FROM Orders o
       JOIN Memberships m ON o.membershipId = m.id
       WHERE o.userId = ? AND m.gymId = ? AND o.status = 'active' AND (o.endDate IS NULL OR o.endDate >= CURDATE())
       LIMIT 1`,
      [userId, gymId]
    );
    return rows.length > 0; // True if an active membership exists, false otherwise
  } catch (error) {
    console.error(`Failed to check active membership for user ${userId}, gym ${gymId}:`, error);
    // Default to false on error to be safe with access control
    return false;
  }
}

export async function isUserAdminForGym(userId, gymId) {
  try {
    // First, check if the user has the 'gym_admin' role globally (optional, but good for quick check)
    // This was already handled by checking session.user.roles.includes('gym_admin') in the layout.
    // Here, we specifically check the GymAdmins table.
    const [rows] = await pool.query(
      'SELECT userId FROM GymAdmins WHERE userId = ? AND gymId = ?',
      [userId, gymId]
    );
    return rows.length > 0; // True if they are an admin for this specific gym
  } catch (error) {
    console.error(`Failed to check if user ${userId} is admin for gym ${gymId}:`, error);
    return false; // Default to false on error for security
  }
}

export async function getAdministeredGyms(userId) {
  try {
    const [rows] = await pool.query(
      `SELECT g.id, g.name
       FROM Gyms g
       JOIN GymAdmins ga ON g.id = ga.gymId
       WHERE ga.userId = ?
       ORDER BY g.name`,
      [userId]
    );
    return rows; // Returns array of {id, name} for gyms the user administers
  } catch (error) {
    console.error(`Failed to get administered gyms for user ${userId}:`, error);
    throw new Error('Could not load administered gyms.');
  }
}


/////////////
// UPDATE

export async function updateOrderStatus(orderId, newStatus, startDate, endDate) {
  // Only include startDate and endDate in the update if they are provided (i.e., on approval)
  const fieldsToUpdate = ['status = ?'];
  const values = [newStatus];

  if (startDate) {
    fieldsToUpdate.push('startDate = ?');
    values.push(startDate);
  }
  if (endDate) {
    fieldsToUpdate.push('endDate = ?');
    values.push(endDate);
  }
  
  values.push(orderId); // For the WHERE clause

  const setClause = fieldsToUpdate.join(', ');

  try {
    const [result] = await pool.query(
      `UPDATE Orders SET ${setClause} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      throw new Error('Order not found or status not changed.');
    }
    return { id: orderId, status: newStatus, startDate, endDate };
  } catch (error) {
    console.error(`Failed to update status for order ${orderId}:`, error);
    throw new Error(`Order ${orderId} status could not be updated`);
  }
}


export async function updateGym(gymId, updatedFields) {
  // Filter out undefined fields to prevent setting columns to NULL unintentionally
  // And handle JSON fields specifically if they are part of updatedFields
  const fieldsToUpdate = [];
  const values = [];

  for (const [key, value] of Object.entries(updatedFields)) {
    if (value !== undefined) {
      if (key === "photos_json" || key === "opening_hours_json") {
        fieldsToUpdate.push(`${key} = ?`);
        values.push(typeof value === 'string' ? value : JSON.stringify(value));
      } else {
        fieldsToUpdate.push(`${key} = ?`);
        values.push(value);
      }
    }
  }

  if (fieldsToUpdate.length === 0) {
    throw new Error("No fields to update for gym.");
  }

  const setClause = fieldsToUpdate.join(', ');
  values.push(gymId); // For the WHERE clause

  try {
    const [result] = await pool.query(
      `UPDATE Gyms SET ${setClause} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      throw new Error('Gym not found or no changes made.');
    }
    // To return the updated gym, you might need another SELECT query or assume updatedFields is the new state
    return { id: gymId, ...updatedFields };
  } catch (error) {
    console.error(`Failed to update gym ${gymId}:`, error);
    throw new Error(`Gym ${gymId} could not be updated`);
  }
}

// Renamed from updateGuest. updatedFields is an object.
export async function updateUser(id, updatedFields) {
  // Filter out undefined fields to prevent setting columns to NULL unintentionally
  const fieldsToUpdate = Object.entries(updatedFields).filter(([key, value]) => value !== undefined);
  if (fieldsToUpdate.length === 0) {
    throw new Error("No fields to update.");
  }

  const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
  const values = fieldsToUpdate.map(([, value]) => value);
  values.push(id); // For the WHERE clause

  try {
    const [result] = await pool.query(
      `UPDATE Users SET ${setClause} WHERE id = ?`, // Changed 'users' to 'Users'
      values
    );
    if (result.affectedRows === 0) {
      throw new Error('User not found or no changes made.');
    }
    // To return the updated user, you might need another SELECT query or assume updatedFields is the new state
    return { id, ...updatedFields };
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('User could not be updated');
  }
}

export async function updateBooking(id, updatedFields) {
  const fieldsToUpdate = Object.entries(updatedFields).filter(([key, value]) => value !== undefined);
  if (fieldsToUpdate.length === 0) {
    throw new Error("No fields to update.");
  }

  const setClause = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
  const values = fieldsToUpdate.map(([, value]) => value);
  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE bookings SET ${setClause} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      throw new Error('Booking not found or no changes made.');
    }
    return { id, ...updatedFields };
  } catch (error) {
    console.error('Failed to update booking:', error);
    throw new Error('Booking could not be updated');
  }
}

// Gym CRUD (Superadmin)
export async function createGym(gymData) {
  // Note: photos_json and opening_hours_json should be stringified JSON if provided
  const { name, address, contact_phone, contact_email, facilities_description, photos_json, opening_hours_json, created_by_superadmin_id } = gymData;
  try {
    const [result] = await pool.query(
      'INSERT INTO Gyms (name, address, contact_phone, contact_email, facilities_description, photos_json, opening_hours_json, created_by_superadmin_id, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, address, contact_phone, contact_email, facilities_description, photos_json, opening_hours_json, created_by_superadmin_id]
    );
    return { id: result.insertId, ...gymData };
  } catch (error) {
    console.error('Failed to create gym:', error);
    throw new Error('Gym could not be created');
  }
}

export async function deleteGym(gymId) {
  // Consider implications: deleting a gym might require deleting associated memberships, orders, events, admin assignments first,
  // or using ON DELETE CASCADE / SET NULL in the database schema (check init.sql).
  // Our current schema uses ON DELETE CASCADE for Memberships, Orders, GymAdmins, Events linked to Gyms.
  try {
    const [result] = await pool.query('DELETE FROM Gyms WHERE id = ?', [gymId]);
    if (result.affectedRows === 0) {
      throw new Error('Gym not found.');
    }
    return { id: gymId, message: "Gym deleted successfully." };
  } catch (error) {
    console.error(`Failed to delete gym ${gymId}:`, error);
    // Handle potential FK constraints if cascade wasn't set up correctly
    throw new Error(`Gym ${gymId} could not be deleted`);
  }
}
// End Gym CRUD (Superadmin)


// Event CRUD
export async function createEvent(eventData) {
  const { gymId, title, description, event_date_time, location_details, created_by_gym_admin_id } = eventData;
  try {
    const [result] = await pool.query(
      'INSERT INTO Events (gymId, title, description, event_date_time, location_details, created_by_gym_admin_id, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [gymId, title, description, event_date_time, location_details, created_by_gym_admin_id]
    );
    return { id: result.insertId, ...eventData };
  } catch (error) {
    console.error('Failed to create event:', error);
    throw new Error('Event could not be created');
  }
}

export async function updateEvent(eventId, updatedFields) {
  const fieldsToUpdate = [];
  const values = [];
  for (const [key, value] of Object.entries(updatedFields)) {
    if (value !== undefined) {
      // Ensure date is formatted correctly if included
      if (key === 'event_date_time' && value) {
         fieldsToUpdate.push(`${key} = ?`);
         // Assuming value is a Date object or valid date string
         values.push(new Date(value));
      } else {
        fieldsToUpdate.push(`${key} = ?`);
        values.push(value);
      }
    }
  }
  if (fieldsToUpdate.length === 0) throw new Error("No fields to update for event.");
  
  const setClause = fieldsToUpdate.join(', ');
  values.push(eventId);

  try {
    const [result] = await pool.query(
      `UPDATE Events SET ${setClause} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) throw new Error('Event not found or no changes made.');
    return { id: eventId, ...updatedFields };
  } catch (error) {
    console.error(`Failed to update event ${eventId}:`, error);
    throw new Error(`Event ${eventId} could not be updated`);
  }
}

export async function deleteEvent(eventId) {
  try {
    const [result] = await pool.query('DELETE FROM Events WHERE id = ?', [eventId]);
    if (result.affectedRows === 0) {
      throw new Error('Event not found.');
    }
    return { id: eventId, message: "Event deleted successfully." };
  } catch (error) {
    console.error(`Failed to delete event ${eventId}:`, error);
    throw new Error(`Event ${eventId} could not be deleted`);
  }
}
// End Event CRUD

// Superadmin - Gym Admin Management
export async function getAllUsers() {
  // Select basic user info, potentially filter out superadmins?
  try {
    const [rows] = await pool.query('SELECT id, fullName, email FROM Users ORDER BY fullName');
    return rows;
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw new Error('Users could not be loaded');
  }
}

export async function getAllGymAdminAssignments() {
  // Get all assignments with user and gym names
  try {
    const [rows] = await pool.query(
      `SELECT ga.userId, ga.gymId, u.fullName AS userName, u.email AS userEmail, g.name AS gymName
       FROM GymAdmins ga
       JOIN Users u ON ga.userId = u.id
       JOIN Gyms g ON ga.gymId = g.id
       ORDER BY g.name, u.fullName`
    );
    return rows;
  } catch (error) {
    console.error('Failed to get all gym admin assignments:', error);
    throw new Error('Gym admin assignments could not be loaded');
  }
}

export async function assignGymAdmin(userId, gymId) {
  // Ensure the user has the 'gym_admin' role in UserRoles before assigning to GymAdmins.
  try {
    // 1. Get the roleId for 'gym_admin'
    const role = await getRoleByName('gym_admin');
    const roleId = role.id;

    // 2. Check if the user already has the 'gym_admin' role
    const [existingRoles] = await pool.query(
      'SELECT 1 FROM UserRoles WHERE userId = ? AND roleId = ?',
      [userId, roleId]
    );

    // 3. If not, assign the role
    if (!existingRoles || existingRoles.length === 0) {
      await assignUserRole(userId, roleId);
    }

    // 4. Insert into GymAdmins (use INSERT IGNORE to avoid duplicate)
    const [result] = await pool.query(
      'INSERT IGNORE INTO GymAdmins (userId, gymId) VALUES (?, ?)',
      [userId, gymId]
    );
    // Check affectedRows to see if insert happened or was ignored
    return { userId, gymId, inserted: result.affectedRows > 0 };
  } catch (error) {
    console.error(`Failed to assign user ${userId} as admin for gym ${gymId}:`, error);
    throw new Error('Gym admin assignment could not be created');
  }
}

export async function removeGymAdmin(userId, gymId) {
  try {
    const [result] = await pool.query(
      'DELETE FROM GymAdmins WHERE userId = ? AND gymId = ?',
      [userId, gymId]
    );
    if (result.affectedRows === 0) {
      // This isn't necessarily an error, maybe the assignment didn't exist
      console.warn(`No gym admin assignment found for user ${userId} and gym ${gymId} to remove.`);
      return { userId, gymId, removed: false, message: "Assignment not found." };
    }
    return { userId, gymId, removed: true, message: "Gym admin assignment removed." };
  } catch (error) {
    console.error(`Failed to remove user ${userId} as admin for gym ${gymId}:`, error);
    throw new Error('Gym admin assignment could not be removed');
  }
}
// End Superadmin - Gym Admin Management

// Superadmin - Analytics
export async function getTotalUserCount() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM Users');
    return rows[0].count || 0;
  } catch (error) {
    console.error('Failed to get total user count:', error);
    throw new Error('Could not load user count');
  }
}

export async function getTotalGymCount() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM Gyms');
    return rows[0].count || 0;
  } catch (error) {
    console.error('Failed to get total gym count:', error);
    throw new Error('Could not load gym count');
  }
}

export async function getTotalActiveMembershipCount() {
  // Counts active orders, assuming one active order = one active membership instance
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM Orders
       WHERE status = 'active' AND (endDate IS NULL OR endDate >= CURDATE())`
    );
    return rows[0].count || 0;
  } catch (error) {
    console.error('Failed to get total active membership count:', error);
    throw new Error('Could not load active membership count');
  }
}
// End Superadmin - Analytics


/////////////
// DELETE

export async function deleteBooking(id) {
  try {
    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Booking not found.');
    }
    return { id }; // Indicate success
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw new Error('Booking could not be deleted');
  }
}
