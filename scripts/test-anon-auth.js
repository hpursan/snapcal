const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://ujpsucxudckaxrljpdwo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcHN1Y3h1ZGNrYXhybGpwZHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzkxNDUsImV4cCI6MjA4NTYxNTE0NX0.YETI7T5_gCmqNAo2lVy7F0CYMWcbBvI1V6A51VqK5rw'
);

async function testAuth() {
    console.log('Testing Anonymous Sign-in for public project...');
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
        console.error('❌ FAILED:', error.message);
    } else {
        console.log('✅ SUCCESS: User ID:', data.user.id);
    }
}

testAuth();
