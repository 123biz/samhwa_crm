import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Returns: undefined = loading, null = not logged in, session object = logged in
export function useAuth() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return session;
}
