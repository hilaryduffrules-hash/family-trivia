# 🎉 Family Trivia Night — Apps Script Backend Setup

**Total time: ~2 minutes**

## Step 1: Create the Google Sheet

1. Go to [sheets.new](https://sheets.new)
2. Name it: **Trivia Night Live**
3. Rename "Sheet1" tab → **Answers** (double-click the tab at bottom)
4. Add headers in row 1: `Timestamp | Team | Round | Q# | Answer | Points | Correct Answer | Feedback`
5. Create a new tab → name it **State**
6. In State sheet, enter:
   - A1: `round` | B1: `question`
   - A2: `1` | B2: `1`
7. (Optional) Create a **Scores** tab (not used by script, but nice to have)

## Step 2: Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**
2. Delete everything in the editor
3. Paste the entire contents of `apps-script-backend.js` (in this repo)
4. Click **Save** (Ctrl+S)

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙ → select **Web app**
3. Set:
   - Description: `Trivia Night v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → Allow
6. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/AKfyc.../exec`)

## Step 4: Update the Frontend

Open `index.html` and find this line near the top of the `<script>`:
```javascript
const SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
```
Replace with your actual URL, e.g.:
```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

## Step 5: Push to GitHub

```bash
cd /tmp/family-trivia
git add -A
git commit -m "feat: Apps Script backend, no server needed"
git push
```

## That's it! 🎉

The app now works entirely serverless:
- **Backend:** Google Sheets + Apps Script (free, always on, no tunnels)
- **Scoring:** Gemini AI runs client-side in the browser
- **Frontend:** GitHub Pages static site
- **Admin:** Password-protected via POST body (no headers needed)

### How it works:
- Players submit answers → scored by Gemini AI in their browser → results saved to Google Sheet
- Admin advances questions → updates Sheet state → all players see new question on next poll
- Scoreboard pulls from Sheet every 5 seconds
