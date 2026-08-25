
from flask import Flask, request, jsonify
from pathlib import Path
import pandas as pd

app = Flask(__name__)
BASE = Path(__file__).resolve().parent.parent / "data"
users = pd.read_csv(BASE/"users.csv")
products = pd.read_csv(BASE/"products.csv")
destinations = pd.read_csv(BASE/"destinations.csv")
orders = pd.read_csv(BASE/"orders.csv")
orders["order_date_time"] = pd.to_datetime(orders["order_date_time"], errors="coerce")
orders["amount"] = pd.to_numeric(orders["amount"], errors="coerce").fillna(0)
orders["discount_amount"] = pd.to_numeric(orders["discount_amount"], errors="coerce").fillna(0)

@app.after_request
def cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

def clean(v):
    if pd.isna(v): return None
    try: return v.item()
    except Exception: return v

def build(date=None):
    df=orders.copy()
    if date and date!="all":
        d=pd.to_datetime(date,errors="coerce")
        if pd.isna(d): return None, "Invalid date. Use YYYY-MM-DD."
        df=df[df.order_date_time.dt.date==d.date()]
    revenue=float(df.amount.sum()); discount=float(df.discount_amount.sum()); count=len(df)
    joined=df.merge(users,on="user_id",how="left").merge(products,left_on="product_id",right_on="prod_id",how="left")
    order_rows=[]
    for _,r in joined.iterrows():
        order_rows.append({
            "order_no":clean(r.order_no),"date":r.order_date_time.strftime("%Y-%m-%d") if pd.notna(r.order_date_time) else None,
            "user_id":clean(r.user_id),"customer":clean(r["name"]),"product_id":clean(r.product_id),
            "product":clean(r.productName),"amount":round(float(r.amount),2),"discount":round(float(r.discount_amount),2),
            "created_by":clean(r.created_by)
        })
    product_rows=[]
    if count:
        g=df.groupby("product_id",as_index=False).agg(orders=("order_no","count"),revenue=("amount","sum")).merge(products[["prod_id","productName","simMode"]],left_on="product_id",right_on="prod_id",how="left")
        for _,r in g.sort_values("revenue",ascending=False).iterrows():
            product_rows.append({"product_id":clean(r.product_id),"product":clean(r.productName),"mode":clean(r.simMode),"orders":int(r.orders),"revenue":round(float(r.revenue),2),"share":round(float(r.revenue/revenue*100),2) if revenue else 0})
    customer_rows=[]
    if count:
        g=df.groupby("user_id",as_index=False).agg(orders=("order_no","count"),revenue=("amount","sum"),first_order=("order_date_time","min")).merge(users[["user_id","name","country_code"]],on="user_id",how="left")
        for _,r in g.sort_values("revenue",ascending=False).iterrows():
            customer_rows.append({"user_id":clean(r.user_id),"customer":clean(r["name"]),"country_code":clean(r.country_code),"orders":int(r.orders),"revenue":round(float(r.revenue),2),"avg_order":round(float(r.revenue/r.orders),2),"first_order":r.first_order.strftime("%Y-%m-%d") if pd.notna(r.first_order) else None})
    return {
        "date":date or "all",
        "summary":{"orders":int(count),"revenue":round(revenue,2),"discounts":round(discount,2),"average_order_value":round(revenue/count,2) if count else 0},
        "orders":order_rows,"products":product_rows,"customers":customer_rows,
        "destinations":destinations.to_dict("records")
    }, None

@app.get("/")
def home():
    return jsonify({"service":"PulseBoard Sales Dashboard API","status":"online","endpoint":"/api/sales-dashboard?date=YYYY-MM-DD"})

@app.get("/api/sales-dashboard")
def dashboard():
    payload,error=build(request.args.get("date","all"))
    if error:return jsonify({"error":error}),400
    return jsonify(payload)
