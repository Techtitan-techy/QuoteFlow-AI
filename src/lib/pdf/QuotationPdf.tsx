import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Feature, Milestone, TimelineStep } from "@/lib/quotation-utils";
import { formatMoney } from "@/lib/currencies";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, borderBottom: 2, borderColor: "#2563eb", paddingBottom: 12 },
  brand: { fontSize: 22, fontWeight: 700, color: "#2563eb" },
  meta: { fontSize: 9, color: "#64748b", textAlign: "right" },
  h2: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.5 },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  block: { padding: 10, backgroundColor: "#f8fafc", borderRadius: 6 },
  label: { fontSize: 8, color: "#64748b", marginBottom: 2, textTransform: "uppercase" },
  value: { fontSize: 10, fontWeight: 600 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 4, paddingVertical: 3 },
  check: { width: 12, height: 12, marginRight: 6, backgroundColor: "#2563eb", borderRadius: 2, textAlign: "center", color: "white", fontSize: 8, fontWeight: 700, paddingTop: 1 },
  uncheck: { width: 12, height: 12, marginRight: 6, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 2 },
  table: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  th: { padding: 8, backgroundColor: "#f1f5f9", fontWeight: 700, fontSize: 9 },
  td: { padding: 8, fontSize: 10 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  totalCell: { width: 180, flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandTotal: { fontSize: 14, fontWeight: 700, color: "#2563eb" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#94a3b8", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8 },
  timelineItem: { flexDirection: "row", marginBottom: 4 },
  weekBadge: { width: 60, fontWeight: 700, color: "#2563eb" },
});

export type QuotationPdfData = {
  quotationNumber: string;
  title?: string;
  issueDate: string;
  expiryDate?: string;
  currency: string;
  subtotal: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
  features: Feature[];
  milestones: Milestone[];
  timeline: TimelineStep[];
  notes?: string;
  terms?: string;
  company: {
    company_name?: string;
    company_address?: string;
    company_email?: string;
    company_phone?: string;
    company_website?: string;
    gst_number?: string;
    pan_number?: string;
    bank_details?: Record<string, string>;
    upi_id?: string;
  };
  client: {
    business_name?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    billing_address?: string;
    gst_number?: string;
  };
};

export function QuotationPdf({ data }: { data: QuotationPdfData }) {
  const money = (n: number) => formatMoney(n, data.currency);
  const included = data.features.filter((f) => f.included);
  const subtotalAfterDiscount = data.subtotal * (1 - (data.discountPercent || 0) / 100);
  const taxAmount = subtotalAfterDiscount * ((data.taxPercent || 0) / 100);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>{data.company.company_name || "Your Company"}</Text>
            <Text style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>{data.company.company_address || ""}</Text>
            <Text style={{ fontSize: 8, color: "#64748b" }}>
              {[data.company.company_email, data.company.company_phone, data.company.company_website].filter(Boolean).join("  •  ")}
            </Text>
            {data.company.gst_number ? <Text style={{ fontSize: 8, color: "#64748b" }}>GST: {data.company.gst_number}</Text> : null}
          </View>
          <View style={s.meta}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>QUOTATION</Text>
            <Text>#{data.quotationNumber}</Text>
            <Text>Issued: {data.issueDate}</Text>
            {data.expiryDate ? <Text>Valid until: {data.expiryDate}</Text> : null}
          </View>
        </View>

        <View style={s.row}>
          <View style={[s.col, s.block]}>
            <Text style={s.label}>Billed To</Text>
            <Text style={s.value}>{data.client.business_name || "—"}</Text>
            {data.client.contact_person ? <Text style={{ fontSize: 9 }}>{data.client.contact_person}</Text> : null}
            {data.client.email ? <Text style={{ fontSize: 9, color: "#64748b" }}>{data.client.email}</Text> : null}
            {data.client.phone ? <Text style={{ fontSize: 9, color: "#64748b" }}>{data.client.phone}</Text> : null}
            {data.client.billing_address ? <Text style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{data.client.billing_address}</Text> : null}
          </View>
          <View style={[s.col, s.block]}>
            <Text style={s.label}>Project</Text>
            <Text style={s.value}>{data.title || "Untitled Project"}</Text>
            <Text style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>Currency: {data.currency}</Text>
          </View>
        </View>

        {included.length > 0 && (
          <View style={[s.section, { marginTop: 16 }]}>
            <Text style={s.h2}>Features & Deliverables</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {data.features.map((f) => (
                <View key={f.id} style={[s.featureRow, { width: "50%" }]}>
                  {f.included ? <Text style={s.check}>✓</Text> : <Text style={s.uncheck}> </Text>}
                  <Text style={{ fontSize: 9, color: f.included ? "#0f172a" : "#94a3b8" }}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.h2}>Payment Schedule</Text>
          <View style={s.table}>
            <View style={s.tr}>
              <Text style={[s.th, { flex: 3 }]}>Milestone</Text>
              <Text style={[s.th, { flex: 1, textAlign: "right" }]}>%</Text>
              <Text style={[s.th, { flex: 2, textAlign: "right" }]}>Amount</Text>
            </View>
            {data.milestones.map((m) => (
              <View key={m.id} style={s.tr}>
                <Text style={[s.td, { flex: 3 }]}>{m.label}</Text>
                <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{m.percent}%</Text>
                <Text style={[s.td, { flex: 2, textAlign: "right", fontWeight: 600 }]}>{money((data.subtotal * m.percent) / 100)}</Text>
              </View>
            ))}
          </View>
        </View>

        {data.timeline.length > 0 && (
          <View style={s.section}>
            <Text style={s.h2}>Project Timeline</Text>
            {data.timeline.map((t) => (
              <View key={t.id} style={s.timelineItem}>
                <Text style={s.weekBadge}>{t.week}</Text>
                <Text>{t.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ ...s.section, alignItems: "flex-end" }}>
          <View style={{ width: 220 }}>
            <View style={s.totalCell}><Text>Subtotal</Text><Text>{money(data.subtotal)}</Text></View>
            <View style={s.totalCell}><Text>Discount ({data.discountPercent}%)</Text><Text>-{money(data.subtotal - subtotalAfterDiscount)}</Text></View>
            <View style={s.totalCell}><Text>Tax ({data.taxPercent}%)</Text><Text>{money(taxAmount)}</Text></View>
            <View style={[s.totalCell, { borderTopWidth: 1, borderTopColor: "#2563eb", paddingTop: 6, marginTop: 4 }]}>
              <Text style={s.grandTotal}>Total</Text>
              <Text style={s.grandTotal}>{money(data.total)}</Text>
            </View>
          </View>
        </View>

        {(data.company.bank_details?.account_number || data.company.upi_id) && (
          <View style={s.section}>
            <Text style={s.h2}>Payment Details</Text>
            <View style={s.block}>
              {data.company.bank_details?.account_name ? <Text style={{ fontSize: 9 }}>Account: {data.company.bank_details.account_name}</Text> : null}
              {data.company.bank_details?.account_number ? <Text style={{ fontSize: 9 }}>A/C: {data.company.bank_details.account_number}</Text> : null}
              {data.company.bank_details?.ifsc ? <Text style={{ fontSize: 9 }}>IFSC: {data.company.bank_details.ifsc}</Text> : null}
              {data.company.bank_details?.bank_name ? <Text style={{ fontSize: 9 }}>Bank: {data.company.bank_details.bank_name}</Text> : null}
              {data.company.upi_id ? <Text style={{ fontSize: 9 }}>UPI: {data.company.upi_id}</Text> : null}
            </View>
          </View>
        )}

        {data.notes ? (
          <View style={s.section}>
            <Text style={s.h2}>Notes</Text>
            <Text style={{ fontSize: 9, color: "#334155", lineHeight: 1.5 }}>{data.notes}</Text>
          </View>
        ) : null}

        {data.terms ? (
          <View style={s.section}>
            <Text style={s.h2}>Terms & Conditions</Text>
            <Text style={{ fontSize: 9, color: "#334155", lineHeight: 1.5 }}>{data.terms}</Text>
          </View>
        ) : null}

        <Text style={s.footer} fixed>
          {data.company.company_name || "QuoteFlow ai"} • Generated with QuoteFlow ai
        </Text>
      </Page>
    </Document>
  );
}