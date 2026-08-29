Hilltop Market — simple static website

This repository contains a minimal, responsive static website for Hilltop Market created from the Instagram and Wheree links you provided.

Files created
- index.html — main site
- styles.css — styling
- README.md — this file

How to run
- Open `index.html` in your browser (double-click) OR
- Serve locally (recommended):

  python3 -m http.server 8000

  then open http://localhost:8000

Next steps I can do for you
- Add real photos and logo (replace assets)
- Wire a contact/subscribe backend (Formspree, Netlify Functions, or simple Node/Express)
- Add Google Maps embed with exact address
- Convert to a React/Vite or Next.js site and deploy to Vercel/Netlify

Instagram embeds
- The site includes a simple Instagram manager: paste public Instagram post URLs into the "Instagram" section and they'll be embedded on the page. URLs are stored locally in your browser (localStorage).
- Instagram embeds are subject to Instagram's terms — only public posts can be embedded. If you'd like automatic fetching, we can set up a server-side integration, but that requires Instagram API access.

Tell me which next step you want and I'll implement it.
