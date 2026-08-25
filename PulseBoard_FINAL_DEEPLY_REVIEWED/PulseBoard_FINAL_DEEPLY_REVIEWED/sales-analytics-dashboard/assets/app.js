
const DATA = window.PULSEBOARD_DATA || {users:[],products:[],destinations:[],orders:[]};
const state = {
  users: DATA.users || [], products: DATA.products || [], destinations: DATA.destinations || [],
  orders: DATA.orders || [], filtered: [], chartMode: "revenue", trendChart: null, modeChart: null,
  filters: {search:"",preset:"all",from:"",to:"",product:"all",customer:"all"}
};

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(n)||0);
const num = n => new Intl.NumberFormat("en-IN").format(Number(n)||0);
const shortMoney = n => { n=Number(n)||0; if(n>=1e7)return "₹"+(n/1e7).toFixed(1)+"Cr"; if(n>=1e5)return "₹"+(n/1e5).toFixed(1)+"L"; if(n>=1e3)return "₹"+(n/1e3).toFixed(1)+"K"; return money(n); };
const esc = s => String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const dateOnly = s => String(s||"").slice(0,10);
const dateObj = s => new Date(String(s||"").replace(" ","T"));
const fmtDate = s => { const d=dateObj(s); return isNaN(d) ? String(s||"") : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); };
const modeName = p => Number(p.simMode)===2 ? "eSIM" : Number(p.simMode)===1 ? "Plastic SIM" : "Other";

