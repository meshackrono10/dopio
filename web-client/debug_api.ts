
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Backend runs on 5000 by default
// web-client package.json proxy or .env usually tells us. 
// Let's assume 4000 or 5000. I'll try 4000 first as it's common for Express.

async function testApi() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'tenant@househaunters.com',
            password: 'tenant123'
        });

        const token = loginRes.data.token;
        console.log("Login successful, token:", token ? "Yes" : "No");

        // 2. Get Hunter Profile
        const hunterId = '7cf518e6-0509-441e-a72d-c86cfc6fca1a'; // From previous check_users
        console.log(`Fetching hunter profile for ${hunterId}...`);

        try {
            const hunterRes = await axios.get(`${API_URL}/users/hunter/${hunterId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Hunter Profile Response Status:", hunterRes.status);
            console.log("Hunter Profile Data:", JSON.stringify(hunterRes.data, null, 2));
        } catch (e: any) {
            console.error("Failed to fetch hunter profile:", e.message);
            if (e.response) {
                console.error("Response data:", e.response.data);
                console.error("Response status:", e.response.status);
            }
        }

    } catch (error: any) {
        console.error("Test failed:", error.message);
        if (error.response) {
            console.error("Login Response data:", error.response.data);
        }
    }
}

testApi();
