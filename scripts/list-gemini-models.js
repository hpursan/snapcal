const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log('Listing Gemini Models...');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
        );
        const data = await response.json();
        if (response.ok) {
            console.log('✅ Success:');
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log('❌ Failed:', JSON.stringify(data.error));
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}

listModels();
