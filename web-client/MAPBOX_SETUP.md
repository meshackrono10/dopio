# Mapbox API Token Setup

## Option 1: Get Free Mapbox Token (Recommended)

1. Go to https://www.mapbox.com/
2. Click "Sign Up" (free tier available)
3. After signing up, go to your Account page
4. Click "Access tokens"
5. Copy your default public token (starts with `pk.`)

## Option 2: Use Without Mapbox (Fallback Mode)

The LocationAutocomplete component works without a Mapbox token!
- It will use predefined Kenyan areas
- Users can still search from 10+ common locations
- Manual entry is always available

## Installation

1. Create/edit `.env.local` in your project root:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

2. Restart your dev server:

```bash
npm run dev
```

## Features Without Token:
✅ Predefined areas search (Gate A, Mathare North, etc.)
✅ Manual location entry
✅ County/area dropdowns

## Features With Token:
✅ All above features PLUS
✅ Real-time autocomplete for ANY Kenyan location
✅ Exact coordinates for map
✅ Better search suggestions
✅ More accurate results

## Testing

**With Token:**
- Type "Gate A" → Should show "Gate A, Juja, Kiambu, Kenya"
- Type "Mathare" → Should show "Mathare North, Nairobi, Kenya"
- Type "TRM" → Should show "Thika Road Mall Area" results

**Without Token (Fallback):**
- Type "Gate A" → Shows from predefined list
- Manual entry always works
- 10+ common areas pre-loaded

## Notes:
- Mapbox free tier: 100,000 requests/month
- More than enough for a rental platform
- No credit card required for signup
- Token is public (safe to use in frontend)
