# House Haunters

**Find Your Perfect Rental Property in Kenya**

House Haunters is a platform that connects tenants looking for rental properties with verified house hunters (agents) who conduct in-person property viewings for a fee.

![House Haunters](https://i.ibb.co/JqPfydC/b-landing.png)

## 🌟 Features

- **✅ Complete Frontend UI (100%)**: All user-facing pages built and ready
- **✅ Admin Dashboard (100%)**: Full admin panel with analytics, logs, and settings
- **🏠 Property Listings**: Browse and search rental properties across Kenya
- **📱 Responsive Design**: Modern, mobile-first design
- **🌓 Dark & Light Modes**: Seamless theme switching
- **⭐ Reviews & Ratings**: Rate house haunters and properties
- **💬 Chat System**: Direct messaging between tenants and haunters
- **📊 User Dashboards**: Dedicated dashboards for tenants and haunters
- **💰 M-Pesa Integration**: Ready for payment integration (UI complete)

## 📦 Tech Stack

- **Framework**: Next.js 13.4.x (`app` directory)
- **Language**: TypeScript 5.0.4
- **Styling**: Tailwind CSS v3.3.2
- **UI Components**: HeadlessUI, Heroicons
- **Forms**: React Hook Forms, React Datepicker
- **Maps**: Google Maps React (ready for integration)
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd dapio
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### 🔐 Test Credentials
- **Admin**: `admin@househaunters.com` / `admin123`
- **Tenant**: `tenant@househaunters.com` / `tenant123`
- **Hunter**: `hunter@househaunters.com` / `hunter123`

## 📁 Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── (stay-listings)/         # Property listings
│   ├── (listing-detail)/        # Property details
│   ├── admin/                   # Admin dashboard
│   ├── tenant-dashboard/        # Tenant portal
│   ├── haunter-dashboard/       # Haunter portal
│   ├── booking/                 # Booking flow
│   ├── chat/                    # Messaging
│   ├── notifications/           # User notifications
│   ├── profile/                 # User profiles
│   ├── search/                  # Search results
│   └── ...                      # Other pages
├── components/                   # Reusable components
├── data/                        # Mock data & types
└── shared/                      # Shared utilities
```

## 🎯 Available Pages

### User Pages
- ✅ Homepage with property search
- ✅ Property listings (grid/map view)
- ✅ Property details
- ✅ Search results with filters
- ✅ Booking & checkout
- ✅ User profiles
- ✅ Notifications
- ✅ Reviews

### Dashboards
- ✅ Tenant Dashboard (saved, bookings, comparison, messages)
- ✅ Haunter Dashboard (listings, earnings, bookings, messages)
- ✅ Admin Dashboard (issues, haunters, listings, analytics, settings)

### Marketing & Legal
- ✅ How It Works
- ✅ For House Haunters (recruitment)
- ✅ FAQ
- ✅ Contact
- ✅ Terms of Service
- ✅ Privacy Policy

## 🔧 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚧 What's Next?

### Backend Integration (Priority)
- [ ] Set up database (PostgreSQL/Prisma recommended)
- [ ] Build API routes
- [ ] Implement authentication (Clerk or NextAuth)
- [ ] Integrate M-Pesa Daraja API
- [ ] Add Cloudinary for image/video uploads

### Map Integration
- [ ] Implement Google Maps for property discovery
- [ ] Add area clustering for privacy
- [ ] Location-based search

### Additional Features
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Real-time chat (Pusher/Socket.io)
- [ ] Haunter onboarding flow
- [ ] Review moderation

## 📝 Environment Variables

Required environment variables (see `.env.local.example`):

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=house-haunters

# Add when implementing backend:
DATABASE_URL=
NEXT_PUBLIC_API_URL=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
```

## 👥 User Roles

1. **Tenants**: Search properties, book viewings, leave reviews
2. **House Haunters**: List properties, conduct viewings, earn fees
3. **Admins**: Manage users, approve listings, resolve issues

## 💰 Package System

- **Silver** (KES 1,500): 30-minute viewing
- **Gold** (KES 2,500): 1-hour comprehensive viewing
- **Platinum** (KES 5,000): 2-hour premium viewing with video

## 📄 License

Private - House Haunters Team

## 🙏 Acknowledgements

Built on the Chisfis Next.js template by [Hamed Hasan](https://github.com/Hamed-Hasan).

---

**Version**: 1.0.0  
**Status**: Frontend Complete, Backend Pending  
**Last Updated**: December 2025
