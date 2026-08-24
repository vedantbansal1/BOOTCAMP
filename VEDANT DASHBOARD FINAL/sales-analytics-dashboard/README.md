# PulseBoard — Animated Sales Intelligence Dashboard

A premium dark, animated, responsive sales dashboard built around the supplied `orders_export.csv` dataset.

## Dataset
The dashboard uses `assets/data.js`, an embedded copy of the uploaded CSV, so it works even when `index.html` is opened directly with `file://`.

It also keeps the source CSV at `data/orders_export.csv` for deployment/reference.

## Run
### Direct
Double-click `index.html`.

### Local server
`python -m http.server 8000`
then open `http://localhost:8000`.

## Vercel
Deploy the whole folder. No build command is required. Output directory: `.`

## Highlights
- Animated dark/glassmorphism interface
- Animated KPI counters and micro charts
- Animated performance pulse hero
- SVG revenue trajectory with hover tooltips
- Animated eSIM vs Plastic/Other composition donut
- Product, customer and destination rankings
- Search + period + product + customer filters
- Orders, products and customers data views
- Filtered CSV export
- Responsive desktop/tablet/mobile layout
- No backend required
