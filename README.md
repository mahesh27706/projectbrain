# ProjectBrain v0.1

Paste a public GitHub link, get a plain-language overview, then ask questions about the code.
v0.1 sends the most useful files (up to about 150 KB) to Gemini and asks for cited answers. No database, no login.

## Run it
1. Create a Gemini API key in Google AI Studio. Optionally create a read-only GitHub token.
2. `npm install`
3. Copy `.env.example` to `.env` and fill in the keys.
4. `npx vercel dev` (the API route needs the Vercel dev server; log in to Vercel when asked).

## Deploy
1. Push this folder to a new GitHub repo.
2. Import it at vercel.com. Framework preset: Vite.
3. Add environment variables GEMINI_API_KEY, GITHUB_TOKEN (optional), GEMINI_MODEL (optional).
4. Deploy, then test with a sample repo.

## Next versions
Chunking and embeddings (RAG) in Supabase, code graph, drift detector, decision log, contribution ledger.
