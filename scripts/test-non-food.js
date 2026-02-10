const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujpsucxudckaxrljpdwo.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcHN1Y3h1ZGNrYXhybGpwZHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzkxNDUsImV4cCI6MjA4NTYxNTE0NX0.YETI7T5_gCmqNAo2lVy7F0CYMWcbBvI1V6A51VqK5rw';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testNonFood() {
    console.log('Signing in anonymously...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
        console.error('Auth Error:', authError.message);
        return;
    }
    console.log('Signed in as:', authData.user.id);

    console.log('Testing Non-Food Detection via Edge Function...');

    // Tiny valid base64 for a 1x1 black pixel to simulate a non-food image
    const fakeImage = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

    const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
            imageBase64: fakeImage,
            deviceId: 'test-script-id'
        }
    });

    if (error) {
        console.log('❌ Caught Error:');
        console.log('Message:', error.message);
        console.log('Status:', error.status); // FunctionsHttpError should have status

        // Let's try to see if we can get the body from the context
        if (error.context) {
            try {
                // If it's a response object, we can try to read it
                const bodyText = await error.context.text();
                console.log('Response Body:', bodyText);
            } catch (e) {
                console.log('Could not read body from context');
            }
        }
    } else {
        console.log('✅ Success:', data);
    }
}

testNonFood();
