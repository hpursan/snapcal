const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://ujpsucxudckaxrljpdwo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcHN1Y3h1ZGNrYXhybGpwZHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzOTE0NSwiZXhwIjoyMDg1NjE1MTQ1fQ.XfG6e-S6T4yL8R0f6p34O-V55Q8-x5z6t9n6o7i8r0s'
);

async function checkLogs() {
    console.log('Fetching logs for project: ujpsucxudckaxrljpdwo');
    const { data: logs, error } = await supabase
        .from('client_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!logs || logs.length === 0) {
        console.log('No logs found.');
        return;
    }

    console.log(`Found ${logs.length} logs.`);
    logs.forEach(log => {
        console.log(`[${log.created_at}] ${log.level}: ${log.message}`);
        console.log('Context:', log.context);
        console.log('---');
    });
}

checkLogs();
