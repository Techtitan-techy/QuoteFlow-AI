import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuotationEditor } from "@/components/quotation-editor";
import type { QuotationDraft } from "@/components/quotation-editor";
import type { Feature, Milestone, TimelineStep } from "@/lib/quotation-utils";

export const Route = createFileRoute("/_authenticated/quotations/$id")({
  component: EditQuotation,
  head: () => ({ meta: [{ title: "Quotation — QuoteFlow ai" }] }),
});

function EditQuotation() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !data) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  const initial: QuotationDraft = {
    id: data.id,
    quotation_number: data.quotation_number,
    title: data.title ?? "",
    client_id: data.client_id,
    issue_date: data.issue_date,
    expiry_date: data.expiry_date ?? "",
    currency: data.currency,
    subtotal: Number(data.subtotal),
    discount_percent: Number(data.discount_percent),
    tax_percent: Number(data.tax_percent),
    total: Number(data.total),
    features: (data.features as Feature[]) ?? [],
    milestones: (data.milestones as Milestone[]) ?? [],
    timeline: (data.timeline as TimelineStep[]) ?? [],
    notes: data.notes ?? "",
    terms: data.terms ?? "",
    status: data.status,
  };

  return <QuotationEditor initial={initial} />;
}