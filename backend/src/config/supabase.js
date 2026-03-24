import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Fallback to a mock url/key just for server startup if .env is missing
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn("⚠️  WARNING: Supabase credentials are missing from .env. Operations will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
