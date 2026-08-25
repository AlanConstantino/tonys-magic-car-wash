# Supabase Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name and strong database password
3. Select a region close to your service area (e.g., `us-west-1` for Southern California)
4. Wait for the project to be provisioned (~2 minutes)

## 2. Get Your Supabase Credentials

From your project dashboard:

1. Go to **Settings** → **API**
2. Copy the following values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 3. Run Database Migrations

You can run the migrations in two ways:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `001_initial_schema.sql`
4. Click **Run**
5. Create another new query
6. Copy and paste the contents of `002_seed_services.sql`
7. Click **Run**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## 4. Create an Owner/Admin User

### Method 1: Using Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and password
4. Copy the User UID that was created
5. Go to **SQL Editor** and run:

```sql
INSERT INTO admin_users (id, email, is_active)
VALUES ('YOUR_USER_UUID', 'your-email@example.com', true);
```

### Method 2: Sign up through the app

1. Start your Next.js app
2. Go to `/admin/login`
3. Sign up with your email
4. Go to Supabase Dashboard → **Authentication** → **Users**
5. Find your user and copy the UUID
6. Run the SQL above to add yourself to `admin_users`

## 5. Verify Setup

Run this query in the SQL Editor to verify everything is set up:

```sql
-- Should return 4 services
SELECT * FROM services;

-- Should return your admin user
SELECT * FROM admin_users;

-- Should return 0 bookings (initially)
SELECT * FROM bookings;
```

## Database Schema

### Tables

- **services**: Detailing packages (exterior wash, interior detail, etc.)
- **customers**: Customer contact information
- **bookings**: Appointments with customer, vehicle, address, payment status
- **time_off**: Blocked time ranges when booking is not available
- **admin_users**: Owner/admin users who can access the admin panel

### Booking Statuses

- `pending_payment`: Booking created, waiting for Stripe payment confirmation
- `confirmed`: Payment received, booking is confirmed
- `completed`: Service has been completed
- `canceled`: Booking was canceled

## Security

All tables have Row Level Security (RLS) enabled:

- **Public users** can:
  - View active services
  - Create customers and bookings
  
- **Admin users** can:
  - View and edit everything
  - Manage services, bookings, time off

## Backup and Maintenance

Supabase automatically backs up your database daily. You can also:

1. Create manual backups from the dashboard
2. Export data as CSV from any table
3. Use `pg_dump` for full database backups
