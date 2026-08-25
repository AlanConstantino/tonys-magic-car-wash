# Tony's Magic Car Wash - Mobile Auto Detailing Booking System

A production-ready Next.js web application for a solo mobile auto detailing business in Southern California. Customers can book services online, and the operator can manage their schedule through an admin panel.

## Features

### Customer-Facing
- **Marketing Homepage**: Professional landing page with services, pricing, and contact information
- **Online Booking**: 3-step booking flow (service selection → date/time → customer details)
- **Intelligent Slot System**: Automatically generates available time slots based on business hours, existing bookings, and travel buffer time
- **Stripe Checkout**: Secure payment processing with test mode support
- **Booking Confirmation**: Confirmation page and email receipt
- **Mobile-First Design**: Fully responsive, optimized for phones and tablets

### Admin Panel
- **Authentication**: Secure login with Supabase Auth (password or magic link)
- **Today's Jobs**: Dashboard view of current day's bookings
- **Upcoming Schedule**: Calendar view of future appointments
- **Booking Management**: View details, mark as complete, or cancel bookings
- **Customer Information**: Contact details, vehicle info, and service location for each job

### Business Logic
- **60-Minute Travel Buffer**: Prevents overlapping bookings and allows time to drive between customer locations
- **No Double-Booking**: Slot system respects confirmed and pending payments
- **Service Duration**: Each service has a specific duration that determines slot length
- **Configurable Hours**: Business hours defined in config (default: Tue-Sat 8am-6pm PT)
- **Time Zone Support**: All times in America/Los_Angeles (Pacific Time)

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (Postgres + Row Level Security)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout + Webhooks (test mode)
- **Emails**: Resend for booking confirmations
- **Deployment**: Vercel-ready

## Prerequisites

Before you begin, you need accounts and API keys for:

