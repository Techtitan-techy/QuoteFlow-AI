import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currencies";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — QuoteFlow AI" }] }),
});

type Profile = {
  full_name: string | null;
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  gst_number: string | null;
  pan_number: string | null;
  upi_id: string | null;
  default_currency: string;
  default_tax_rate: number;
  default_terms: string | null;
  bank_details: {
    account_name?: string;
    account_number?: string;
    ifsc?: string;
    bank_name?: string;
  };
};

const emptyProfile: Profile = {
  full_name: "",
  company_name: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_website: "",
  gst_number: "",
  pan_number: "",
  upi_id: "",
  default_currency: "INR",
  default_tax_rate: 18,
  default_terms: "",
  bank_details: {},
};

function SettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Profile>(emptyProfile);

  const { data } = useQuery({
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

  useEffect(() => {
    if (data) {
      setForm({
        ...emptyProfile,
        ...(data as Partial<Profile>),
        bank_details: (data.bank_details as Profile["bank_details"]) ?? {},
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").upsert({
        id: u.user.id,
        ...form,
        default_tax_rate: Number(form.default_tax_rate) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Company profile, defaults, and payment details.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Company Profile</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Your Name">
              <Input
                value={form.full_name ?? ""}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </F>
            <F label="Company Name">
              <Input
                value={form.company_name ?? ""}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
            </F>
            <F label="Company Email">
              <Input
                type="email"
                value={form.company_email ?? ""}
                onChange={(e) => setForm({ ...form, company_email: e.target.value })}
              />
            </F>
            <F label="Phone">
              <Input
                value={form.company_phone ?? ""}
                onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
              />
            </F>
            <F label="Website">
              <Input
                value={form.company_website ?? ""}
                onChange={(e) => setForm({ ...form, company_website: e.target.value })}
              />
            </F>
            <F label="GST Number">
              <Input
                value={form.gst_number ?? ""}
                onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
              />
            </F>
            <F label="PAN">
              <Input
                value={form.pan_number ?? ""}
                onChange={(e) => setForm({ ...form, pan_number: e.target.value })}
              />
            </F>
            <div className="sm:col-span-2">
              <F label="Address">
                <Textarea
                  rows={2}
                  value={form.company_address ?? ""}
                  onChange={(e) => setForm({ ...form, company_address: e.target.value })}
                />
              </F>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Defaults</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Default Currency">
              <Select
                value={form.default_currency}
                onValueChange={(v) => setForm({ ...form, default_currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} · {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Default Tax %">
              <Input
                type="number"
                step="0.01"
                value={form.default_tax_rate}
                onChange={(e) => setForm({ ...form, default_tax_rate: Number(e.target.value) })}
              />
            </F>
            <div className="sm:col-span-2">
              <F label="Default Terms & Conditions">
                <Textarea
                  rows={4}
                  value={form.default_terms ?? ""}
                  onChange={(e) => setForm({ ...form, default_terms: e.target.value })}
                  placeholder="Payment due within 15 days of invoice. All prices exclusive of taxes unless stated…"
                />
              </F>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Payment Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Account Name">
              <Input
                value={form.bank_details.account_name ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, account_name: e.target.value },
                  })
                }
              />
            </F>
            <F label="Account Number">
              <Input
                value={form.bank_details.account_number ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, account_number: e.target.value },
                  })
                }
              />
            </F>
            <F label="IFSC / SWIFT">
              <Input
                value={form.bank_details.ifsc ?? ""}
                onChange={(e) =>
                  setForm({ ...form, bank_details: { ...form.bank_details, ifsc: e.target.value } })
                }
              />
            </F>
            <F label="Bank Name">
              <Input
                value={form.bank_details.bank_name ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, bank_name: e.target.value },
                  })
                }
              />
            </F>
            <F label="UPI ID">
              <Input
                value={form.upi_id ?? ""}
                onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
              />
            </F>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
