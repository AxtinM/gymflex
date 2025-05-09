import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, getUserRoles } from "./data-service"; // Use the refactored service
import bcrypt from 'bcryptjs';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Or throw an error
        }

        try {
          const user = await getUserByEmail(credentials.email);

          if (user && user.password_hash) { // Ensure user and password_hash exist
            const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            
            if (isValid) {
              // Return the user object that will be encoded in the JWT
              // Ensure you only return necessary, non-sensitive information
              return { 
                id: user.id, // This is crucial for the session
                email: user.email, 
                name: user.fullName 
                // Do NOT return user.password here
              };
            }
          }
          return null; // Login failed (user not found or password incorrect)
        } catch (error) {
          console.error("Authorize error:", error);
          return null; // Or throw a specific error to be handled
        }
      }
    })
  ],
  callbacks: {
    // The authorized callback can remain to protect routes
    authorized({ auth, request }) {
      // auth object contains the session if the user is authenticated
      return !!auth?.user; 
    },
    // The signIn callback is less critical for credentials once authorize handles validation
    // async signIn({ user, account, profile }) {
    //   // For credentials, user object is what authorize returned.
    //   // No need for guest creation logic here as that's for OAuth auto-signup.
    //   // Signup will be a separate process.
    //   return true; // If authorize was successful, allow sign in
    // },
    async jwt({ token, user, trigger, session: sessionData }) { // Added trigger and sessionData
      // If `user` object exists (it's passed on first sign-in or when session is updated)
      if (user) {
        token.id = user.id;
        token.name = user.name; // Assuming 'name' is passed from authorize (user.fullName)
        // Fetch roles when user signs in
        try {
          const roles = await getUserRoles(user.id);
          token.roles = roles;
        } catch (error) {
          console.error("Error fetching roles for JWT:", error);
          token.roles = []; // Default to no roles on error
        }
      }

      // If the session is updated (e.g. user profile update that might change roles)
      // This is a more advanced scenario, for now, roles are set at login.
      // if (trigger === "update" && sessionData) {
      //   // Re-fetch roles or update from sessionData if roles are part of it
      // }
      return token;
    },
    async session({ session, token }) {
      // Add the user ID and roles from the token to the session object
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name; // Ensure name is consistent
        session.user.roles = token.roles || []; // Add roles to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Your custom login page
    // error: '/auth/error', // (optional) custom error page
  },
  // session: {
  //   strategy: "jwt", // JWT is default, but can be explicit
  // },
  // secret: process.env.AUTH_SECRET, // Already in your .env.local
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
