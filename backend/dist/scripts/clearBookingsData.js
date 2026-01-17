"use strict";
// Database Reset Script - Clears all bookings, viewing requests, and payment data
// Run with: npx ts-node src/scripts/clearBookingsData.ts
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearBookingsData() {
    try {
        console.log('🗑️  Starting database cleanup...\n');
        // Delete in order to respect foreign key constraints
        // 1. Delete Hunter Earnings (depends on Booking)
        const deletedEarnings = await prisma.hunterEarnings.deleteMany({});
        console.log(`✅ Deleted ${deletedEarnings.count} hunter earnings records`);
        // 2. Delete Payment History
        const deletedPayments = await prisma.paymentHistory.deleteMany({});
        console.log(`✅ Deleted ${deletedPayments.count} payment history records`);
        // 3. Delete Bookings
        const deletedBookings = await prisma.booking.deleteMany({});
        console.log(`✅ Deleted ${deletedBookings.count} bookings`);
        // 4. Delete Viewing Requests
        const deletedRequests = await prisma.viewingRequest.deleteMany({});
        console.log(`✅ Deleted ${deletedRequests.count} viewing requests`);
        console.log('\n✨ Database cleanup completed successfully!\n');
        console.log('All bookings, viewing requests, payments, and earnings have been cleared.');
        console.log('Users and properties remain intact.\n');
    }
    catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the function
clearBookingsData()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
