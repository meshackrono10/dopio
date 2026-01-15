
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'meshackrono05@gmail.com';
    const newPassword = await bcrypt.hash('hunter123', 10);

    await prisma.user.update({
        where: { email },
        data: { password: newPassword },
    });

    console.log(`Password for ${email} reset to 'hunter123'`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
