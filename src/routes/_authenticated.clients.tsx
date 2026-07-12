import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Building2, Mail, Phone, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clients")({
  component: Clients,
  head: () => ({ meta: [{ title: "Clients — QuoteFlow ai" }] }),
});

type Client = {
  id: string;
  business_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  website: string | null;
  industry: string | null;
  notes: string | null;
};

const empty: Omit<Client, "id"> = {
  business_name: "", contact_person: null, email: null, phone: null, gst_number: null, pan_number: null,
  billing_address: null, shipping_address: null, country: null, state: null, city: null, website: null,
  industry: null, notes: null,
};

function Clients() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Omit<Client, "id">>(empty);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("business_name");
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Omit<Client, "id">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("clients").insert({ ...payload, user_id: userData.user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Client added");
      qc.invalidateQueries({ queryKey: ["clients"] });
      setForm(empty);
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client deleted");
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const filtered = clients.filter((c) =>
    !search || c.business_name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-muted-foreground">Manage your customer database.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => { e.preventDefault(); create.mutate(form); }}
            >
              <F label="Business Name *" required>
                <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required />
              </F>
              <F label="Contact Person"><Input value={form.contact_person ?? ""} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></F>
              <F label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></F>
              <F label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
              <F label="GST Number"><Input value={form.gst_number ?? ""} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} /></F>
              <F label="PAN"><Input value={form.pan_number ?? ""} onChange={(e) => setForm({ ...form, pan_number: e.target.value })} /></F>
              <F label="Website"><Input value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} /></F>
              <F label="Industry"><Input value={form.industry ?? ""} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></F>
              <F label="Country"><Input value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></F>
              <F label="State"><Input value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} /></F>
              <F label="City"><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></F>
              <div className="sm:col-span-2"><F label="Billing Address"><Textarea rows={2} value={form.billing_address ?? ""} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} /></F></div>
              <div className="sm:col-span-2"><F label="Shipping Address"><Textarea rows={2} value={form.shipping_address ?? ""} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} /></F></div>
              <div className="sm:col-span-2"><F label="Notes"><Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></F></div>
              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save client"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients…" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No clients yet. Add your first client to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <Button
                  size="icon" variant="ghost"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => confirm("Delete this client?") && del.mutate(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-3 truncate font-semibold">{c.business_name}</h3>
              {c.contact_person && <p className="truncate text-sm text-muted-foreground">{c.contact_person}</p>}
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {c.email && <div className="flex items-center gap-2 truncate"><Mail className="h-3 w-3" /> {c.email}</div>}
                {c.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {c.phone}</div>}
                {c.industry && <div className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5">{c.industry}</div>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function F({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}