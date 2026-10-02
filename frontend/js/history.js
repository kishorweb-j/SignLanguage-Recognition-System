import {firebaseReady,auth,onAuthStateChanged,getHistory} from "./firebase.js";
const list=document.querySelector("#historyList");
function render(items){
  if(!items.length){list.innerHTML='<p class="muted">No saved recognition records yet.</p>';return;}
  list.innerHTML=items.map(x=>`<div class="history-row"><strong>${x.label}</strong><span>${x.confidence??0}%</span><small>${x.createdAt?.toDate?x.createdAt.toDate().toLocaleString():"Just now"}</small></div>`).join("");
}
if(!firebaseReady) list.innerHTML='<p class="muted">Configure Firebase first to use recognition history.</p>';
else onAuthStateChanged(auth,async user=>{
  if(!user){list.innerHTML='<p class="muted">Please login to view your history.</p>';return;}
  try{render(await getHistory());}catch(e){list.innerHTML=`<p class="muted">${e.message}</p>`;}
});
