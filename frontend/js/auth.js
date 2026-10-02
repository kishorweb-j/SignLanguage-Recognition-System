import {registerUser,loginUser} from "./firebase.js";
const signupForm=document.querySelector("#signupForm"),loginForm=document.querySelector("#loginForm"),message=document.querySelector("#authMessage");
const show=t=>{if(message)message.textContent=t;};

if(signupForm) signupForm.addEventListener("submit",async e=>{
  e.preventDefault();show("Creating account...");
  try{await registerUser(document.querySelector("#name").value.trim(),document.querySelector("#email").value.trim(),document.querySelector("#password").value);show("Account created.");setTimeout(()=>location.href="recognition.html",700);}
  catch(err){show(err.message);}
});
if(loginForm) loginForm.addEventListener("submit",async e=>{
  e.preventDefault();show("Signing in...");
  try{await loginUser(document.querySelector("#email").value.trim(),document.querySelector("#password").value);show("Login successful.");setTimeout(()=>location.href="recognition.html",500);}
  catch(err){show(err.message);}
});
