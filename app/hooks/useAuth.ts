import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signInWithEmail, signOut, signUpWithEmail } from '@config/auth';

export const useAuth = () => {
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = onAuthStateChange((event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signOut
  };
};
