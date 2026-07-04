# PricePulse 🛒

**AU Grocery Price Tracker** — Compare prices across Woolworths, Coles & Amazon AU with 6-month history and sale cycle predictions.

---

## ✨ Features

- **Price comparison** — Woolworths, Coles, Amazon AU side-by-side
- **6-month price history charts** — see exactly when prices drop
- **Sale cycle prediction** — algorithm predicts when items will go on sale next
- **19 tracked items** — soft drinks, confectionery, chocolate, chips, ice cream
- **Filter & sort** — by category, discount, upcoming sale, price
- **100% free** — Vercel + Supabase + GitHub Actions (all free tiers)

---

## 🚀 Quick Start (View Locally)

The app works **immediately in your browser** with mock data — no setup needed:

1. Open `C:\Users\Ray\.gemini\antigravity\scratch\grocery-tracker\index.html` in Chrome/Edge/Firefox
2. That's it — mock data is pre-loaded for all 19 products

> **Note**: Browsers block cross-origin requests for some features when using `file://` URLs.
> For the full experience, serve it locally using VS Code's [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

---

## 📦 Project Structure

```
grocery-tracker/
├── index.html              ← Main app (open this in your browser)
├── css/style.css           ← Dark glassmorphism design
├── js/app.js               ← All data + app logic
├── scraper/
│   ├── main.py             ← Run this to scrape prices
│   ├── config.py           ← Product list + settings
│   ├── db.py               ← Supabase writer
│   ├── scrapers/
│   │   ├── woolworths.py
│   │   ├── coles.py
│   │   └── amazon_au.py
│   └── requirements.txt
├── supabase/
│   └── schema.sql          ← Run this once in Supabase
└── .github/workflows/
    └── weekly-scrape.yml   ← Runs every Monday automatically
```

---

## 🗄️ Setting Up Supabase (One-Time)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (choose Australia as region)
3. Go to **SQL Editor** → **New Query**
4. Paste the contents of `supabase/schema.sql` and click **Run**
5. Go to **Project Settings** → **API** and copy:
   - `Project URL` → your `SUPABASE_URL`
   - `service_role` key → your `SUPABASE_SERVICE_KEY`

---

## 🌐 Deploying to Vercel (Free Hosting)

1. Push this project to a **GitHub repository** (can be private)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import from GitHub
3. Select the `grocery-tracker` repo
4. Click **Deploy** — no build settings needed (it's a static site)
5. Done! You'll get a URL like `https://pricepulse-xxx.vercel.app`

---

## 🤖 Setting Up the Weekly Scraper

### 1. Add GitHub Secrets
In your GitHub repo: **Settings → Secrets → Actions → New repository secret**

| Secret name | Value |
|-------------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |

### 2. The scraper runs automatically
Every Monday at 8am AEST, GitHub Actions will:
1. Run `scraper/main.py`
2. Fetch prices from Woolworths, Coles, Amazon AU
3. Write them to your Supabase database

### 3. Test it manually
In your GitHub repo: **Actions → Weekly Price Scraper → Run workflow**
Set **Mock mode** = `true` for a dry run (no real requests).

### 4. Run locally (optional)
```bash
cd scraper
pip install -r requirements.txt

# Create .env file
echo "SUPABASE_URL=https://xxx.supabase.co" > .env
echo "SUPABASE_SERVICE_KEY=your-key" >> .env

# Test with mock mode first
MOCK_MODE=true python main.py

# Run for real
python main.py
```

---

## 📊 Connecting the Frontend to Supabase

Once you have real data flowing, update `js/app.js` to read from Supabase instead of mock data.
Look for the `TODO: Supabase integration` comment at the top of the file.

Basic Supabase JS query to replace mock data:
```javascript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const { data } = await supabase.from('latest_prices').select('*')
```

---

## ➕ Adding New Products

1. Add the product to `TRACKED_ITEMS` in `scraper/config.py`
2. Add a row to `products` table in Supabase (or re-run `schema.sql`)
3. Add the product definition to `RAW_PRODUCTS` in `js/app.js` (for mock data)
4. Re-run the scraper to populate the first week's data

---

## 🔮 How Sale Prediction Works

The app tracks a **sale cycle** (e.g. "Coca-Cola goes on sale every 4 weeks").

1. Each week, we record the price and whether it's on sale
2. After several weeks, we identify the **start date of the most recent sale window**
3. We add `cycle_weeks × 7 days` to predict the **next sale date**
4. Confidence increases as more historical data accumulates

This is intentionally simple statistics — no ML needed. After ~3 months of data, predictions become very reliable for items with consistent cycles (mostly soft drinks and confectionery).

---

## 📅 Supermarket Catalogue Cycles

| Store | Catalogue runs | Sale duration |
|-------|---------------|---------------|
| Woolworths | Wednesday → Tuesday | 1–2 weeks |
| Coles | Wednesday → Tuesday | 1–2 weeks |
| Amazon AU | Rolling / Prime Day events | 1–7 days |

---

## 📝 Notes & Limitations

- **Personal use only** — scraping at low weekly rates for non-commercial personal tracking
- Woolworths and Coles may update their internal API structures — check scrapers if they break
- Amazon ASINs must be added manually to `config.py` (find them in product page URLs)
- Mock data is used in the frontend by default; Supabase integration is the next step

---

*Built with ❤️ using HTML/CSS/JS, Python, Supabase, Vercel and GitHub Actions.*