function joinedOrders(){
  const u=new Map(state.users.map(x=>[String(x.user_id),x]));
  const p=new Map(state.products.map(x=>[String(x.prod_id),x]));
  return state.orders.map(o=>({...o,amount:Number(o.amount)||0,discount_amount:Number(o.discount_amount)||0,user:u.get(String(o.user_id))||{},product:p.get(String(o.product_id))||{}}));
}
function populateFilters(){
  $("productFilter").innerHTML='<option value="all">All products</option>'+[...state.products].sort((a,b)=>(a.productName||"").localeCompare(b.productName||"")).map(p=>`<option value="${esc(p.prod_id)}">${esc(p.productName||"Product "+p.prod_id)}</option>`).join("");
  $("customerFilter").innerHTML='<option value="all">All customers</option>'+[...state.users].sort((a,b)=>(a.name||"").localeCompare(b.name||"")).map(u=>`<option value="${esc(u.user_id)}">${esc((u.name||"Unknown").trim())}</option>`).join("");
}
function applyFilters(){
  const f=state.filters, all=joinedOrders();
  let d=all;
  if(f.preset!=="all"){
    const days=Number(f.preset), max=Math.max(...all.map(x=>dateObj(x.order_date_time).getTime()));
    if(Number.isFinite(max)) d=d.filter(x=>dateObj(x.order_date_time).getTime()>=max-days*86400000);
  }
  if(f.from) d=d.filter(x=>dateOnly(x.order_date_time)>=f.from);
  if(f.to) d=d.filter(x=>dateOnly(x.order_date_time)<=f.to);
  if(f.product!=="all") d=d.filter(x=>String(x.product_id)===String(f.product));
  if(f.customer!=="all") d=d.filter(x=>String(x.user_id)===String(f.customer));
  if(f.search){
    const q=f.search.toLowerCase();
    d=d.filter(x=>[x.order_no,x.user_id,x.user?.name,x.product?.productName,x.user?.country_code,x.product?.coverageDestinations,x.created_by].some(v=>String(v??"").toLowerCase().includes(q)));
  }
  state.filtered=d;
  render();
}
function render(){
  const d=state.filtered, revenue=d.reduce((s,x)=>s+x.amount,0), discount=d.reduce((s,x)=>s+x.discount_amount,0);
  $("revenueKpi").textContent=money(revenue); $("ordersKpi").textContent=num(d.length);
  $("aovKpi").textContent=money(d.length?revenue/d.length:0); $("discountKpi").textContent=money(discount);
  $("customersKpi").textContent=num(new Set(d.map(x=>x.user_id)).size);
  $("filterNotice").querySelector("#noticeText").textContent=`Showing ${num(d.length)} of ${num(state.orders.length)} orders. Every card, chart and table updates from this selection.`;
  $("noticeTag").textContent=d.length?"LIVE":"EMPTY";
  $("footerStats").textContent=`${num(d.length)} visible orders • ${num(new Set(d.map(x=>x.user_id)).size)} customers`;
  renderTrend(d); renderMode(d); renderTopProducts(d); renderDestinations(d); renderCustomers(d); renderProductTable(d); renderCustomerTable(d); renderOrderTable(d);
}
function renderTrend(d){
  const by=new Map(); d.forEach(x=>{const k=dateOnly(x.order_date_time); if(!by.has(k))by.set(k,{revenue:0,orders:0}); by.get(k).revenue+=x.amount; by.get(k).orders++});
  const labels=[...by.keys()].sort(), rev=labels.map(k=>by.get(k).revenue), ord=labels.map(k=>by.get(k).orders);
  const empty=$("trendEmpty"); empty.style.display=labels.length?"none":"grid";
  if(!window.Chart || !labels.length){ if(state.trendChart){state.trendChart.destroy();state.trendChart=null} return; }
  if(state.trendChart)state.trendChart.destroy();
  const datasets=[];
  if(state.chartMode==="revenue"||state.chartMode==="combined") datasets.push({label:"Revenue",data:rev,borderColor:"#5eead4",backgroundColor:"rgba(94,234,212,.09)",fill:true,tension:.35,pointRadius:0,borderWidth:2.5,yAxisID:"y"});
  if(state.chartMode==="orders"||state.chartMode==="combined") datasets.push({label:"Orders",data:ord,borderColor:"#60a5fa",backgroundColor:"transparent",tension:.35,pointRadius:0,borderWidth:2,yAxisID:state.chartMode==="combined"?"y1":"y"});
  state.trendChart=new Chart($("trendChart"),{type:"line",data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:"#0b1119",padding:10}},scales:{x:{grid:{display:false},ticks:{color:"#7f8b9d",font:{size:8},maxTicksLimit:8,callback:(v)=>fmtDate(labels[v]).replace(/, 2026/,"")}},y:{grid:{color:"rgba(255,255,255,.06)"},ticks:{color:"#7f8b9d",font:{size:8},callback:v=>state.chartMode==="orders"?num(v):shortMoney(v)}},y1:{display:state.chartMode==="combined",position:"right",grid:{drawOnChartArea:false},ticks:{color:"#7f8b9d",font:{size:8}}}}}});
}
function renderMode(d){
  const totals={eSIM:0,"Plastic SIM":0,Other:0};
  d.forEach(x=>{totals[modeName(x.product)]=(totals[modeName(x.product)]||0)+x.amount});
  const items=Object.entries(totals).filter(([,v])=>v>0), total=items.reduce((s,[,v])=>s+v,0);
  $("modeTotal").textContent=shortMoney(total);
  $("modeLegend").innerHTML=items.map(([name,v],i)=>`<div class="legend-item"><span class="legend-dot" style="background:${["#5eead4","#60a5fa","#fbbf24"][i%3]}"></span>${esc(name)}<strong>${total?(v/total*100).toFixed(1):0}%</strong></div>`).join("");
  if(!window.Chart || !items.length){if(state.modeChart){state.modeChart.destroy();state.modeChart=null}return;}
  if(state.modeChart)state.modeChart.destroy();
  state.modeChart=new Chart($("modeChart"),{type:"doughnut",data:{labels:items.map(x=>x[0]),datasets:[{data:items.map(x=>x[1]),backgroundColor:["#5eead4","#60a5fa","#fbbf24"],borderColor:"#0d121b",borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:"72%",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${money(c.raw)}`}}}}});
}
function renderTopProducts(d){
  const by=new Map(); d.forEach(x=>{const k=String(x.product_id); if(!by.has(k))by.set(k,{p:x.product,revenue:0,orders:0});by.get(k).revenue+=x.amount;by.get(k).orders++});
  const rows=[...by.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,6), max=rows[0]?.revenue||1;
  $("topProducts").innerHTML=rows.length?rows.map((r,i)=>`<div class="rank-row"><div class="rank-icon">${i+1}</div><div><div class="rank-name">${esc(r.p.productName||"Product")}</div><div class="rank-sub">${num(r.orders)} orders</div><div class="progress"><i style="width:${r.revenue/max*100}%"></i></div></div><div class="rank-value">${shortMoney(r.revenue)}</div></div>`).join(""):'<div class="rank-sub">No product data.</div>';
}
function renderDestinations(d){
  const destMap=new Map(state.destinations.map(x=>[String(x.destination_id),x])), by=new Map();
  d.forEach(x=>{const codes=String(x.product?.coverageDestinations||"").split(",").filter(Boolean); const code=codes[0]||"Other"; if(!by.has(code))by.set(code,{revenue:0,orders:0});by.get(code).revenue+=x.amount;by.get(code).orders++});
  const rows=[...by.entries()].map(([code,v])=>({code,...v})).sort((a,b)=>b.revenue-a.revenue).slice(0,6),max=rows[0]?.revenue||1;
  $("destinationsList").innerHTML=rows.length?rows.map(r=>{const dest=destMap.get(r.code);return `<div class="rank-row"><div class="flag-box">${dest?.flag_path?`<img src="${esc(dest.flag_path)}" alt="" onerror="this.style.display='none'">`:"⌖"}</div><div><div class="rank-name">${esc(dest?.destination_name||r.code)}</div><div class="rank-sub">${num(r.orders)} orders</div><div class="progress"><i style="width:${r.revenue/max*100}%"></i></div></div><div class="rank-value">${shortMoney(r.revenue)}</div></div>`}).join(""):'<div class="rank-sub">No destination data.</div>';
}
function renderCustomers(d){
  const by=new Map(); d.forEach(x=>{const k=String(x.user_id);if(!by.has(k))by.set(k,{u:x.user,revenue:0,orders:0});by.get(k).revenue+=x.amount;by.get(k).orders++});
  const rows=[...by.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,6);
  $("topCustomers").innerHTML=rows.length?rows.map(r=>`<div class="rank-row"><div class="avatar">${esc((r.u.name||"?").trim().charAt(0).toUpperCase())}</div><div><div class="rank-name">${esc((r.u.name||"Unknown").trim())}</div><div class="rank-sub">${num(r.orders)} orders • +${esc(r.u.country_code||"")}</div></div><div class="rank-value">${shortMoney(r.revenue)}</div></div>`).join(""):'<div class="rank-sub">No customer data.</div>';
}
function renderProductTable(d){
  const by=new Map(); d.forEach(x=>{const k=String(x.product_id);if(!by.has(k))by.set(k,{p:x.product,revenue:0,orders:0});by.get(k).revenue+=x.amount;by.get(k).orders++});
  const rows=[...by.values()].sort((a,b)=>b.revenue-a.revenue), total=d.reduce((s,x)=>s+x.amount,0);
  $("productSummary").textContent=`${num(rows.length)} active products`;
  $("productsTable").innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.p.productName||"Product")}</strong><br><span class="rank-sub">${esc(r.p.addOnId||"")}</span></td><td><span class="pill">${esc(modeName(r.p))}</span></td><td>${esc(r.p.validity||"—")} days</td><td>${esc(r.p.coverageDestinations||"—")}</td><td>${num(r.orders)}</td><td><strong>${money(r.revenue)}</strong></td><td>${total?(r.revenue/total*100).toFixed(1):0}%</td></tr>`).join("")||'<tr><td colspan="7">No matching products.</td></tr>';
}
function renderCustomerTable(d){
  const by=new Map(); d.forEach(x=>{const k=String(x.user_id);if(!by.has(k))by.set(k,{u:x.user,revenue:0,orders:0,first:x.order_date_time});by.get(k).revenue+=x.amount;by.get(k).orders++;if(dateOnly(x.order_date_time)<dateOnly(by.get(k).first))by.get(k).first=x.order_date_time});
  const rows=[...by.values()].sort((a,b)=>b.revenue-a.revenue);
  $("customerSummary").textContent=`${num(rows.length)} active customers`;
  $("customersTable").innerHTML=rows.map(r=>`<tr><td><strong>${esc((r.u.name||"Unknown").trim())}</strong></td><td>${esc(r.u.user_id)}</td><td>+${esc(r.u.country_code||"—")}</td><td>${num(r.orders)}</td><td><strong>${money(r.revenue)}</strong></td><td>${money(r.revenue/r.orders)}</td><td>${fmtDate(r.first)}</td></tr>`).join("")||'<tr><td colspan="7">No matching customers.</td></tr>';
}
function renderOrderTable(d){
  const rows=[...d].sort((a,b)=>dateObj(b.order_date_time)-dateObj(a.order_date_time));
  $("ledgerSummary").textContent=`${num(rows.length)} orders`;
  $("ordersTable").innerHTML=rows.slice(0,500).map(x=>`<tr><td><strong>#${esc(x.order_no)}</strong></td><td>${fmtDate(x.order_date_time)}</td><td>${esc((x.user?.name||"Unknown").trim())}</td><td>${esc(x.product?.productName||"Product "+x.product_id)}</td><td><strong>${money(x.amount)}</strong></td><td>${money(x.discount_amount)}</td><td>${esc(x.created_by||"—")}</td></tr>`).join("")||'<tr><td colspan="7">No matching orders.</td></tr>';
}
function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2200)}
function setView(name){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name+"View"));
  const meta={overview:["Overview","Monitor revenue, order velocity and customer demand."],products:["Products","Understand which catalog items are driving sales."],customers:["Customers","Review buyer value and repeat purchase activity."],orders:["Orders","Inspect transaction-level details and export filtered data."]}[name];
  $("pageTitle").textContent=meta[0];$("pageSubtitle").textContent=meta[1];
  $("sidebar").classList.remove("open");$("mobileOverlay").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
}
function resetFilters(){
  state.filters={search:"",preset:"all",from:"",to:"",product:"all",customer:"all"};
  $("searchInput").value="";$("preset").value="all";$("fromDate").value="";$("toDate").value="";$("productFilter").value="all";$("customerFilter").value="all";applyFilters();showToast("Filters reset");
}
function exportCSV(){
  const rows=state.filtered.map(x=>({order_no:x.order_no,order_date_time:x.order_date_time,user_id:x.user_id,customer:(x.user?.name||"").trim(),product_id:x.product_id,product_name:x.product?.productName||"",amount:x.amount,discount_amount:x.discount_amount,created_by:x.created_by}));
  const cols=Object.keys(rows[0]||{order_no:"",order_date_time:"",user_id:"",customer:"",product_id:"",product_name:"",amount:"",discount_amount:"",created_by:""});
  const csv=[cols.join(","),...rows.map(r=>cols.map(c=>`"${String(r[c]??"").replaceAll('"','""')}"`).join(","))].join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="pulseboard_filtered_sales.csv";a.click();showToast("Filtered CSV exported");
}
function bind(){
  $("searchInput").oninput=e=>{state.filters.search=e.target.value.trim();applyFilters()};
  $("preset").onchange=e=>{state.filters.preset=e.target.value; if(e.target.value!=="all"){state.filters.from="";state.filters.to="";$("fromDate").value="";$("toDate").value=""}applyFilters()};
  $("fromDate").onchange=e=>{state.filters.from=e.target.value;state.filters.preset="all";$("preset").value="all";applyFilters()};
  $("toDate").onchange=e=>{state.filters.to=e.target.value;state.filters.preset="all";$("preset").value="all";applyFilters()};
  $("productFilter").onchange=e=>{state.filters.product=e.target.value;applyFilters()};
  $("customerFilter").onchange=e=>{state.filters.customer=e.target.value;applyFilters()};
  $("resetBtn").onclick=resetFilters;
  $("exportBtn").onclick=exportCSV;
  $("refreshBtn").onclick=()=>{populateFilters();applyFilters();showToast("Dashboard refreshed")};
  $("themeBtn").onclick=()=>{document.body.classList.toggle("light");showToast("Theme toggled")};
  $("menuBtn").onclick=()=>{$("sidebar").classList.add("open");$("mobileOverlay").classList.add("open")};
  $("mobileOverlay").onclick=()=>{$("sidebar").classList.remove("open");$("mobileOverlay").classList.remove("open")};
  document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>setView(b.dataset.view));
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>setView(b.dataset.go));
  document.querySelectorAll(".chart-toggle").forEach(b=>b.onclick=()=>{state.chartMode=b.dataset.mode;document.querySelectorAll(".chart-toggle").forEach(x=>x.classList.toggle("active",x===b));renderTrend(state.filtered)});
  document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("searchInput").focus()}});
}
function init(){
  populateFilters(); bind();
  $("dataStatus").textContent="Dataset ready"; $("dataMeta").textContent=`${num(state.orders.length)} orders • ${num(state.users.length)} users`;
  $("syncText").textContent="● DATA READY"; applyFilters();
}
init();
