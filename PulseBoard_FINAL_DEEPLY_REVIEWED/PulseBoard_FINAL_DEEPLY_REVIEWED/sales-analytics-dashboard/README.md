# PulseBoard — Final Sales Dashboard

## What was fixed / implemented
- Fully responsive desktop, tablet and mobile layout.
- Professional dark/glass executive dashboard.
- Dynamic search, period presets, custom From/To dates, product and customer filters.
- All KPIs, charts, rankings and tables recalculate from the active selection.
- Revenue + order trend chart.
- eSIM / Plastic SIM / Other revenue mix chart.
- Product, destination and customer rankings.
- Orders / Products / Customers data views.
- Filtered CSV export.
- Mobile navigation drawer and touch-friendly controls.
- Data is embedded in `assets/data.js`, so GitHub Pages and direct `index.html` work without CORS.
- Separate Flask API is included under `api/` for the Postman requirement.

## Actual supplied dataset
- Users: 2,587
- Products: 402
- Destinations: 266
- Orders: 894
- Order date range: 2026-01-01 to 2026-03-14
- Revenue: ₹629,410.57
- Discounts: ₹9,584.73
- AOV: ₹704.04

## GitHub Pages
Upload the CONTENTS of `sales-analytics-dashboard` to your GitHub repository.
Then enable Settings → Pages → Deploy from branch → main → /(root).

GitHub Pages can host the dashboard because it is static. The Flask API cannot execute on GitHub Pages; use the included API on a Python-capable host if a live Postman URL is required.

## Assignment JSON for 2026-05-25
The supplied orders end on 2026-03-14, so 2026-05-25 has no matching orders. The exact JSON is in:
`postman/response_2026-05-25.json`

Do not invent sales values for that date.
