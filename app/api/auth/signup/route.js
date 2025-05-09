import { NextResponse } from 'next/server';
import { getUserByEmail, createUser, getRoleByName, assignUserRole } from '@/app/_lib/data-service'; // Adjust path as needed
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    // 1. Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Missing email, password, or full name.' },
        { status: 400 }
      );
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format.' },
        { status: 400 }
      );
    }
    // Basic password length validation (consider more complex rules)
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 } // 409 Conflict
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds

    // 4. Create user
    // nationalID, nationality, countryFlag are optional here, can be updated later via profile
    const createdUser = await createUser({
      email,
      password_hash: hashedPassword, // Changed to password_hash
      fullName,
      // nationalID, nationality, countryFlag removed
    });

    // Assign 'client' role to the new user
    try {
      const clientRole = await getRoleByName('client');
      if (!clientRole) {
        // This case should ideally not happen if roles are seeded
        console.error("Default 'client' role not found.");
        // Potentially return an error or log for admin attention
        // For now, we'll let the user creation succeed but log this critical issue
      } else {
        await assignUserRole(createdUser.id, clientRole.id);
      }
    } catch (roleError) {
      console.error('Error assigning role to user:', roleError);
      // Decide if user creation should be rolled back or if this is a non-critical failure for signup
      // For now, we log it and the user is created without a role, which needs to be handled.
    }
    
    // Exclude password_hash from the returned user object
    // The createUser function in data-service now returns { id, email, fullName }
    // So, createdUser already excludes the hash.

    return NextResponse.json(
      { message: 'User created successfully.', user: createdUser }, // Return the user object from createUser
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    // Check if it's a specific error from createUser (like duplicate email if somehow missed)
    if (error.message.includes('already exists')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}