
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function main() {
    try {
        // 1. Get User
        const email = 'meshackrono05@gmail.com';
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User found: ${user.id} (${user.role})`);

        // 2. Generate Token
        const secret = process.env.JWT_SECRET || 'secret';
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            secret,
            { expiresIn: '1h' }
        );
        console.log('Generated Token:', token.substring(0, 20) + '...');

        // 3. Call API
        console.log('Fetching conversations from API...');
        const response = await axios.get(`${API_URL}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('API Response:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
