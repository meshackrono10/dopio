
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'meshackrono05@gmail.com';
const CURRENT_PASS = 'hunter123';
const NEW_PASS = 'hunter1234';

async function main() {
    try {
        // 1. Login with current password
        console.log(`Logging in with ${CURRENT_PASS}...`);
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: CURRENT_PASS,
        });
        const token = loginResponse.data.token;
        console.log('Login successful.');

        // 2. Change password
        console.log(`Changing password to ${NEW_PASS}...`);
        await axios.post(`${API_URL}/auth/change-password`, {
            currentPassword: CURRENT_PASS,
            newPassword: NEW_PASS,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Password change successful.');

        // 3. Login with new password
        console.log(`Logging in with ${NEW_PASS}...`);
        const newLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: NEW_PASS,
        });
        console.log('Login with new password successful.');

        // 4. Reset password back
        const newToken = newLoginResponse.data.token;
        console.log(`Resetting password back to ${CURRENT_PASS}...`);
        await axios.post(`${API_URL}/auth/change-password`, {
            currentPassword: NEW_PASS,
            newPassword: CURRENT_PASS,
        }, {
            headers: { Authorization: `Bearer ${newToken}` }
        });
        console.log('Password reset successful.');

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();
