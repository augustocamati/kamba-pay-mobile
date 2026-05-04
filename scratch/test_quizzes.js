const axios = require('axios');

async function testQuizzes() {
    try {
        const response = await axios.get('http://localhost:3000/api/admin/quizzes', {
            headers: {
                // We need a token here, but let's see if we get a 401 or a 500
            }
        });
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
    }
}

testQuizzes();
