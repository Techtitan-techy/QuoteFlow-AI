import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Save, Download, Sparkles, Plus, X, Trash2, FileText, Users, Wallet, Calendar, Wand2, Loader2, CheckCircle2, XCircle, Send,
} from "lucide-react";
import { CURRENCIES, formatMoney } from "@/lib/currencies";
import { calcTotal, uid, type Feature, type Milestone, type TimelineStep } from "@/lib/quotation-utils";
import { FEATURE_PRESETS } from "@/lib/feature-presets";
import { analyzeDocumentation } from "@/lib/ai.functions";
import { pdf } from "@react-pdf/renderer";
import { QuotationPdf, type QuotationPdfData } from "@/lib/pdf/QuotationPdf";
import { StatusBadge } from "@/routes/_authenticated.dashboard";

export type QuotationDraft = {
  id: string | null;
  quotation_number: string;
  title: string;
  client_id: string | null;
  issue_date: string;
  expiry_date: string;
  currency: string;
  subtotal: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  features: Feature[];
  milestones: Milestone[];
  timeline: TimelineStep[];
  notes: string;
  terms: string;
  status: string;
};

export function QuotationEditor({ initial, onSaved }: { initial: QuotationDraft; onSaved?: (id: string) => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState<QuotationDraft>(initial);
  const [aiOpen, setAiOpen] = useState(false);
  const [addFeatureLabel, setAddFeatureLabel] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, business_name, contact_person, email, phone, billing_address, gst_number").order("business_name");
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return data;
    },
  });

  // Keep total in sync
  const totals = useMemo(() => calcTotal(q.subtotal, q.discount_percent, q.tax_percent), [q.subtotal, q.discount_percent, q.tax_percent]);
  useEffect(() => { setQ((s) => ({ ...s, total: totals.total })); }, [totals.total]);

  const selectedClient = clients.find((c) => c.id === q.client_id);

  const save = useMutation({
    mutationFn: async (statusOverride?: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const payload = {
        user_id: u.user.id,
        client_id: q.client_id,
        quotation_number: q.quotation_number,
        title: q.title || null,
        issue_date: q.issue_date,
        expiry_date: q.expiry_date || null,
        currency: q.currency,
        subtotal: q.subtotal,
        discount_percent: q.discount_percent,
        tax_percent: q.tax_percent,
        total: totals.total,
        features: q.features,
        milestones: q.milestones,
        timeline: q.timeline,
        notes: q.notes || null,
        terms: q.terms || null,
        status: statusOverride ?? q.status,
        client_snapshot: selectedClient ?? null,
        company_snapshot: profile ?? null,
      };
      if (q.id) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", q.id);
        if (error) throw error;
        return q.id;
      }
      const { data, error } = await supabase.from("quotations").insert(payload).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id, statusOverride) => {
      toast.success(statusOverride ? "Status updated" : "Quotation saved");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (!q.id && onSaved) onSaved(id);
      if (statusOverride) setQ((s) => ({ ...s, status: statusOverride, id }));
      else setQ((s) => ({ ...s, id }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFeature = (label: string) => {
    setQ((s) => {
      const idx = s.features.findIndex((f) => f.label === label);
      if (idx === -1) return { ...s, features: [...s.features, { id: uid(), label, included: true }] };
      const copy = [...s.features];
      copy[idx] = { ...copy[idx], included: !copy[idx].included };
      return { ...s, features: copy };
    });
  };

  const addCustomFeature = () => {
    if (!addFeatureLabel.trim()) return;
    setQ((s) => ({ ...s, features: [...s.features, { id: uid(), label: addFeatureLabel.trim(), included: true }] }));
    setAddFeatureLabel("");
  };

  const downloadPdf = async () => {
    try {
      const pdfData: QuotationPdfData = {
        quotationNumber: q.quotation_number,
        title: q.title,
        issueDate: q.issue_date,
        expiryDate: q.expiry_date || undefined,
        currency: q.currency,
        subtotal: q.subtotal,
        discountPercent: q.discount_percent,
        taxPercent: q.tax_percent,
        total: totals.total,
        features: q.features,
        milestones: q.milestones,
        timeline: q.timeline,
        notes: q.notes,
        terms: q.terms,
        company: {
          company_name: profile?.company_name ?? undefined,
          company_address: profile?.company_address ?? undefined,
          company_email: profile?.company_email ?? undefined,
          company_phone: profile?.company_phone ?? undefined,
          company_website: profile?.company_website ?? undefined,
          gst_number: profile?.gst_number ?? undefined,
          pan_number: profile?.pan_number ?? undefined,
          bank_details: (profile?.bank_details as Record<string, string>) ?? {},
          upi_id: profile?.upi_id ?? undefined,
        },
        client: selectedClient
          ? {
              business_name: selectedClient.business_name,
              contact_person: selectedClient.contact_person ?? undefined,
              email: selectedClient.email ?? undefined,
              phone: selectedClient.phone ?? undefined,
              billing_address: selectedClient.billing_address ?? undefined,
              gst_number: selectedClient.gst_number ?? undefined,
            }
          : {},
      };
      const blob = await pdf(<QuotationPdf data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${q.quotation_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> Quotation #{q.quotation_number}
            <StatusBadge status={q.status} />
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{q.title || "Untitled Quotation"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setAiOpen(true)}>
            <Sparkles className="h-4 w-4" /> AI Assist
          </Button>
          <Button variant="outline" className="gap-2" onClick={downloadPdf}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button className="gap-2" onClick={() => save.mutate(undefined)} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </Button>
        </div>
      </div>

      {q.id && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" className="gap-2" onClick={() => save.mutate("sent")}><Send className="h-3 w-3" /> Mark Sent</Button>
          <Button size="sm" variant="secondary" className="gap-2 text-success" onClick={() => save.mutate("accepted")}><CheckCircle2 className="h-3 w-3" /> Accepted</Button>
          <Button size="sm" variant="secondary" className="gap-2 text-destructive" onClick={() => save.mutate("rejected")}><XCircle className="h-3 w-3" /> Rejected</Button>
        </div>
      )}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes & Terms</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" /> Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Project Title"><Input value={q.title} onChange={(e) => setQ({ ...q, title: e.target.value })} placeholder="E-commerce Website Development" /></F>
              <F label="Client">
                <Select value={q.client_id ?? "none"} onValueChange={(v) => setQ({ ...q, client_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.business_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
              <F label="Quotation Number"><Input value={q.quotation_number} onChange={(e) => setQ({ ...q, quotation_number: e.target.value })} /></F>
              <F label="Currency">
                <Select value={q.currency} onValueChange={(v) => setQ({ ...q, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} · {c.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
              <F label="Issue Date"><Input type="date" value={q.issue_date} onChange={(e) => setQ({ ...q, issue_date: e.target.value })} /></F>
              <F label="Expiry Date"><Input type="date" value={q.expiry_date} onChange={(e) => setQ({ ...q, expiry_date: e.target.value })} /></F>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-4 space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Features Checklist</h2>
              <span className="text-xs text-muted-foreground">{q.features.filter((f) => f.included).length} selected</span>
            </div>

            <div className="space-y-6">
              {Object.entries(FEATURE_PRESETS).map(([group, items]) => (
                <div key={group}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((label) => {
                      const present = q.features.find((f) => f.label === label);
                      const checked = !!present?.included;
                      return (
                        <label key={label} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors hover:bg-accent/40">
                          <Checkbox checked={checked} onCheckedChange={() => toggleFeature(label)} />
                          <span className={checked ? "" : "text-muted-foreground"}>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custom Features</div>
                <div className="flex gap-2">
                  <Input value={addFeatureLabel} onChange={(e) => setAddFeatureLabel(e.target.value)} placeholder="Add a custom feature…" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomFeature(); } }} />
                  <Button type="button" onClick={addCustomFeature} className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.features
                    .filter((f) => !Object.values(FEATURE_PRESETS).flat().includes(f.label))
                    .map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        {f.label}
                        <button onClick={() => setQ((s) => ({ ...s, features: s.features.filter((x) => x.id !== f.id) }))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <F label={`Final Project Price (${q.currency})`}>
                <Input type="number" step="0.01" value={q.subtotal} onChange={(e) => setQ({ ...q, subtotal: Number(e.target.value) })} />
              </F>
              <F label="Discount %"><Input type="number" step="0.01" value={q.discount_percent} onChange={(e) => setQ({ ...q, discount_percent: Number(e.target.value) })} /></F>
              <F label="Tax %"><Input type="number" step="0.01" value={q.tax_percent} onChange={(e) => setQ({ ...q, tax_percent: Number(e.target.value) })} /></F>
              <div className="rounded-lg gradient-primary p-4 text-white shadow-elegant">
                <div className="text-xs opacity-80">Total</div>
                <div className="text-2xl font-bold">{formatMoney(totals.total, q.currency)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Payment Milestones</h2>
              <span className={`text-xs ${q.milestones.reduce((s, m) => s + m.percent, 0) === 100 ? "text-success" : "text-warning"}`}>
                Total: {q.milestones.reduce((s, m) => s + m.percent, 0)}%
              </span>
            </div>
            <div className="space-y-2">
              {q.milestones.map((m, i) => (
                <div key={m.id} className="grid grid-cols-[1fr_100px_140px_auto] items-center gap-2">
                  <Input value={m.label} onChange={(e) => setQ({ ...q, milestones: q.milestones.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                  <Input type="number" value={m.percent} onChange={(e) => setQ({ ...q, milestones: q.milestones.map((x, j) => (j === i ? { ...x, percent: Number(e.target.value) } : x)) })} />
                  <div className="text-sm font-semibold text-right">{formatMoney((q.subtotal * m.percent) / 100, q.currency)}</div>
                  <Button size="icon" variant="ghost" onClick={() => setQ({ ...q, milestones: q.milestones.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setQ({ ...q, milestones: [...q.milestones, { id: uid(), label: "New milestone", percent: 0 }] })}>
                <Plus className="h-3 w-3" /> Add milestone
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><Calendar className="h-4 w-4 text-primary" /> Project Timeline</h2>
            <div className="space-y-2">
              {q.timeline.map((t, i) => (
                <div key={t.id} className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
                  <Input value={t.week} onChange={(e) => setQ({ ...q, timeline: q.timeline.map((x, j) => (j === i ? { ...x, week: e.target.value } : x)) })} />
                  <Input value={t.label} onChange={(e) => setQ({ ...q, timeline: q.timeline.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                  <Button size="icon" variant="ghost" onClick={() => setQ({ ...q, timeline: q.timeline.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setQ({ ...q, timeline: [...q.timeline, { id: uid(), week: `Week ${q.timeline.length + 1}`, label: "" }] })}>
                <Plus className="h-3 w-3" /> Add step
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="mb-2 font-semibold">Notes</h2>
            <Textarea rows={4} value={q.notes} onChange={(e) => setQ({ ...q, notes: e.target.value })} placeholder="Additional notes for the client…" />
          </Card>
          <Card className="p-6">
            <h2 className="mb-2 font-semibold">Terms & Conditions</h2>
            <Textarea rows={6} value={q.terms} onChange={(e) => setQ({ ...q, terms: e.target.value })} placeholder="Terms and conditions…" />
          </Card>
        </TabsContent>
      </Tabs>

      <AIAssistDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        onApply={(result) => {
          setQ((s) => ({
            ...s,
            title: s.title || (result.summary ? result.summary.split(".")[0].slice(0, 80) : s.title),
            notes: result.summary ? result.summary : s.notes,
            subtotal: result.suggestedPrice ?? s.subtotal,
            features: [
              ...s.features,
              ...result.features
                .filter((label) => !s.features.some((f) => f.label === label))
                .map((label) => ({ id: uid(), label, included: true })),
            ],
            milestones: result.milestones.length ? result.milestones.map((m) => ({ id: uid(), ...m })) : s.milestones,
            timeline: result.timeline.length ? result.timeline.map((t) => ({ id: uid(), ...t })) : s.timeline,
          }));
          toast.success("AI suggestions applied");
          setAiOpen(false);
        }}
      />
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

function AIAssistDialog({ open, onOpenChange, onApply }: { open: boolean; onOpenChange: (o: boolean) => void; onApply: (r: Awaited<ReturnType<typeof analyzeDocumentation>>) => void }) {
  const [doc, setDoc] = useState("");
  const [name, setName] = useState("");
  const analyze = useServerFn(analyzeDocumentation);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (doc.trim().length < 20) {
      toast.error("Please paste more detailed documentation");
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let token = session?.access_token;
      
      if (!token && typeof window !== "undefined" && localStorage.getItem("mock_admin") === "true") {
        token = "mock_token";
      }

      const result = await analyze({ 
        data: {
          documentation: doc, 
          projectName: name || undefined,
          token: token ?? undefined
        }
      });
      onApply(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> AI Assist — Analyze Documentation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paste project documentation, a spec, or a brief. AI will extract features, scope, timeline, milestones, and suggest pricing.
        </p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Project name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Acme E-commerce Platform" />
          </div>
          <div>
            <Label className="text-xs">Documentation</Label>
            <Textarea rows={12} value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Paste project docs, requirements, or brief here…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={run} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Analyzing…" : "Generate with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}