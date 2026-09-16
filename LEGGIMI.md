# Anteprime online per il cliente — come pubblicarle (5 minuti)

Cartella pronta per **Cloudflare Pages** (statico, nessun build).

## Opzione A — caricamento diretto (più veloce)
1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Nome progetto: `corso107-anteprime` (URL: `https://corso107-anteprime.pages.dev`).
3. Trascina **tutto il contenuto** di questa cartella (index.html, home.html, direzioni.html, shots/, _headers, robots.txt).
4. Deploy → invia al cliente il link `https://corso107-anteprime.pages.dev`.

## Opzione B — da GitHub (aggiornamenti automatici)
1. Crea un repo (es. `corso107-anteprime`) e carica questa cartella nella root.
2. Cloudflare → Workers & Pages → Create → Pages → **Connect to Git** → scegli il repo → build command vuoto, output directory `/`.
3. Ogni push aggiorna l'anteprima.

## Proteggere con password (opzionale)
Cloudflare → **Zero Trust** → Access → Applications → Add → Self-hosted → dominio `corso107-anteprime.pages.dev` → policy "Allow" con **One-time PIN** per l'email del proprietario. Gratuito fino a 50 utenti.

## Note
- `_headers` e `robots.txt` impediscono l'indicizzazione (X-Robots-Tag noindex).
- Link diretti alle singole anteprime: `home.html#h01` … `home.html#h05`.
- Per aggiornare: sostituisci i file e ricarica (o fai push).
