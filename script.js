import { supabase } from "/admin/supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     GSAP SAFE CHECK
  ========================= */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-title", { opacity: 0, y: 30, duration: 1.6 });
    gsap.from(".hero-subtitle", { opacity: 0, y: 20, delay: 0.2 });
    gsap.from(".hero-description", { opacity: 0, y: 20, delay: 0.4 });
    gsap.from(".hero-cta", { opacity: 0, y: 10, delay: 0.6 });

    const fadeUp = (targets, trigger) => {
      gsap.from(targets, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.2,
        scrollTrigger: { trigger, start: "top 80%" }
      });
    };

    fadeUp(".product-card", "#featured");
    fadeUp(".knowledge-text, .knowledge-visual", "#knowledge");
  }

  /* =========================
     LOAD FEATURED PRODUCTS
  ========================= */
  loadFeaturedProducts();
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

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.energy || "Balance, shanti aur well-being ke liye sacred plant"}</p>
      <button class="add-btn"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        data-image="${product.image}">
        Add to Sanctuary
      </button>
    `;

    card.addEventListener("click", e => {
      if (!e.target.classList.contains("add-btn")) {
        window.location.href =
          `/products/product.html?slug=${product.slug}`;
      }
    });

    grid.appendChild(card);
  });
}

/* =========================
   CART (GLOBAL, SAFE)
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

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}
