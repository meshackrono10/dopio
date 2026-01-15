# House Haunters - Production Deployment Guide

This guide outlines the steps to take your app from development to production.

## 1. Backend Deployment

### Prerequisites
- A cloud server (e.g., AWS, Render, Heroku, DigitalOcean).
- A managed MySQL database.
- A domain name with SSL (HTTPS).

### Steps
1. **Environment Variables**: Copy `.env.example` to `.env` on your server and fill in the production values.
2. **Build**: Run `npm run build` (if using TypeScript build step) or simply `npm start`.
3. **Database**: Run `npx prisma migrate deploy` to apply migrations to your production database.
4. **Process Manager**: Use `pm2` to keep the server running: `pm2 start dist/index.js --name house-haunters-api`.

## 2. Mobile App Submission

### Prerequisites
- Apple Developer Account ($99/year).
- Google Play Developer Account ($25 one-time).
- Expo Account (for EAS Build).

### Steps
1. **Install EAS CLI**: `npm install -g eas-cli`.
2. **Login**: `eas login`.
3. **Configure Project**: `eas build:configure`.
4. **Update API URL**: Ensure `src/config/index.ts` has your production API URL.
5. **Build for Android**: `eas build --platform android`.
6. **Build for iOS**: `eas build --platform ios`.
7. **Submit**: Use `eas submit` to send the builds to the stores.

## 3. Third-Party Services

### M-Pesa Daraja
- Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/).
- Create a "Lipa na M-Pesa Online" app.
- Get your Consumer Key, Secret, and Passkey.
- Update your backend `.env`.

### Cloudinary
- Create a production account at [Cloudinary](https://cloudinary.com/).
- Get your Cloud Name, API Key, and Secret.
- Update your backend `.env`.

### Google Maps
- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Enable Maps SDK for Android and iOS.
- Create API Keys and restrict them to your app's bundle ID (`com.househaunters.app`).
- Add the keys to `app.json`.

## 4. Legal
- Ensure the Privacy Policy and Terms of Service in `src/screens/legal` are reviewed by a legal professional.
- Host a copy of the Privacy Policy on your website (required for store submission).
