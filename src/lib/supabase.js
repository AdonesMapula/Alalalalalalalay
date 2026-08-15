import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://kejkhhnouwdrcmifgkzb.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Create live Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Dynamic Supabase Backend Services
 */

// 1. Dynamic User & Profile Authentication / Lookup
export const signUpWithSupabase = async ({ email, password, firstName, middleName = '', lastName, role, otpCode = '891024' }) => {
  if (!isSupabaseConfigured || !email) return { data: null, error: 'Not configured' };
  try {
    const dbRole = (role || 'super_admin').toLowerCase().replace(' ', '_');
    const validRole = ['super_admin', 'content_moderator', 'analyst', 'agency_verifier', 'citizen'].includes(dbRole)
      ? dbRole
      : 'super_admin';

    // A. Register in Supabase Auth (auth.users - shows up under Supabase Dashboard -> Authentication -> Users!)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password || 'admin123',
      options: {
        data: {
          first_name: firstName,
          middle_name: middleName || '',
          last_name: lastName,
          role: validRole,
        },
      },
    });

    const createdAuthUser = authData?.user;

    // B. Register/Upsert in public.profiles table
    const profilePayload = {
      first_name: firstName || 'Admin',
      middle_name: middleName || null,
      last_name: lastName || 'User',
      email: email.trim(),
      role: validRole,
      otp_code: otpCode,
      status: 'Active',
      avatar_initials: `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'AD',
      egov_verified: true,
    };

    if (createdAuthUser?.id) {
      profilePayload.id = createdAuthUser.id;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert([profilePayload], { onConflict: 'email' })
      .select();

    return {
      authData,
      profileData,
      user: createdAuthUser || (profileData && profileData[0]),
      error: authError || profileError,
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const findProfileByEmail = async (email) => {
  if (!isSupabaseConfigured || !email) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, documents(*)')
      .ilike('email', email.trim())
      .maybeSingle();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const fetchAllProfiles = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, documents(*)')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createProfileInSupabase = async (profileData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const updateProfileInSupabase = async (id, updates) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteProfileFromSupabase = async (id) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 2. Dynamic Documents API
export const fetchDocumentsByUserId = async (userId) => {
  if (!isSupabaseConfigured || !userId) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createDocumentInSupabase = async (docData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([docData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteDocumentFromSupabase = async (id) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 3. Dynamic Knowledge Sources API
export const fetchKnowledgeSources = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createKnowledgeSource = async (sourceData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert([sourceData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteKnowledgeSource = async (id) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .delete()
      .eq('id', id);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 4. Dynamic Opportunities API
export const fetchOpportunities = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createOpportunity = async (oppData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([oppData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 5. Dynamic Audit Logs API
export const fetchAuditLogs = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createAuditLog = async (logData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([logData]);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};
