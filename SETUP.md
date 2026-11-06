# The Crisp Panel – setup

Two files:
- `Code.gs` saves votes to a Google Sheet and checks the organiser code
- `Index.html` is the page people vote on

Setup takes about 10 minutes and needs only your Google work account. There's no extra service, no hosting and nobody has to create an account.

## Try it first (optional)

Open `Index.html` in a browser. It runs in **preview mode**: votes are saved on that device only, and the organiser code is `crisps`. On the results screen, "Add 15 sample votes" lets you see what a full results screen looks like.

## Publish it

1. **Create the sheet.** Go to sheets.new, then name the sheet *The Crisp Panel votes*.
2. **Open Apps Script.** In the sheet, go to **Extensions → Apps Script**.
3. **Add the server code.** Replace everything in `Code.gs` with the contents of this folder's `Code.gs`.
4. **Set the organiser code.** In Apps Script, click **Project Settings** (the cog), scroll to **Script Properties**, choose **Add script property**, and enter:
   - Property: `ORGANISER_CODE`
   - Value: your code (case doesn't matter)
   - Click **Save script properties**. To change the code later, edit this value. There's no need to redeploy.
   - The code never appears in the files or on GitHub, and voters can't see it.
5. **Add the page.**
   - Click **+ → HTML** and name the file `Index`. Apps Script adds `.html` itself.
   - Replace everything in it with this folder's `Index.html`.
   - Save with ⌘S.
6. **Deploy.** Go to **Deploy → New deployment**, click the cog and choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone within Monzo (your Workspace domain)
   - Click **Deploy** and approve the permissions. Google will warn that the app is unverified, because it's your own script: choose *Advanced → Go to project*.
7. **Test it.**
   - Open the web app URL, submit a vote, and check that it appears in the new **Votes** tab of the sheet.
   - Open **Organiser: view results** at the bottom of the page and enter your code.
8. **Clear your test votes.** In the Votes tab, delete every row below the header.
9. **Share the link.** Post the web app URL in Slack, or turn it into a QR code for the table.

## How it handles duplicates

- Each person gets **one vote**.
- With "Anyone within Monzo" access, the script recognises people by their work Google account, so a second phone or laptop doesn't add a second vote.
- If someone votes again, they're shown their earlier vote and asked whether to replace it or keep it.
- Double taps and retries after a dropped connection are only counted once.
- If you choose "Anyone" access instead, the script falls back to recognising each device.

## Good to know

- **The organiser code** stays on Google's server and is never sent to voters' browsers.
- **Results** show points, gold/silver/bronze counts, ties ("Joint 1st", "=2nd"), defences and who has voted. They don't update live: press **Refresh results**.
- **To change the page after publishing**, edit it, then go to **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.
- **To change the line-up**, edit the list in `Index.html` (`LINEUP`) and the ids in `Code.gs` (`VALID_IDS`). The two must match.
- **To number the bowls on the table**, match the page: No. 01 is Blanco Niño through to No. 11, Popchips (the same order as the Ocado receipt).
- **If Monzo blocks Apps Script web apps**, the Deploy step will fail or nobody else will be able to open the link. In that case the server side would need moving to Firebase or Supabase (free, but someone needs an account). The page is built so only the `call()` function in `Index.html` would need to change.
