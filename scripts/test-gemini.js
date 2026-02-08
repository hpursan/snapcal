const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log('Testing Gemini API Key...');
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];

    for (const model of models) {
        console.log(`\nModel: ${model}`);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Hi" }] }]
                    })
                }
            );
            const data = await response.json();
            if (response.ok) {
                console.log('✅ Success:', data.candidates[0].content.parts[0].text);
            } else {
                console.log('❌ Failed:', JSON.stringify(data.error));
            }
        } catch (e) {
            console.log('❌ Error:', e.message);
        }
    }
}

testGemini();
