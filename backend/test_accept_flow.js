const axios = require('axios');

async function main() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'hunter@househaunters.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in, token:', token ? 'Yes' : 'No');

        // 2. Accept Request
        const requestId = '9afb59a3-25fa-4ec1-8485-c75ff393e9a4';
        console.log('Accepting request:', requestId);

        try {
            const acceptRes = await axios.post(
                `http://localhost:5000/api/viewing-requests/${requestId}/accept`,
                {
                    // Payload for accepting a counter-proposal
                    scheduledDate: '2026-02-01T00:00:00.000Z',
                    scheduledTime: '14:00',
                    location: JSON.stringify({ name: 'Test Location', location: 'Test Location' })
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log('Accept Response:', acceptRes.data);
        } catch (err) {
            console.error('Accept Error:', err.response ? err.response.data : err.message);
        }

        // 3. Check DB Status (via another endpoint or just trust the response for now)
        // We can use the get request endpoint
        const getRes = await axios.get(`http://localhost:5000/api/viewing-requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Current Request Status:', getRes.data.status);

    } catch (error) {
        console.error('Script Error:', error.message);
    }
}

main();
