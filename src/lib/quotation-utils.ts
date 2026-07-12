export type Feature = { id: string; label: string; included: boolean };
export type Milestone = { id: string; label: string; percent: number };
export type TimelineStep = { id: string; week: string; label: string };

export const uid = () => Math.random().toString(36).slice(2, 10);

export function suggestMilestones(): Milestone[] {
  return [
    { id: uid(), label: "Advance", percent: 30 },
    { id: uid(), label: "Design & UI Approval", percent: 40 },
    { id: uid(), label: "Delivery & Deployment", percent: 30 },
  ];
}

export function suggestTimeline(): TimelineStep[] {
  return [
    { id: uid(), week: "Week 1", label: "Planning & Requirements" },
    { id: uid(), week: "Week 2", label: "UI / UX Design" },
    { id: uid(), week: "Week 3", label: "Frontend Development" },
    { id: uid(), week: "Week 4", label: "Backend Development" },
    { id: uid(), week: "Week 5", label: "Testing & QA" },
    { id: uid(), week: "Week 6", label: "Deployment & Handover" },
  ];
}

export function calcTotal(subtotal: number, discountPercent: number, taxPercent: number) {
  const afterDiscount = subtotal * (1 - (discountPercent || 0) / 100);
  const total = afterDiscount * (1 + (taxPercent || 0) / 100);
  return {
    afterDiscount: Math.round(afterDiscount * 100) / 100,
    tax: Math.round((afterDiscount * ((taxPercent || 0) / 100)) * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function generateQuoteNumber(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QF-${y}${m}-${rand}`;
}