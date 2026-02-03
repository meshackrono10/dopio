import axios from 'axios';

async function testResetPassword() {
    const apiUrl = 'http://localhost:5000/api';
    const email = 'tenant@househaunters.com';
    const newPassword = 'newtenant123';

    try {
        console.log(`Attempting to reset password for ${email}...`);
        const response = await axios.post(`${apiUrl}/auth/reset-password`, {
            email,
            newPassword,
        });
        console.log('Response:', response.data);

        console.log('Attempting to login with new password...');
        const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
            email,
            password: newPassword,
        });
        console.log('Login successful! Token:', loginResponse.data.token.substring(0, 10) + '...');

        // Reset back to original password for consistency
        console.log('Resetting back to original password...');
        await axios.post(`${apiUrl}/auth/reset-password`, {
            email,
            newPassword: 'tenant123',
        });
        console.log('Password reset back to original.');

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testResetPassword();
