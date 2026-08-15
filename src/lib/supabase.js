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
