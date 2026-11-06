# The Crisp Panel – setup

Two files:
- `Code.gs` saves votes to a Google Sheet, stops duplicate votes and checks the organiser code
- `index.html` is the page people vote on

Votes are always stored in your Google Sheet through Google Apps Script. You can show the page to voters in two ways:

- **A. GitHub Pages link** (`susanwalsh.github.io/crisp-panel`). The page lives on GitHub and sends votes to Apps Script.
- **B. Apps Script link**. Google serves the page itself, and only people signed in with a Monzo account can open it.

## Try it first (optional)

Open `index.html` in a browser. It runs in **preview mode**: votes are saved on that device only, and the organiser code is `crisps`. On the results screen, "Add 15 sample votes" lets you see what a full results screen looks like.

## 1. Set up the vote store (needed for both A and B)

1. **Create the sheet.** Go to sheets.new, then name the sheet *The Crisp Panel votes*.
2. **Open Apps Script.** In the sheet, go to **Extensions → Apps Script**.
3. **Add the server code.** Replace everything in `Code.gs` with the contents of this repo's `Code.gs`.
4. **Add the page.** Only needed for B, but it does no harm for A.
   - Click **+ → HTML** and name the file `index`. Apps Script adds `.html` itself.
   - Replace everything in it with `index.html`.
5. **Set the organiser code.** Click **Project Settings** (the cog), scroll to **Script Properties**, choose **Add script property**, and enter:
   - Property: `ORGANISER_CODE`
   - Value: your code (case doesn't matter)
   - Click **Save script properties**. To change the code later, edit this value. There's no need to redeploy.
   - The code never appears in the files or on GitHub.
6. **Deploy.** Go to **Deploy → New deployment**, click the cog and choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** **Anyone** for A, or **Anyone within Monzo** for B
   - Click **Deploy** and approve the permissions. Google will warn that the app is unverified, because it's your own script: choose *Advanced → Go to project*.
   - Copy the **Web app URL**. It ends in `/exec`.

## 2A. Go live on GitHub Pages

1. In `index.html`, find `const API_URL = '';` near the top of the script and paste your web app URL between the quotes.
2. Commit and push. Pages updates within about a minute.
3. Open https://susanwalsh.github.io/crisp-panel/. The preview banner should be gone.
4. Test it:
   - Submit a vote and check that it appears in the sheet's **Votes** tab.
   - Open **Organiser: view results** and enter your code.

With "Anyone" access, duplicate votes are caught per device, not per Monzo account. Anyone who finds the `/exec` URL in the public repo could also send votes. Check the Votes tab afterwards, and delete any rows that don't belong.

## 2B. Go live on the Apps Script link

Share the web app URL itself. People sign in with their Monzo Google account, so a second device doesn't add a second vote.

## Before the tasting

- Delete your test votes: in the Votes tab, delete every row below the header.
- Share the link in Slack, or turn it into a QR code for the table.

## How duplicates are handled

- Each person gets **one vote**.
- If someone votes again, they're shown their earlier vote and asked whether to replace it or keep it.
- Double taps and retries after a dropped connection are only counted once.

## Good to know

- **Results** show points, gold/silver/bronze counts, ties ("Joint 1st", "=2nd"), defences and who has voted. They don't update live: press **Refresh results**.
- **To change `Code.gs` after deploying**, go to **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.
- **To change the line-up**, edit `LINEUP` in `index.html` and `VALID_IDS` in `Code.gs`. The two must match.
- **To number the bowls**, match the page: No. 01 is Blanco Niño through to No. 11, Popchips (the same order as the Ocado receipt).
- **If Monzo doesn't allow "Anyone" access** (the option is missing or greyed out), use B instead.
