import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerNoteRow = Database["public"]["Tables"]["customer_notes"]["Row"];

export function useCustomersDB() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("last_activity", { ascending: false })
      .limit(500);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setCustomers(data ?? []);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("customers_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [refresh]);

  return { customers, loading, error, refresh };
}

export async function updateCustomer(id: string, patch: Partial<CustomerRow>) {
  const { error } = await supabase.from("customers").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addCustomerNote(customerId: string, body: string, userId: string | undefined) {
  const { error } = await supabase
    .from("customer_notes")
    .insert({ customer_id: customerId, body, created_by: userId ?? null });
  if (error) throw error;
}

export async function listCustomerNotes(customerId: string) {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}
