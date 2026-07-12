import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuotationEditor } from "@/components/quotation-editor";
import { generateQuoteNumber, suggestMilestones, suggestTimeline } from "@/lib/quotation-utils";
import type { QuotationDraft } from "@/components/quotation-editor";

export const Route = createFileRoute("/_authenticated/quotations/new")({
  component: NewQuotation,
  head: () => ({ meta: [{ title: "New Quotation — QuoteFlow AI" }] }),
});

function NewQuotation() {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();
      return data;
    },
  });

  const draft: QuotationDraft = {
    id: null,
    quotation_number: generateQuoteNumber(),
    title: "",
    client_id: null,
    issue_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    currency: profile?.default_currency ?? "INR",
    subtotal: 0,
    discount_percent: 0,
    tax_percent: Number(profile?.default_tax_rate ?? 18),
    total: 0,
    features: [],
    milestones: suggestMilestones(),
    timeline: suggestTimeline(),
    notes: "",
    terms: profile?.default_terms ?? "",
    status: "draft",
  };

  return (
    <QuotationEditor
      initial={draft}
      onSaved={(id) => navigate({ to: "/quotations/$id", params: { id } })}
    />
  );
}
