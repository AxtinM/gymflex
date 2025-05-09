# Project Plan: Gym Management Platform

**Overall Goals:**

*   Develop a multi-tenant application for gyms to manage their clients and memberships.
*   Provide a client-facing interface to browse gyms, view details, and "purchase" memberships (create orders).
*   Implement distinct dashboards for Superadmins (site-wide management) and Gym Admins (individual gym management).
*   Ensure a high-quality, engaging design and maintainable, easy-to-understand code.
*   Remove all unrelated features and code from the existing "Wild Oasis" project.

**Phase 1: Foundation & Cleanup**

1.  **Project Initialization & Version Control:**
    *   Ensure the project is under version control (e.g., Git). Create a new branch for these significant changes.
2.  **Dependency Review:**
    *   Analyze `package.json` and remove any dependencies solely related to the old "cabins" and "bookings" theme.
3.  **File & Directory Cleanup:**
    *   Identify and remove components, pages, API routes, and library functions related to "cabins," "reservations," "bookings."
    *   **Key files/directories to inspect for removal/heavy modification:**
        *   `app/_components/Cabin.js`, `CabinCard.js`, `CabinList.js`, `Counter.js` (if specific to cabins), `DateSelector.js`, `DeleteReservation.js`, `Reservation.js`, `ReservationCard.js`, `ReservationContext.js`, `ReservationForm.js`, `ReservationList.js`, `ReservationReminder.js`, `SelectCountry.js` (unless needed for user profiles).
        *   `app/account/reservations/`
        *   `app/api/cabins/`
        *   `app/cabins/`
        *   `public/about-1.jpg`, `public/about-2.jpg`, `public/bg.png` (unless repurposed).
        *   The `starter/` directory seems like boilerplate/examples and should likely be removed.
4.  **Database Reset:**
    *   The existing `init.sql` will be completely replaced. The current tables (`users`, `cabins`, `bookings`, `settings`) are not suitable for the new application structure.

**Phase 2: Core Architecture & Data Model**

1.  **New Database Schema Design:**
    *   Define new tables: `Users`, `Roles`, `UserRoles`, `Gyms`, `Memberships` (tariffs), `Orders` (client membership purchases), `GymAdmins` (linking users to gyms they manage), `Events`.
    *   **Mermaid Diagram for New Database Schema:**
        ```mermaid
        erDiagram
            Users ||--o{ UserRoles : "has"
            Roles ||--o{ UserRoles : "defines"
            Users ||--o{ Orders : "places"
            Users ||--o{ GymAdmins : "can be"
            Gyms ||--o{ GymAdmins : "managed by"
            Gyms ||--o{ Memberships : "offers"
            Gyms ||--o{ Events : "hosts"
            Memberships ||--o{ Orders : "for"

            Users {
                INT id PK
                STRING fullName
                STRING email UK
                STRING password_hash
                DATETIME createdAt
            }

            Roles {
                INT id PK
                STRING name UK  // e.g., "client", "gym_admin", "super_admin"
            }

            UserRoles {
                INT userId PK, FK
                INT roleId PK, FK
            }

            Gyms {
                INT id PK
                STRING name
                STRING address
                STRING contact_phone
                STRING contact_email
                STRING opening_hours_json // Store as JSON for flexibility
                TEXT facilities_description
                STRING photos_json // Array of image URLs
                DATETIME createdAt
                INT created_by_superadmin_id FK // User ID of superadmin who added it
            }

            GymAdmins {
                INT userId PK, FK
                INT gymId PK, FK
            }

            Memberships {
                INT id PK
                INT gymId FK
                STRING name // e.g., "Gold Tier", "Monthly Basic"
                TEXT description
                DECIMAL price
                STRING duration // e.g., "1 month", "1 year", "30 days"
                INT duration_days // For easier calculation
                DATETIME createdAt
            }

            Orders {
                INT id PK
                INT userId FK
                INT membershipId FK
                DATETIME orderDate
                DATETIME startDate
                DATETIME endDate
                DECIMAL price_paid
                STRING status // e.g., "pending_approval", "active", "expired", "cancelled"
                DATETIME createdAt
            }

            Events {
                INT id PK
                INT gymId FK
                STRING title
                TEXT description
                DATETIME event_date_time
                STRING location_details // e.g., "Studio 1", "Online via Zoom"
                DATETIME createdAt
                INT created_by_gym_admin_id FK // User ID of gym admin
            }
        ```
2.  **Authentication & Authorization:**
    *   Leverage NextAuth.js (already partially set up in `app/api/auth/[...nextauth]/route.js`).
    *   Implement role-based access control (RBAC) using the `UserRoles` table.
    *   Update signup (`app/api/auth/signup/route.js`, `app/signup/page.js`) and login (`app/login/page.js`) to reflect new user structure. Default role for new signups will be 'client'.
3.  **Styling and UI Components:**
    *   Continue using Tailwind CSS (`tailwind.config.js`, `app/_styles/globals.css`).
    *   Develop a new set of reusable UI components (e.g., Cards for Gyms/Memberships, Modals, Forms) or adopt a Tailwind-compatible component library like Shadcn/UI for consistency and rapid development.
    *   Focus on a modern, clean, and "interesting" design.

