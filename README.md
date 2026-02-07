# Dopio: Premium Real Estate Bundle System

Dopio is a high-end real estate platform designed for "Hunters" (agents) to manage and showcase property listings using a unique tiered bundle system. It goes beyond simple listings by allowing agents to curate regional tour experiences for potential tenants.

---

## 🚀 Core Features

### 1. Multi-Tier Listing System
The platform moves beyond single listings by offering three distinct tiers:
- **Bronze (Standalone)**: A single, high-quality property listing.
- **Silver (Regional Bundle)**: A collection of 3-4 properties in the same general area, designed to give viewers a "tour" of a neighborhood.
- **Gold (Estate Bundle)**: A collection of 5+ properties in the same area, offering maximum exposure and high booking potential.

### 2. Location-Locked Grouping
To ensure a consistent user experience for house-hunters, bundles are "Location-Locked."
- All properties in a Silver or Gold bundle must share the same **General Area** (e.g., Westlands, Kilimani).
- This logic is enforced during the creation flow and the upgrade process.

### 3. Integrated Haunter Dashboard
A comprehensive management suite for agents:
- **Overview**: High-level stats on views and bookings.
- **Listings**: Manage standalone houses and bundles (Break, Replace, Upgrade).
- **Messages**: Real-time chat with potential tenants.
- **Bookings & Viewing Requests**: Track and manage schedule requests.
- **Wallet & Transactions**: Financial oversight of listing fees and payments.

### 4. Property Upgrade System
A flexible promotion path for listings:
- **Bronze to Bundle**: Promote a standalone house to a Silver or Gold group.
- **Join Existing**: Seamlessly add a listing to an existing regional bundle.
- **Direct Creation**: Create multi-property packages from scratch in a unified flow.

---

## 🛠️ Technical Architecture

### Frontend (`web-client`)
- **Framework**: Next.js (App Router)
- **State Management**: React Context API (`AuthContext`, `PropertyContext`, `PropertyFormContext`).
- **Styling**: Tailwind CSS with a premium, high-contrast dark/light mode palette.
- **Icons**: Line Awesome.
- **Dynamic Routing**: Multi-step forms for property creation with persistent draft states.

### Backend (`backend`)
- **Runtime**: Node.js with Express.
- **Database**: MySQL managed via **Prisma ORM**.
- **Security**: JWT-based authentication with role-based access control (Hunters vs. Admins).
- **API Design**: RESTful architecture with dedicated controllers for property and package management.

### Data Model & Linking Logic
Bundles are linked using a robust ID-based system:
- `packageGroupId`: A unique identifier shared by all members of a bundle.
- `packageMasterId`: Ties properties to a "Master" record for billing/checkout.
- `packagePosition`: Defines the display order within the bundle.

---

## 💡 System Flows

### 1. Listing Creation Flow
1. **Tier Selection**: Agent chooses Bronze, Silver, or Gold.
2. **First Property**: Core details (title, rent, description, images) are added for the primary property.
3. **Location Selection**: The area selected for the first property "locks" the area for all subsequent units in a bundle.
4. **Bundle Management**: For Silver/Gold, the agent adds remaining properties through a specialized "Next Property" loop.
5. **Publish**: All properties are saved and linked in the database simultaneously.

### 2. Property Upgrade Flow
- From the Dashboard, a Hunter can click **"Upgrade to Bundle"** on a standalone house.
- They choose a target tier (Silver/Gold).
- They can either start a **New Bundle** or **Join an Existing Bundle** that matches the property's area.

### 3. Bundle Breakdown Flow
- Agents can **"Break Bundle"** at any time.
- This operation dissolves the `packageGroupId` link, converting all individual units into standalone Bronze listings.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Database

### Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Configure `.env` with `DATABASE_URL` and `JWT_SECRET`.
4. Run migrations: `npx prisma migrate dev`
5. Seed data: `npx prisma db seed`
6. Start server: `npm run dev`

### Frontend Setup
1. Navigate to `web-client/`
2. Install dependencies: `npm install`
3. Configure `.env.local`
4. Start development server: `npm run dev`

---

## ✅ Recent Major Updates
- **Modular Dashboard**: Refactored the Haunter Dashboard into a tab-based system (Listings, Messages, Bookings, Wallet, etc.).
- **Gold Package Management**: Implemented real-time bundle member management (Add/Remove/Replace).
- **Automated Seeding**: Enhanced seeding scripts for consistent test environments.
- **Location Lockdown**: Enforced regional consistency across multi-property listings and upgrades.
