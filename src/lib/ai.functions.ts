import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  documentation: z.string().min(10),
  projectName: z.string().optional(),
});

type AIResult = {
  summary: string;
  features: string[];
  scope: string[];
  deliverables: string[];
  assumptions: string[];
  milestones: { label: string; percent: number }[];
  timeline: { week: string; label: string }[];
  suggestedPrice: number | null;
  maintenance: string[];
  contractClauses: string[];
  proposalIntro: string;
  raw: string;
};

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON in AI response");
  return JSON.parse(cleaned.slice(first, last + 1));
}

export const analyzeDocumentation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AIResult> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `You are an expert software project analyst. Read the following project documentation and produce a strict JSON object with these keys:

summary (string, 2-3 sentences),
features (string[]) — every deliverable feature you can identify,
scope (string[]) — scope of work bullets,
deliverables (string[]),
assumptions (string[]),
milestones (array of { label, percent }) — payment milestones summing to 100,
timeline (array of { week, label }) — week-by-week plan (e.g. "Week 1"),
suggestedPrice (number or null) — estimated project price in the client's likely currency (bare number),
maintenance (string[]) — recommended maintenance scope items,
contractClauses (string[]) — key contract clause topics,
proposalIntro (string, 3-5 sentences suitable as proposal introduction).

Return ONLY the JSON object, no prose.

Project name: ${data.projectName ?? "Untitled"}

Documentation:
${data.documentation.slice(0, 30000)}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        }),
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini error ${res.status}: ${errBody.slice(0, 400)}`);
    }
    const body = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson(text) as Partial<AIResult>;

    return {
      summary: String(parsed.summary ?? ""),
      features: (parsed.features ?? []).filter(Boolean).map(String),
      scope: (parsed.scope ?? []).filter(Boolean).map(String),
      deliverables: (parsed.deliverables ?? []).filter(Boolean).map(String),
      assumptions: (parsed.assumptions ?? []).filter(Boolean).map(String),
      milestones: Array.isArray(parsed.milestones)
        ? parsed.milestones.map((m) => ({ label: String(m.label ?? ""), percent: Number(m.percent ?? 0) }))
        : [],
      timeline: Array.isArray(parsed.timeline)
        ? parsed.timeline.map((t) => ({ week: String(t.week ?? ""), label: String(t.label ?? "") }))
        : [],
      suggestedPrice:
        typeof parsed.suggestedPrice === "number" && Number.isFinite(parsed.suggestedPrice)
          ? parsed.suggestedPrice
          : null,
      maintenance: (parsed.maintenance ?? []).filter(Boolean).map(String),
      contractClauses: (parsed.contractClauses ?? []).filter(Boolean).map(String),
      proposalIntro: String(parsed.proposalIntro ?? ""),
      raw: text,
    };
  });