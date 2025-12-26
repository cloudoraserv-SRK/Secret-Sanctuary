import { supabase } from "../admin/supabaseClient.js";

let currentProduct = null;

/* =====================
   HELPERS
===================== */

// 🔥 GitHub Pages image path fix
function fixImagePath(input) {
  if (!input) return "";

  // agar object hai { src: "..." }
  if (typeof input === "object" && input.src) {
    input = input.src;
  }

  if (typeof input !== "string") return "";

  return input.startsWith("/") ? `..${input}` : input;
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const cart = getCart();
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  el.textContent = total;
}

/* =====================
   DOM READY
===================== */
document.addEventListener("DOMContentLoaded", async () => {

  /* =====================
     GET SLUG
  ===================== */
  const slug =
    new URLSearchParams(window.location.search).get("slug") || "kuberakshi";

  /* =====================
     FETCH PRODUCT
  ===================== */
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !product) {
    console.error("❌ Product load failed:", error);
    return;
  }

  currentProduct = product;

  /* =====================
     BASIC INFO
  ===================== */
  document.title = `${product.name} | Secret Sanctuary`;

  document.getElementById("productName").textContent = product.name;
  document.getElementById("productEnergy").textContent = product.energy || "";
  document.getElementById("productDesc").textContent = product.description || "";
  document.getElementById("productPrice").textContent = `₹${product.price}`;

  /* =====================
     GALLERY
  ===================== */
  renderGallery(product);

  /* =====================
     CART
  ===================== */
  setupCart(product);
  updateCartCount();

  /* =====================
     RELATED PRODUCTS
  ===================== */
  loadRelatedProducts(product.slug);
});

/* =====================
   GALLERY
===================== */
function renderGallery(product) {
  const galleryMain = document.querySelector(".gallery-main");
  const thumbs = document.getElementById("thumbs");

  if (!galleryMain || !thumbs) return;

  galleryMain.innerHTML = "";
  thumbs.innerHTML = "";

  let images = [];

  if (Array.isArray(product.gallery) && product.gallery.length) {
    images = product.gallery;
  } else if (product.image) {
    images = [product.image];
  }

  if (!images.length) return;

  setMainImage(images[0], product.name);

  images.forEach((src, index) => {
    const thumb = document.createElement("img");
    thumb.src = fixImagePath(src);
    thumb.alt = product.name;

    if (index === 0) thumb.classList.add("active");

    thumb.addEventListener("click", () => {
      document
        .querySelectorAll("#thumbs img")
        .forEach(img => img.classList.remove("active"));

      thumb.classList.add("active");
      setMainImage(src, product.name);
    });

    thumbs.appendChild(thumb);
  });
}

function setMainImage(src, alt) {
  const galleryMain = document.querySelector(".gallery-main");
  if (!galleryMain) return;

  galleryMain.innerHTML = "";

  const img = document.createElement("img");
  img.src = fixImagePath(src);
  img.alt = alt;

  galleryMain.appendChild(img);
}

/* =====================
   CART
===================== */
function setupCart(product) {
  const addBtn = document.getElementById("addToCartBtn");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    const cart = getCart();
    const existing = cart.find(p => p.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: fixImagePath(product.image),
        qty: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    addBtn.textContent = "Added ✓";
    addBtn.disabled = true;

    updateCartCount();
  });
}

/* =====================
   RELATED PRODUCTS
===================== */
async function loadRelatedProducts(currentSlug) {
  const { data, error } = await supabase
    .from("products")
    .select("name, slug, image, price")
    .eq("active", true)
    .neq("slug", currentSlug)
    .limit(4);

  if (error || !data) return;

  const grid = document.getElementById("relatedGrid");
  if (!grid) return;

  grid.innerHTML = "";

  data.forEach(p => {
    const card = document.createElement("a");
    card.className = "related-card";
    card.href = `./product.html?slug=${p.slug}`;

    const imgPath = fixImagePath(p.image);

    card.innerHTML = `
      <img src="${imgPath}" alt="${p.name}">
      <h4>${p.name}</h4>
      <span>₹${p.price}</span>
    `;

    grid.appendChild(card);
  });
}

/* =====================
   WHATSAPP BUTTON
===================== */
document.getElementById("whatsappBtn")?.addEventListener("click", () => {
  const phone = "919005252278";
  const msg =
    "Namaste 🙏 Main Secret Sanctuary ke product ke baare me jaankari chahta/chahti hoon.";
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
});

