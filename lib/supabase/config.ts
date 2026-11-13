export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') return null;
  } catch {
    return null;
  }

  return { url, key };
}

export function isStoreConfigured() {
  return Boolean(getSupabaseConfig());
}

export function hasPrivateStorageConfiguration() {
  return Boolean(
    process.env.SUPABASE_SECRET_KEY?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}
