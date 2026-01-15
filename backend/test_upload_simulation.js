
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    const filePath = path.join(__dirname, 'valid_test.mp4');
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }

    const form = new FormData();
    form.append('video', fs.createReadStream(filePath));

    try {
        console.log('Attempting upload with correct headers (simulating fix)...');
        // In Node.js with form-data package, getHeaders() provides the correct Content-Type with boundary
        // In the browser, setting Content-Type to undefined achieves the same result
        const headers = {
            ...form.getHeaders(),
            // We do NOT set 'Content-Type': 'application/json' here, effectively simulating the fix
        };

        const response = await axios.post('http://localhost:5000/api/upload/video', form, {
            headers: headers
        });

        console.log('Upload SUCCESS!');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Upload FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testUpload();
