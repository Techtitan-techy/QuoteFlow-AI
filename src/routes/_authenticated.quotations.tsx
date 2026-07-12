import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "@/lib/currencies";
import { StatusBadge } from "./_authenticated.dashboard";

export const Route = createFileRoute("/_authenticated/quotations")({
  component: QuotationsShell,
  head: () => ({ meta: [{ title: "Quotations — QuoteFlow AI" }] }),
});

function QuotationsShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // If a child (new / $id) is active, render only the outlet.
  if (path !== "/quotations") return <Outlet />;
  return <QuotationsList />;
}

function QuotationsList() {
  const [search, setSearch] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = data.filter((q) => {
    if (!search) return true;
    const snap = q.client_snapshot as { business_name?: string } | null;
    return (
      (q.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      (snap?.business_name ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="mt-1 text-muted-foreground">All your quotes in one place.</p>
        </div>
        <Button asChild className="gap-2"><Link to="/quotations/new"><Plus className="h-4 w-4" /> New Quotation</Link></Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, number, or client…" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="mb-4 text-sm text-muted-foreground">No quotations yet.</p>
          <Button asChild><Link to="/quotations/new">Create your first quote</Link></Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {filtered.map((q) => {
              const snap = q.client_snapshot as { business_name?: string } | null;
              return (
                <Link
                  key={q.id}
                  to="/quotations/$id"
                  params={{ id: q.id }}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{q.title || "Untitled"}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      #{q.quotation_number} · {snap?.business_name || "No client"} · {new Date(q.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right font-semibold">{formatMoney(Number(q.total || 0), q.currency)}</div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}