import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  Users,
  Zap,
  Shield,
  Palette,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen gradient-subtle">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-elegant">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">QuoteFlow AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
          <Sparkles className="h-3 w-3 text-primary" /> AI-powered proposals & quotations
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Professional quotes,{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            drafted in minutes.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          For freelancers, agencies, and IT companies. Generate beautiful quotations, proposals, and
          invoices with AI — from a paragraph of project docs.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">See dashboard</Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" /> No credit card
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" /> Unlimited clients
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" /> Multi-currency
          </span>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "AI documentation parsing",
            body: "Paste project docs — get features, scope, timeline, and pricing automatically.",
          },
          {
            icon: FileText,
            title: "Beautiful PDFs",
            body: "Premium, editable quotation templates with your branding and payment schedule.",
          },
          {
            icon: Users,
            title: "Unlimited clients",
            body: "Full CRM: GST, PAN, billing, projects, notes — everything in one place.",
          },
          {
            icon: Palette,
            title: "Fully editable",
            body: "Every AI suggestion stays fully editable. You keep control.",
          },
          {
            icon: Shield,
            title: "Secure by default",
            body: "Row-level security and encrypted storage for your business data.",
          },
          {
            icon: Sparkles,
            title: "Multi-currency",
            body: "INR, USD, EUR, GBP and more — send quotes to clients anywhere.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
          >
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t bg-card/60">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} QuoteFlow AI
        </div>
      </footer>
    </div>
  );
}
