import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export const signInAnonymously = async () => {
    try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error("Supabase Auth Error:", error.message);
            return { user: null, error };
        }
        return { user: data.user, error: null };
    } catch (e: any) {
        console.error("Auth Exception:", e);
        return { user: null, error: e };
    }
};
