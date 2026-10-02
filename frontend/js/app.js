import {auth,firebaseReady,onAuthStateChanged,signOut} from "./firebase.js";
const authLinks=document.querySelectorAll("#navAuth");
const profileName=document.querySelector("#profileName");
const profileEmail=document.querySelector("#profileEmail");
const logoutBtn=document.querySelector("#logoutBtn");

if(firebaseReady){
  onAuthStateChanged(auth,user=>{
    authLinks.forEach(link=>{link.textContent=user?"Profile":"Login";link.href=user?"profile.html":"login.html";});
    if(profileName) profileName.textContent=user?.displayName||"Guest";
    if(profileEmail) profileEmail.textContent=user?.email||"Not logged in.";
  });
}
if(logoutBtn) logoutBtn.addEventListener("click",async()=>{
  try{if(!firebaseReady) throw new Error("Firebase is not configured.");await signOut(auth);location.href="index.html";}
  catch(e){document.querySelector("#profileMessage").textContent=e.message;}
});
