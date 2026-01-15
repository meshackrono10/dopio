# Missing Features & Implementation Guide

## Current State
✅ Backend API complete (Accept/Reject/Counter endpoints exist)
❌ Frontend UI missing - No way for users to interact with viewing requests

## What's Missing:

### 1. Hunter Dashboard - Incoming Viewing Requests Section
**Location**: `/web-client/src/app/haunter-dashboard/page.tsx`

**Needs**:
- New tab: "Viewing Requests" or merge into "Bookings"
- Show PENDING requests with:
  - Tenant name & photo
  - Property details
  - Proposed date/time
  - Amount in escrow
  - Three action buttons:
    - ✅ **Accept** → Creates booking
    - ❌ **Reject** → Refunds tenant
    - 🔄 **Counter** → Propose new date/time

**API to call**:
```typescript
// Get requests
GET /api/viewing-requests → returns requests where property.hunterId === user.id

// Accept
POST /api/viewing-requests/:id/accept
Body: { scheduledDate, scheduledTime } // Optional override

// Reject  
POST /api/viewing-requests/:id/reject
Body: { reason: "Not available" }

// Counter
POST /api/viewing-requests/:id/counter
Body: { 
  proposedDates: [{ date: "...", timeSlot: "..." }],
  message: "Can we do 3pm instead?"
}
```

---

### 2. Tenant Dashboard - My Viewing Requests Section  
**Location**: `/web-client/src/app/tenant-dashboard/page.tsx`

**Needs**:
- New tab or replace "Bookings" with "My Requests"
- Show all viewing requests with status:
  - **PENDING** - Waiting for hunter (show countdown/timer)
  - **COUNTERED** - Hunter proposed new time:
    - Show hunter's counter-proposal
    - Buttons: Accept Counter | Reject & Request Refund
  - **ACCEPTED** - Booking confirmed (redirect to bookings)
  - **REJECTED** - Rejected by hunter (show refund status)

**API to call**:
```typescript
// Get my requests
GET /api/viewing-requests → returns my viewing requests

// Accept hunter's counter
POST /api/viewing-requests/:id/accept-counter

// Reject counter & request refund
POST /api/viewing-requests/:id/reject-counter
```

---

### 3. Booking List Fix
**Issue**: Tenant sees nothing in bookings because booking only exists AFTER hunter accepts

**Solution**:
Change tenant "Bookings" tab to show:
- Viewing Requests (PENDING/COUNTERED) 
- Confirmed Bookings (ACCEPTED with booking created)

---

### 4. Prevent Duplicate Listings
**Issue**: Multiple clicks create multiple viewing requests

**Solution** (Frontend):
```typescript
const [submitting, setSubmitting] = useState(false);

const handlePay = async () => {
  if (submitting) return; // Prevent double-click
  setSubmitting(true);
  try {
    // ... payment logic
  } finally {
    setSubmitting(false);
  }
}
```

**Solution** (Backend - already done):
The unique constraint on `Invoice.requestId` prevents duplicates at DB level.

---

### 5. Invoice Display
**Where**: Show in viewing request details

```typescript
const viewingRequest = await api.get(`/viewing-requests/${id}`);
const invoice = viewingRequest.invoice;

// Display:
- Invoice ID: {invoice.id}
- Amount: KES {invoice.amount}
- Status: {invoice.status} // UNPAID, ESCROW, PAID, REFUNDED
- Receipt: {invoice.mpesaReceiptNumber}
```

---

## Priority Implementation Order:

1. **Fix checkout double-submit** (5 minutes)
2. **Add Hunter "Accept/Reject" UI** (30 minutes)
3. **Show Tenant's viewing requests** (20 minutes)  
4. **Add Counter-proposal flow** (40 minutes)
5. **Invoice display** (10 minutes)

---

## Quick Start Code Snippets:

### Hunter Accept Button (example):
```typescript
const handleAccept = async (requestId: string) => {
  try {
    await api.post(`/viewing-requests/${requestId}/accept`);
    showToast("success", "Viewing accepted! Booking created.");
    refreshRequests();
  } catch (error: any) {
    showToast("error", error.message);
  }
};
```

### Tenant View Request Status:
```typescript
{viewingRequest.status === 'PENDING' && (
  <div className="bg-yellow-50 p-4 rounded">
    <p>⏳ Waiting for House Hunter to confirm...</p>
  </div>
)}

{viewingRequest.status === 'COUNTERED' && (
  <div className="bg-blue-50 p-4 rounded">
    <p>🔄 Hunter proposed: {counterDate} at {counterTime}</p>
    <button onClick={acceptCounter}>Accept</button>
    <button onClick={rejectCounter}>Decline</button>
  </div>
)}
```

---

## Summary:
The backend is ready, but you need frontend UI to:
1. Let hunters see and respond to requests
2. Let tenants track their requests and respond to counters
3. Show invoice details
4. Prevent duplicate submissions

This is approximately 2-3 hours of focused UI development work.
