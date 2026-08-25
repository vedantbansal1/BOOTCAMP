# PulseBoard Sales Dashboard API

## Endpoint contract

### Get Sales Dashboard
`GET /api/sales-dashboard?date=YYYY-MM-DD`

Example:

`/api/sales-dashboard?date=2026-05-25`

### Response
The response contains:

- `date`
- `summary.orders`
- `summary.revenue`
- `summary.discounts`
- `summary.average_order_value`
- `orders`
- `products`
- `customers`
- `destinations`

### GitHub-only exact-date JSON
Because GitHub Pages is static and cannot run Flask/Python, the exact requested response is also committed as:

`api/sales-dashboard-2026-05-25.json`

After uploading this repository, its public raw JSON URL will be:

`https://raw.githubusercontent.com/vedantbansal1/BOOTCAMP/main/VEDANT%20DASHBOARD%20FINAL/sales-analytics-dashboard/api/sales-dashboard-2026-05-25.json`

This is suitable as public API documentation / JSON response evidence for the assignment. For a live parameterized API, deploy `api/index.py` to a Python-capable host.
