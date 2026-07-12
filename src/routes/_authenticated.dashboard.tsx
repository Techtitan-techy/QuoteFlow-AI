import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, TrendingUp, Clock, CheckCircle2, XCircle, Plus, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/currencies";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — QuoteFlow ai" }] }),
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [quotes, clients] = await Promise.all([
        supabase.from("quotations").select("id,status,total,currency,quotation_number,title,created_at,client_snapshot").order("created_at", { ascending: false }),
        supabase.from("clients").select("id"),
      ]);
      return {
        quotations: quotes.data ?? [],
        clientCount: clients.data?.length ?? 0,
      };
    },
  });

  const qs = data?.quotations ?? [];
  const total = qs.length;
  const accepted = qs.filter((q) => q.status === "accepted").length;
  const pending = qs.filter((q) => q.status === "draft" || q.status === "sent").length;
  const rejected = qs.filter((q) => q.status === "rejected").length;
  const revenue = qs.filter((q) => q.status === "accepted").reduce((s, q) => s + Number(q.total || 0), 0);
  const revCurrency = qs.find((q) => q.status === "accepted")?.currency ?? "INR";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your quotations and pipeline.</p>
        </div>
        <Button asChild className="gap-2 shadow-elegant">
          <Link to="/quotations/new"><Plus className="h-4 w-4" /> Quick Generate</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Total Quotations" value={total} icon={FileText} accent="text-primary" />
        <Stat title="Accepted" value={accepted} icon={CheckCircle2} accent="text-success" />
        <Stat title="Pending" value={pending} icon={Clock} accent="text-warning" />
        <Stat title="Rejected" value={rejected} icon={XCircle} accent="text-destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-1 text-sm text-muted-foreground">Revenue (accepted)</div>
          <div className="text-3xl font-bold">{formatMoney(revenue, revCurrency)}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3 w-3" /> From {accepted} accepted quote{accepted === 1 ? "" : "s"}
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> Clients
          </div>
          <div className="text-3xl font-bold">{data?.clientCount ?? 0}</div>
          <Link to="/clients" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Manage clients <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Recent Quotations</h2>
            <p className="text-xs text-muted-foreground">Your latest 10 quotes</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/quotations">View all</Link></Button>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : qs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="mb-4 text-sm text-muted-foreground">No quotations yet.</p>
            <Button asChild><Link to="/quotations/new">Create your first quote</Link></Button>
          </div>
        ) : (
          <div className="divide-y">
            {qs.slice(0, 10).map((q) => {
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
                      <span className="font-medium">{q.title || "Untitled"}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      #{q.quotation_number} · {snap?.business_name || "No client"}
                    </div>
                  </div>
                  <div className="text-right font-semibold">{formatMoney(Number(q.total || 0), q.currency)}</div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ title, value, icon: Icon, accent }: { title: string; value: number; icon: React.ComponentType<{ className?: string }>; accent: string }) {
  return (
    <Card className="p-6 transition-transform hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    sent: { label: "Sent", className: "bg-primary/10 text-primary" },
    accepted: { label: "Accepted", className: "bg-success/10 text-success" },
    rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
    expired: { label: "Expired", className: "bg-warning/10 text-warning" },
  };
  const s = map[status] ?? map.draft;
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>;
}