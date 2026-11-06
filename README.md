# The Crisp Panel

A mobile-friendly voting app for a team crisp tasting. Each judge awards gold, silver and bronze (3, 2 and 1 points), and the organiser sees the combined ranking behind a code.

- `index.html` – the voting page, results view and preview mode
- `Code.gs` – Google Apps Script server: stores votes in a Google Sheet, stops duplicates, checks the organiser code
- `SETUP.md` – how to put it live on GitHub Pages or as an Apps Script link
- `qr-poster.png` – A4 poster with the QR code (`poster.html` is its source; `qr.png` / `qr.svg` are the code on its own)
- `mascot.png` – the BB crisp mascot

Open `index.html` in a browser to try it in preview mode (organiser code `crisps`). The real organiser code is a Script Property in Apps Script (`ORGANISER_CODE`), so it's never stored in this repo.
