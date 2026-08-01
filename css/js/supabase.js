// ===============================
// Believable HRMS - Supabase Config
// ===============================

const SUPABASE_URL = "https://fkajpmudsjidmtwlvdfn.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_u4o2DpLlkN4g7Mpcy9YGsA__xwBkuco";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
