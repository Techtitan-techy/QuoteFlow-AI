# QuoteFlow AI

QuoteFlow AI is a modern web application built for freelancers, agencies, and IT companies to generate professional quotations, proposals, invoices, and contracts in minutes. Powered by the Gemini API, it brings smart pricing and AI-driven content generation to your business operations.

## Features

- **AI-Powered Proposals**: Leverage Google Gemini to quickly draft and refine quotation descriptions and terms.
- **Beautiful PDFs**: Automatically generate pixel-perfect PDFs for your clients using `@react-pdf/renderer`.
- **Modern Tech Stack**: Built with TanStack Start, React 19, Tailwind CSS, and Vite.
- **Supabase Backend**: Fully integrated with Supabase for secure authentication, database storage, and real-time updates.
- **Vercel Ready**: Pre-configured Nitro preset for seamless, serverless deployment on Vercel.

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm or bun
- Supabase project
- Google AI Studio API Key (Gemini)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` and Supabase keys.

3. **Development Server**
   ```bash
   npm run dev
   ```

### Deployment

This project is configured to deploy directly to Vercel out of the box. 
1. Link your repository in Vercel.
2. Add your `.env` variables to the Vercel project settings.
3. Deploy! The build command `npm run build` handles everything automatically.

## Architecture

- **Frontend**: TanStack Router handles routing. Radix UI and TailwindCSS handle the accessible and modern UI components.
- **Backend**: API routes and server functions (`createServerFn`) are handled by Nitro, keeping secrets like your Gemini API key strictly on the server side.

## License
MIT
