import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useOwnerRole() {
  const { user, loading: authLoading } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (authLoading) return;
    if (!user) {
      setIsOwner(false);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();
      if (!mounted) return;
      setIsOwner(Boolean(data));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return { isOwner, loading };
}
