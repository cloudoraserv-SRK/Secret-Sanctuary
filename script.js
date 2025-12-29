import { supabase } from "./admin/supabaseClient.js";

/* =========================
   GLOBAL GSAP HELPER
========================= */
let fadeUp;

/* =========================
   DOM READY
========================= */
document.addEventListener("DOMContentLoaded", async () => {

  /* =========================
     GSAP SETUP (SAFE)
  ========================= */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-title", { opacity: 0, y: 30, duration: 1.6 });
    gsap.from(".hero-subtitle", { opacity: 0, y: 20, delay: 0.2 });
    gsap.from(".hero-description", { opacity: 0, y: 20, delay: 0.4 });
    gsap.from(".hero-cta", { opacity: 0, y: 10, delay: 0.6 });

    fadeUp = (targets, trigger) => {
      if (!document.querySelector(targets)) return;

      gsap.from(targets, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.2,
        scrollTrigger: {
          trigger,
          start: "top 80%"
        }
      });
    };

    fadeUp(".knowledge-text, .knowledge-visual", "#knowledge");
  }
/* =========================
   Hamburger
========================= */
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');
  nav.classList.toggle('active');
  toggle.setAttribute(
    'aria-expanded',
    toggle.classList.contains('active')
  );
});
/* =========================
   Ribbon-Floating
========================= */
const ribbon = document.querySelector('.floating-ribbon');
const closeBtn = document.querySelector('.ribbon-close');

if (localStorage.getItem('ribbonClosed')) {
  ribbon.style.display = 'none';
}

closeBtn.addEventListener('click', () => {
  ribbon.style.display = 'none';
  localStorage.setItem('ribbonClosed', 'true');
});
  /* =========================
     LOAD PRODUCTS THEN ANIMATE
  ========================= */
  await loadFeaturedProducts();

  if (fadeUp) {
    fadeUp(".product-card", "#featured");
  }

  updateCartCount();
});

/* =========================
   FETCH FEATURED PRODUCTS
========================= */
async function loadFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, image, price, energy")
    .eq("active", true)
    .limit(5);

  if (error) {
    console.error("❌ Featured load failed", error);
    return;
  }

  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  grid.innerHTML = "";

  data.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    // 🔥 IMAGE PATH FIX (GitHub Pages safe)
    const imagePath = product.image?.startsWith("/")
      ? `.${product.image}`
      : product.image;

    card.innerHTML = `
      <img src="${imagePath}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.energy || "Balance, shanti aur well-being ke liye sacred plant"}</p>
      <button class="add-btn"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        data-image="${imagePath}">
        Add to Sanctuary
      </button>
    `;

    // 🔗 Product page navigation (GitHub Pages safe)
    card.addEventListener("click", e => {
      if (!e.target.classList.contains("add-btn")) {
        window.location.href =
          `./products/product.html?slug=${product.slug}`;
      }
    });

    grid.appendChild(card);
  });
}

/* =========================
   CART HANDLING
========================= */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("add-btn")) return;

  e.stopPropagation();

  const btn = e.target;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(p => p.id == btn.dataset.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      image: btn.dataset.image,
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  btn.textContent = "Added ✓";
  btn.disabled = true;

  updateCartCount();
});

/* =========================
   CART COUNT
========================= */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.qty, 0);

  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}
/* =========================
   SUbmit Form
========================= */
const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {
  enquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(enquiryForm);

    const { error } = await supabase
      .from("enquiries")
      .insert([{
        name: formData.get("name"),
        email: formData.get("email"),
        city: formData.get("city"),
        phone: formData.get("phone"),
        enquiry_type: formData.get("enquiry_type")
      }]);

    if (error) {
      console.error("❌ Enquiry failed", error);
      alert("Something went wrong. Please try again.");
      return;
    }

    alert("🌿 Thank you! Your enquiry has been received.");
    enquiryForm.reset();
  });
}
