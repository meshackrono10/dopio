const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.update({
        where: { email: 'hunter@househaunters.com' },
        data: { password: hashedPassword }
    });
    console.log('Password reset to password123');
    await prisma.$disconnect();
}

main();
