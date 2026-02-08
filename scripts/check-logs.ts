import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogs() {
    console.log('Querying analysis_requests...');
    const { data, error } = await supabase
        .from('analysis_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    if (data.length === 0) {
        console.log('No analysis requests found. Failure likely occurring BEFORE record insertion.');
    } else {
        console.table(data.map(row => ({
            time: row.created_at,
            tier1: row.tier_1_result,
            tier2: row.tier_2_success,
            error: row.error_message?.substring(0, 50) + '...'
        })));
    }
}

checkLogs();
