const STATUS = [
  "ลูกค้ากดสั่ง",
  "ส่งชุดพิมพ์ให้ลูกค้า",
  "รอพิมพ์ฟันส่งกลับ",
  "ได้รับแบบพิมพ์แล้ว",
  "พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่",
  "เทปูนขึ้นรูป",
  "ขึ้นรูปรีเทนเนอร์",
  "พร้อมส่งคืนลูกค้า",
  "ส่งคืนลูกค้าแล้ว",
  "ปิดงาน"
];

const $ = (id) => document.getElementById(id);
let cases = [];
let settings = { apiUrl: "" };

function money(n){
  return "฿" + (Number(n || 0)).toLocaleString("th-TH");
}

function nowISO(){
  return new Date().toISOString();
}

function monthCode(){
  const d = new Date();
  return String(d.getFullYear()).slice(-2) + String(d.getMonth()+1).padStart(2,"0");
}

function nextHN(){
  const prefix = "HN-" + monthCode() + "-";
  const count = cases.filter(c => String(c.id).startsWith(prefix)).length + 1;
  return prefix + String(count).padStart(4,"0");
}

function saveLocal(){
  localStorage.setItem("cc_lite_cases", JSON.stringify(cases));
  localStorage.setItem("cc_lite_settings", JSON.stringify(settings));
}

function loadLocal(){
  cases = JSON.parse(localStorage.getItem("cc_lite_cases") || "[]");
  settings = JSON.parse(localStorage.getItem("cc_lite_settings") || '{"apiUrl":""}');
  $("apiUrl").value = settings.apiUrl || "";
}

async function syncToSheet(action, payload){
  if(!settings.apiUrl) return;
  try{
    await fetch(settings.apiUrl, {
      method:"POST",
      mode:"no-cors",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ action, payload })
    });
  }catch(err){
    console.warn("Sync failed, saved locally instead", err);
  }
}

function setupOptions(){
  $("status").innerHTML = STATUS.map(s => `<option>${s}</option>`).join("");
  $("statusFilter").innerHTML = `<option value="">ทุกสถานะ</option>` + STATUS.map(s => `<option>${s}</option>`).join("");
}

function calcStats(){
  const all = cases.length;
  const waiting = cases.filter(c => c.status === "รอพิมพ์ฟันส่งกลับ").length;
  const failed = cases.filter(c => c.status === "พิมพ์ไม่ผ่าน ต้องส่งชุดใหม่").length;
  const working = cases.filter(c => ["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์"].includes(c.status)).length;
  const done = cases.filter(c => ["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว","ปิดงาน"].includes(c.status)).length;
  $("statAll").textContent = all;
  $("statWaiting").textContent = waiting;
  $("statFailed").textContent = failed;
  $("statWorking").textContent = working;
  $("statDone").textContent = done;
}

function badgeClass(status){
  if(status.includes("ไม่ผ่าน")) return "fail";
  if(status.includes("รอพิมพ์")) return "wait";
  if(["ได้รับแบบพิมพ์แล้ว","เทปูนขึ้นรูป","ขึ้นรูปรีเทนเนอร์"].includes(status)) return "work";
  if(["พร้อมส่งคืนลูกค้า","ส่งคืนลูกค้าแล้ว","ปิดงาน"].includes(status)) return "done";
  return "";
}

