const glow=document.querySelector(".mouse-glow");window.addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("show");io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(e=>io.observe(e));document.getElementById("year").textContent=new Date().getFullYear();
document.querySelectorAll(".nav nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav nav a.active")?.classList.remove("active")));
