import { supabase } from './Supabase';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

class LogService {
    private static instance: LogService;
    private appVersion = Application.nativeApplicationVersion || 'unknown';

    private constructor() { }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    /**
     * Log an error to Supabase (Remote Logging)
     */
    public async error(message: string, context: any = {}) {
        console.error(`[REMOTE LOG] ${message}`, context);
        await this.persist(LogLevel.ERROR, message, context);
    }

    /**
     * Log a warning (Remote Logging)
     */
    public async warn(message: string, context: any = {}) {
        console.warn(`[REMOTE LOG] ${message}`, context);
        await this.persist(LogLevel.WARN, message, context);
    }

    private async persist(level: LogLevel, message: string, context: any) {
        try {
            // Get user session if available
            const { data: { session } } = await supabase.auth.getSession();

            // Generate a reliable device ID (iOS/Android)
            let deviceId = 'unknown';
            if (Platform.OS === 'ios') {
                deviceId = await Application.getIosIdForVendorAsync() || 'unknown-ios';
            } else if (Platform.OS === 'android') {
                deviceId = Application.getAndroidId() || 'unknown-android';
            }

            const { error } = await supabase.from('client_logs').insert({
                level,
                message,
                context: JSON.stringify(context),
                device_id: deviceId,
                user_id: session?.user?.id || null,
                app_version: this.appVersion,
                platform: Platform.OS
            });

            if (error) {
                // Fail silently to the console to prevent infinite loops if logging fails
                console.debug('Failed to persist log to Supabase:', error.message);
            }
        } catch (e) {
            console.debug('LogService persistence exception:', e);
        }
    }
}

export const logger = LogService.getInstance();
