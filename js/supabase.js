const SUPABASE_URL = "https://fkajpmudsjidmtwlvdfn.supabase.co";

const SUPABASE_ANON_KEY = "https://fkajpmudsjidmtwlvdfn.supabase.co/rest/v1/";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);