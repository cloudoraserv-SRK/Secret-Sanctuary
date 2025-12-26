import { supabase } from "./supabaseClient.js";

loginBtn.onclick = async () => {
  error.innerText = "";

  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (err) {
    error.innerText = err.message;
  } else {
    location.href = "admin.html";
  }
};
