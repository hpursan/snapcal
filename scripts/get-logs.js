const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcHN1Y3h1ZGNrYXhybGpwZHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzOTE0NSwiZXhwIjoyMDg1NjE1MTQ1fQ.XfG6e-S6T4yL8R0f6p34O-V55Q8-x5z6t9n6o7i8r0s'
);

async function checkLogs() {
    console.log('Fetching production logs...');
    const { data, error } = await supabase
        .from('client_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('API Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('NO LOGS FOUND. The app is failing before it can even log.');
        return;
    }

    data.forEach(log => {
        console.log(`[${log.created_at}] ${log.level}: ${log.message}`);
        console.log('Context:', log.context);
        console.log('---');
    });
}

checkLogs();
