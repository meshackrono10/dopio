# Simulated Payment System Documentation

## Overview
This document explains the simulated payment system that bypasses actual M-Pesa integration while creating all necessary records (bookings, receipts, payment history, and hunter earnings).

## How It Works

### 1. Payment Flow (Frontend → Backend)

When a user clicks "Confirm and pay" button:

**Frontend** (`web-client/src/app/checkout/PageMain.tsx`):
- Creates viewing request
- Calls `payInvoice(invoiceId, phone)` 
- No actual M-Pesa STK push is sent
- User sees success message immediately

**Backend** (`backend/src/controllers/paymentController.ts`):
- `initiateStkPush()` function is called
- **SIMULATED**: Payment is automatically approved
- Creates ALL necessary records:
  - ✅ Updates invoice status to `PAID`
  - ✅ Creates booking with `CONFIRMED` status
  - ✅ Creates payment history record
  - ✅ Creates hunter earnings record (80% to hunter, 20% platform fee)
  - ✅ Generates simulated M-Pesa receipt number (format: `SIM12345678`)

### 2. Database Records Created

#### PaymentHistory
```typescript
{
  userId: "tenant-id",
  amount: 2500,
  type: "BOOKING_PAYMENT",
  mpesaReceiptNumber: "SIM12345678",
  phoneNumber: "254712345678",
  status: "COMPLETED",
  description: "Viewing fee for Property Title",
  metadata: {
    bookingId: "booking-id",
    invoiceId: "invoice-id",
    propertyId: "property-id"
  }
}
```

#### HunterEarnings
```typescript
{
  hunterId: "hunter-id",
  amount: 2000, // 80% of 2500
  bookingId: "booking-id",
  status: "PENDING" // Can be withdrawn later
}
```

#### Booking
```typescript
{
  propertyId: "property-id",
  tenantId: "tenant-id",
  hunterId: "hunter-id",
  invoiceId: "invoice-id",
  scheduledDate: "2026-01-20",
  scheduledTime: "10:00",
  status: "CONFIRMED",
  chatEnabled: true
}
```

### 3. Hunter Withdrawal System

Hunters can withdraw their pending earnings:

**API Endpoint**: `POST /api/payments/withdraw`

**Request**:
```json
{
  "amount": 5000,
  "phoneNumber": "254712345678"
}
```

**What Happens**:
1. Checks if hunter has enough pending balance
2. Marks earnings as `WITHDRAWN`
3. Creates withdrawal payment history record
4. Returns success (simulated - no actual M-Pesa B2C)

**Frontend Implementation** (to be added):
```typescript
const withdraw = async () => {
  const response = await api.post('/payments/withdraw', {
    amount: pendingBalance,
    phoneNumber: user.phone
  });
  // Show success message
  showToast("success", "Withdrawal successful!");
};
```

### 4. Available API Endpoints

#### Get Payment History
```
GET /api/payments/history
Headers: Authorization: Bearer {token}
```
Returns all payment transactions for the user (tenants see payments, hunters see withdrawals).

#### Get Hunter Earnings
```
GET /api/payments/earnings
Headers: Authorization: Bearer {token}
```
Returns:
```json
{
  "earnings": [...], // Array of earning records
  "totalPending": 5000,
  "totalWithdrawn": 10000,
  "totalEarnings": 15000
}
```

#### Request Withdrawal
```
POST /api/payments/withdraw
Headers: Authorization: Bearer {token}
Body: {
  "amount": 5000,
  "phoneNumber": "254712345678"
}
```

### 5. Testing the System

#### As a Tenant:
1. Select a property
2. Choose a viewing package
3. Click "Confirm and pay"
4. ✅ Payment succeeds immediately
5. ✅ Booking is created
6. ✅ Receipt is generated
7. ✅ Payment appears in history

#### As a Hunter:
1. View earnings dashboard
2. See pending balance from completed bookings
3. Click "Withdraw"
4. ✅ Withdrawal succeeds immediately
5. ✅ Balance is updated
6. ✅ Withdrawal appears in payment history

### 6. Future M-Pesa Integration

When ready to implement real M-Pesa Daraja API:

1. **Uncomment** `initiateStkPushReal()` in `paymentController.ts`
2. **Replace** current `initiateStkPush` with `initiateStkPushReal`
3. **Set environment variables**:
   ```
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/callback
   ```
4. **Implement callback handling** for async payment confirmation
5. **Update frontend** to wait for callback instead of immediate success

### 7. Key Features

✅ **Complete Payment Flow**: All records created as if real payment occurred
✅ **Receipt Generation**: Simulated M-Pesa receipt numbers
✅ **Payment History**: Full transaction history for auditing
✅ **Hunter Earnings**: Automatic 80/20 revenue split
✅ **Withdrawal System**: Hunters can withdraw pending earnings
✅ **Easy Migration**: Clean separation makes Daraja integration straightforward

### 8. Revenue Split

**Current**: 80% to Hunter, 20% Platform Fee

To modify:
```typescript
// In paymentController.ts, line ~100
const hunterAmount = invoice.amount * 0.8; // Change 0.8 to desired percentage
```

### 9. Status Tracking

**Invoice Statuses**:
- `UNPAID` → Initial state
- `PAID` → After successful payment
- `ESCROW` → Held until viewing
- `RELEASED` → Paid to hunter
- `REFUNDED` → Refunded to tenant

**Booking Statuses**:
- `CONFIRMED` → After payment
- `COMPLETED` → After viewing
- `CANCELLED` → If cancelled

**Earnings Statuses**:
- `PENDING` → Available for withdrawal
- `WITHDRAWN` → Already paid out

### 10. Important Notes

⚠️ **Security**: In production, add proper validation and fraud detection
⚠️ **Compliance**: Ensure compliance with local payment regulations
⚠️ **Testing**: Test thoroughly before deploying to production
⚠️ **Monitoring**: Add logging for all payment transactions
⚠️ **Backup**: Always backup database before schema changes

## Summary

This simulated payment system allows you to:
- ✅ Test complete booking flow without M-Pesa
- ✅ Generate receipts and payment history
- ✅ Track hunter earnings and withdrawals
- ✅ Easily migrate to real M-Pesa later
- ✅ All database records are created as in production