**Phase 3: Feature Implementation - Client View**

1.  **Homepage / Gym Listing:**
    *   Replace content of `app/page.js`.
    *   Display a list/grid of available gyms with key information (name, main photo, location snippet).
    *   Implement search and filtering capabilities (e.g., by location, facilities - future enhancement).
2.  **Gym Details Page:**
    *   Dynamic route `app/gyms/[gymId]/page.js`.
    *   Display comprehensive gym information: name, address, contact, opening hours, facilities, photos.
    *   List available membership types/tariffs for that gym.
3.  **Membership "Purchase" (Order Creation):**
    *   Users (clients) can select a membership.
    *   This action creates an `Order` with `status: "pending_approval"`. No actual payment processing at this stage.
    *   Requires user to be logged in.
4.  **User Account - Membership Status:**
    *   Update `app/account/profile/page.js` or create a new section for users to see their active memberships and order history.
5.  **Gym Socials Page (Conditional Access):**
    *   Dynamic route `app/gyms/[gymId]/social/page.js`.
    *   Accessible only if the logged-in user has an 'active' membership for that specific gym.
    *   Displays events created by the Gym Admin for that gym.

**Phase 4: Feature Implementation - Gym Admin Dashboard**

1.  **Dashboard Layout:**
    *   Create a new section, e.g., `app/gym-admin/[gymId]/dashboard/...`
    *   Protected routes, accessible only to users with `gym_admin` role for that specific `gymId`.
2.  **Manage Gym Profile:**
    *   Form to update gym details (name, address, contact, hours, facilities, photos).
3.  **Manage Memberships:**
    *   CRUD operations for membership types offered by their gym.
4.  **Manage Client Orders:**
    *   View list of orders for their gym.
    *   Approve/reject "pending_approval" orders. (Approving sets status to "active" and defines `startDate`/`endDate`).
5.  **Manage Events:**
    *   CRUD operations for events hosted by their gym (displayed on the Gym Socials Page).

**Phase 5: Feature Implementation - Superadmin Dashboard**

1.  **Dashboard Layout:**
    *   Create a new section, e.g., `app/superadmin/dashboard/...`
    *   Protected routes, accessible only to users with `super_admin` role.
2.  **Manage Gyms:**
    *   CRUD operations for all gyms on the platform.
3.  **Manage Gym Admins:**
    *   Assign/unassign users the `gym_admin` role for specific gyms.
    *   View list of all gym admins.
4.  **Site Analytics (Basic):**
    *   Display basic statistics (e.g., total users, total gyms, total active memberships). Can be expanded later.

**Phase 6: Refinement & Deployment**

1.  **Thorough Testing:**
    *   Unit tests, integration tests, and end-to-end tests for all user flows and functionalities.
2.  **UI/UX Polish:**
    *   Ensure responsive design.
    *   Gather feedback and iterate on the design for optimal user experience.
3.  **Code Review & Optimization:**
    *   Ensure code is clean, well-documented, and follows best practices.
    *   Optimize database queries and application performance.
4.  **Deployment:**
    *   Configure environment variables (e.g., in `.env.local` for development, and proper environment variables for production).
    *   Deploy to a suitable platform (e.g., Vercel, Netlify, or a custom server setup using Docker as hinted by `docker-compose.yml`).

**Technology Stack Recommendations (Summary):**

*   **Frontend:** Next.js (App Router)
*   **Backend:** Next.js (Route Handlers, Server Actions)
*   **Database:** SQL (e.g., PostgreSQL, MySQL - to be confirmed based on `docker-compose.yml` or other preferences. The `init.sql` syntax is generic).
*   **Styling:** Tailwind CSS
*   **Authentication:** NextAuth.js
*   **Form Handling:** React Hook Form + Zod (for validation)
*   **State Management:**
    *   Server-side state: Managed by Next.js.
    *   Client-side state: React Context for simple cases, Zustand for more complex global state if needed.
*   **UI Components:** Custom components with Tailwind CSS. Consider Shadcn/UI for more complex, pre-built but customizable components.
*   **Data Access Layer:** Update/rewrite `app/_lib/data-service.js` and `app/_lib/db.js` to interact with the new SQL database schema. The existing `app/_lib/supabase.js` might be irrelevant if not using Supabase directly for the database.

**User Flow Example (Client Buys Membership):**

```mermaid
sequenceDiagram
    actor Client
    participant Browser
    participant NextServer as Next.js Server
    participant Database

    Client->>Browser: Visits Gym Details Page
    Browser->>NextServer: GET /gyms/[gymId]
    NextServer->>Database: Fetch Gym Details & Memberships
    Database-->>NextServer: Gym Data
    NextServer-->>Browser: Render Gym Page

    Client->>Browser: Clicks "Buy Membership" for "Gold Tier"
    Browser->>NextServer: POST /api/orders (or Server Action) with { userId, membershipId }
    NextServer->>NextServer: Verify User Authentication & Authorization
    alt User Authenticated
        NextServer->>Database: Create Order (status: "pending_approval")
        Database-->>NextServer: Order Confirmation
        NextServer-->>Browser: Show Success Message / Redirect to Account
    else User Not Authenticated
        NextServer-->>Browser: Redirect to Login
    end