function render(){
  calcStats();
  const q = $("searchInput").value.trim().toLowerCase();
  const sf = $("statusFilter").value;
  let filtered = cases.slice().sort((a,b)=> new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  if(q){
    filtered = filtered.filter(c =>
      [c.id,c.customerName,c.phone,c.productType].join(" ").toLowerCase().includes(q)
    );
  }
  if(sf) filtered = filtered.filter(c => c.status === sf);

  const list = $("caseList");
  if(!filtered.length){
    list.innerHTML = `<div class="empty">ยังไม่มีเคส หรือไม่เจอข้อมูลที่ค้นหา<br><br><button class="primary" onclick="openCaseModal()">+ เพิ่มเคสแรก</button></div>`;
    return;
  }

  list.innerHTML = filtered.map(c => {
    const profit = Number(c.revenue || 0) - Number(c.cost || 0);
    return `
      <article class="case-row" onclick="openCaseModal('${c.id}')">
        <div class="case-name">
          <strong>${c.customerName || "-"}</strong>
          <span>${c.id} • ${c.phone || "ไม่มีเบอร์"}</span>
        </div>
        <div>
          <small>สินค้า</small>
          <b>${c.productType || "Clear Retainer"}</b>
        </div>
        <div>
          <small>กำไร</small>
          <b>${money(profit)}</b>
        </div>
        <div>
          <small>อัปเดตล่าสุด</small>
          <b>${new Date(c.updatedAt || c.createdAt).toLocaleDateString("th-TH")}</b>
        </div>
        <div><span class="badge ${badgeClass(c.status)}">${c.status}</span></div>
      </article>
    `;
  }).join("");
}

function openCaseModal(id){
  const modal = $("caseModal");
  const editing = cases.find(c => c.id === id);
  $("modalTitle").textContent = editing ? "แก้ไขเคส" : "เพิ่มเคสใหม่";
  $("deleteBtn").style.display = editing ? "inline-flex" : "none";

  $("caseId").value = editing?.id || "";
  $("customerName").value = editing?.customerName || "";
  $("phone").value = editing?.phone || "";
  $("address").value = editing?.address || "";
  $("productType").value = editing?.productType || "Clear Retainer - บน+ล่าง";
  $("status").value = editing?.status || "ลูกค้ากดสั่ง";
  $("revenue").value = editing?.revenue || "";
  $("cost").value = editing?.cost || "";
  $("photoUrl").value = editing?.photoUrl || "";
  $("note").value = editing?.note || "";
  updateProfitPreview();
  modal.showModal();
}

function closeCaseModal(){
  $("caseModal").close();
}

function readForm(){
  const id = $("caseId").value || nextHN();
  const old = cases.find(c => c.id === id);
  return {
    id,
    customerName: $("customerName").value.trim(),
    phone: $("phone").value.trim(),
    address: $("address").value.trim(),
    productType: $("productType").value,
    status: $("status").value,
    revenue: Number($("revenue").value || 0),
    cost: Number($("cost").value || 0),
    photoUrl: $("photoUrl").value.trim(),
    note: $("note").value.trim(),
    createdAt: old?.createdAt || nowISO(),
    updatedAt: nowISO()
  };
}

async function saveCase(){
  const item = readForm();
  const idx = cases.findIndex(c => c.id === item.id);
  if(idx >= 0) cases[idx] = item;
  else cases.push(item);

  saveLocal();
  render();
  closeCaseModal();
  await syncToSheet("saveCase", item);
}

async function deleteCase(){
  const id = $("caseId").value;
  if(!id) return;
  if(!confirm("ลบเคสนี้ใช่ไหม?")) return;
  cases = cases.filter(c => c.id !== id);
  saveLocal();
  render();
  closeCaseModal();
  await syncToSheet("deleteCase", { id });
}

function updateProfitPreview(){
  const profit = Number($("revenue").value || 0) - Number($("cost").value || 0);
  $("profitPreview").textContent = money(profit);
}

function openSettings(){
  $("apiUrl").value = settings.apiUrl || "";
  $("settingsModal").showModal();
}
function closeSettings(){
  $("settingsModal").close();
}
function saveSettings(){
  settings.apiUrl = $("apiUrl").value.trim();
  saveLocal();
  closeSettings();
  alert("บันทึกการตั้งค่าแล้ว");
}

["revenue","cost"].forEach(id => {
  document.addEventListener("input", (e) => {
    if(e.target && e.target.id === id) updateProfitPreview();
  });
});

setupOptions();
loadLocal();
render();
