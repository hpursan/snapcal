import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLogs() {
    console.log('Fetching last 10 production logs...');
    const { data, error } = await supabase
        .from('client_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching logs:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No production logs found. This likely means Build #18 is not being used yet OR and the Anonymous Sign-in is STILL disabled, blocking the logger itself.');
        return;
    }

    data.forEach((log: any) => {
        console.log(`[${log.created_at}] ${log.level}: ${log.message}`);
        console.log('Context:', log.context);
        console.log('-----------------------------------');
    });
}

checkLogs();