1. **Supabase** (database and auth) - [supabase.com](https://supabase.com)
2. **Stripe** (payments) - [stripe.com](https://stripe.com) - Use test mode keys
3. **Resend** (emails) - [resend.com](https://resend.com) - Optional for v1

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <repo-name>
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name and strong database password
3. Select region: `us-west-1` (or closest to Southern California)
4. Wait ~2 minutes for provisioning

#### Get Your Credentials

From your Supabase dashboard → **Settings** → **API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

#### Run Database Migrations

Go to **SQL Editor** in Supabase dashboard:

1. Create a new query
2. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**
4. Create another query
5. Copy/paste contents of `supabase/migrations/002_seed_services.sql`
6. Click **Run**

#### Create an Admin User

Option A - Sign up through the app:
1. Start your Next.js app (see step 4)
2. Go to `http://localhost:43123/admin/login`
3. Sign up with your email
4. Go to Supabase Dashboard → **Authentication** → **Users**
5. Copy your User UUID
6. Go to **SQL Editor** and run:

```sql
INSERT INTO admin_users (id, email, is_active)
VALUES ('YOUR_USER_UUID', 'your-email@example.com', true);
```

Option B - Create user in Supabase first:
1. Go to **Authentication** → **Users** → **Add user**
2. Enter email and password
3. Copy the User UUID
4. Run the SQL above to add to `admin_users` table

### 3. Set Up Stripe (Test Mode)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your **test mode** keys from Dashboard → **Developers** → **API Keys**:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

#### Set Up Webhook for Local Development

You need the Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:43123/api/webhooks/stripe
```

The CLI will output a webhook signing secret (`whsec_...`). Copy this for your `.env.local`.

#### Set Up Webhook for Production

When deploying:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook signing secret to your production environment variables

### 4. Set Up Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe (use test mode keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From stripe listen or webhook dashboard

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:43123

# Resend (optional for v1)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 5. Run the Development Server

```bash
npm run dev
```

In a separate terminal, run the Stripe webhook listener:

```bash
stripe listen --forward-to localhost:43123/api/webhooks/stripe
```

Visit:
- **Homepage**: [http://localhost:43123](http://localhost:43123)
- **Booking**: [http://localhost:43123/book](http://localhost:43123/book)
- **Admin**: [http://localhost:43123/admin](http://localhost:43123/admin)

### 6. Test a Booking

1. Go to `/book` and select a service
2. Choose a date and time slot
3. Fill in customer details (use any test info)
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - ZIP: any 5 digits
5. Complete payment
6. Verify booking appears in admin panel at `/admin`

## Customizing for Your Business

### Update Branding

Edit `config/brand.ts`:

```typescript
export const brand = {
  name: "Your Business Name",
  tagline: "Your tagline",
  phone: "(555) 123-4567",
  email: "contact@yourbusiness.com",
  city: "Your City",
  serviceArea: "Your Service Area",
  // ... update hours, etc.
  isPlaceholder: false,  // Remove placeholder warning
}
```

### Update Services

Edit `config/brand.ts` and update the `services` array:

```typescript
export const services = [
  {
    id: "your-service",
    name: "Your Service Name",
    description: "Description",
    duration: 60,  // minutes
    price: 99,     // dollars
    features: ["Feature 1", "Feature 2"],
  },
  // ... more services
]
```

Then update the database:

```sql
-- In Supabase SQL Editor
UPDATE services SET 
  name = 'Your Service Name',
  description = 'Description',
  duration_minutes = 60,
  price_cents = 9900
WHERE slug = 'service-slug';
```

## Project Structure

```
├── app/
│   ├── page.tsx                 # Homepage
│   ├── book/                    # Booking flow
│   │   ├── page.tsx            # Step 1: Service selection
│   │   ├── slots/page.tsx      # Step 2: Date/time picker
│   │   ├── details/page.tsx    # Step 3: Customer info
│   │   └── confirmation/page.tsx
│   ├── admin/                   # Admin panel (protected)
│   │   ├── login/page.tsx
│   │   ├── page.tsx            # Dashboard
│   │   └── bookings/[id]/page.tsx
│   └── api/
│       ├── slots/route.ts       # Generate available slots
│       ├── checkout/route.ts    # Create Stripe session
│       ├── webhooks/stripe/route.ts  # Handle payments
│       └── booking/route.ts     # Get booking details
├── components/ui/               # Reusable UI components
├── lib/
│   ├── supabase/               # Supabase clients
│   ├── slots.ts                # Slot generation logic
│   ├── stripe.ts               # Stripe utilities
│   └── email.ts                # Email templates
├── config/
│   └── brand.ts                # Business configuration
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── README.md               # Database setup guide
└── public/                     # Static assets
```

## Database Schema

### Tables

- **services**: Detailing packages (exterior wash, interior detail, etc.)
- **customers**: Customer contact information
- **bookings**: Appointments with payment status, vehicle info, and service location
- **time_off**: Blocked time ranges when booking is unavailable
- **admin_users**: Owner/admin users who can access the admin panel

### Booking Status Flow

1. `pending_payment` → Customer created booking, Stripe checkout initiated
2. `confirmed` → Payment received via webhook, booking confirmed
3. `completed` → Service completed (set by admin)
4. `canceled` → Booking canceled (by admin or customer)

## Email Configuration (Optional)

To enable email confirmations:

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your sending domain (or use `onboarding@resend.dev` for testing)
4. Add to `.env.local`:

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=bookings@yourdomain.com
```

If Resend is not configured, bookings will still work - customers just won't receive email confirmations.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local`
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. Deploy!

### Post-Deployment

1. Set up production Stripe webhook (see Stripe setup above)
2. Update webhook secret in Vercel environment variables
3. Redeploy to apply new webhook secret

## Production Checklist

Before going live:

- [ ] Update `config/brand.ts` with real business information
- [ ] Set `isPlaceholder: false` in brand config
- [ ] Update services and pricing
- [ ] Add real business photos to `/public`
- [ ] Switch Stripe to **live mode** keys
- [ ] Set up production Stripe webhook
- [ ] Configure Resend with verified domain
- [ ] Create owner admin account
- [ ] Test full booking flow in production
- [ ] Set up proper error monitoring (e.g., Sentry)

## Troubleshooting

### "Supabase not configured" error
- Check that all Supabase env vars are set in `.env.local`
- Restart your dev server after adding env vars

### Slots showing as unavailable
- Check that services are seeded in database (`SELECT * FROM services`)
- Verify business hours in `config/brand.ts` match current day
- Check for time_off blocks in database

### Stripe webhook not working
- Make sure `stripe listen` is running in a separate terminal
- Check that `STRIPE_WEBHOOK_SECRET` matches the output from `stripe listen`
- In production, verify webhook URL in Stripe dashboard

### Admin login fails
- Verify user exists in `admin_users` table
- Check that `is_active = true`
- Try magic link instead of password

### Build fails
- Run `npm run build` locally to see full error
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all env vars are set (build time vars need `NEXT_PUBLIC_` prefix)

## Support

This app was built as a complete, production-ready solution for a solo mobile detailing operator. All core features are included:

✅ Customer booking with payments  
✅ Admin panel for schedule management  
✅ Email confirmations  
✅ Mobile-responsive design  
✅ Stripe test mode ready  
✅ Database with migrations  
✅ Row-level security  

For questions or issues, check the troubleshooting section above or review the inline code comments.

## License

Built for Tony's Magic Car Wash (placeholder) - update with your business information before deployment.
