# Quick Test Guide

## Test the Complete Flow:

### Step 1: Fresh Start
Database has been cleared. Backend server is running.

### Step 2: Make a Booking (as Tenant)
1. Go to: http://localhost:3000/listing
2. Click on any property
3. Click "Book a Viewing"
4. Select date/time
5. Click "Confirm & Pay"

**Expected**: Should redirect to `/viewing-requests` and show your pending request

### Step 3: Accept Request (as Hunter)  
1. **Logout** from tenant account
2. **Login as Hunter** (the one who owns the property)
3. Go to: http://localhost:3000/viewing-requests
4. Should see the incoming request with buttons:
   - ✅ Accept
   - 🔄 Counter-Propose  
   - ❌ Reject

### Step 4: Click Accept
- Should create booking
- Tenant will see "ACCEPTED" status

---

## If Still Not Working:

### Check 1: Open Browser Console (F12)
Look for red errors when you:
- Click "Confirm & Pay"
- Visit `/viewing-requests`

### Check 2: Backend Logs
Look at your terminal running backend for errors

### Check 3: Hard Refresh
- Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Clears cache

---

## Common Issues:

### "No invoice created" error
**Cause**: Old browser cache or backend not restarted
**Fix**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Check backend terminal - should say "Server running on port 5000"

### No Accept/Reject buttons showing  
**Cause**: You're logged in as tenant (only hunters see these buttons!)
**Fix**: Login as a hunter

### "Already have pending request" error
**Cause**: Duplicate request exists
**Fix**: Go to `/viewing-requests` and wait for hunter to respond to existing request

---

## Need More Help?
Send me:
1. Screenshot of `/viewing-requests` page
2. Browser console errors (F12 → Console tab)
3. Which user role you're logged in as
