import { supabase } from "../admin/supabaseClient.js";

let currentProduct = null;

document.addEventListener("DOMContentLoaded", async () => {

  /* =====================
     GET SLUG (fallback)
  ====================== */
  const slug =
    new URLSearchParams(window.location.search).get("slug") || "kuberakshi";

  /* =====================
     DOM ELEMENTS
  ====================== */
  const pageTitle = document.getElementById("pageTitle");
  const productName = document.getElementById("productName");
  const productEnergy = document.getElementById("productEnergy");
  const productDesc = document.getElementById("productDesc");
  const productPrice = document.getElementById("productPrice");

  const galleryMain = document.querySelector(".gallery-main");
  const thumbs = document.getElementById("thumbs");

  const addBtn = document.getElementById("addToCartBtn");
  const cartCount = document.getElementById("cartCount");

  /* =====================
     FETCH PRODUCT
  ====================== */
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
  ====================== */
  pageTitle.innerText = `${product.name} | Secret Sanctuary`;
  productName.innerText = product.name;
  productEnergy.innerText = product.energy || "";
  productDesc.innerText = product.description;
  productPrice.innerText = `₹${product.price}`;

  /* =====================
     GALLERY
  ====================== */
  renderGallery(product);

  /* =====================
     CART
  ====================== */
  setupCart(product);

  updateCartCount();

  /* =====================
     RELATED PRODUCTS
  ====================== */
  loadRelatedProducts(product.slug);
});

/* =====================
   GALLERY FUNCTIONS
====================== */
function renderGallery(product) {
  const galleryMain = document.querySelector(".gallery-main");
  const thumbs = document.getElementById("thumbs");

  thumbs.innerHTML = "";
  galleryMain.innerHTML = "";

  let galleryItems = [];

  if (Array.isArray(product.gallery) && product.gallery.length) {
    galleryItems = product.gallery.map(item =>
      typeof item === "string" ? { type: "image", src: item } : item
    );
  } else if (product.image) {
    galleryItems = [{ type: "image", src: product.image }];
  }

  if (!galleryItems.length) return;

  setMainImage(galleryItems[0].src, product.name);

  galleryItems.forEach((item, index) => {
    if (item.type !== "image") return;

    const thumb = document.createElement("img");
    thumb.src = item.src;
    if (index === 0) thumb.classList.add("active");

    thumb.addEventListener("click", () => {
      document
        .querySelectorAll(".gallery-thumbs img")
        .forEach(el => el.classList.remove("active"));

      thumb.classList.add("active");
      setMainImage(item.src, product.name);
    });

    thumbs.appendChild(thumb);
  });
}

function setMainImage(src, alt) {
  const galleryMain = document.querySelector(".gallery-main");
  galleryMain.innerHTML = "";

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;

  galleryMain.appendChild(img);
}

/* =====================
   CART FUNCTIONS
====================== */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.innerText = getCart().length;
}

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
        image: product.image,
        qty: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    addBtn.innerText = "Added ✓";
    addBtn.disabled = true;
    updateCartCount();
  });
}

/* =====================
   RELATED PRODUCTS
====================== */
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
    card.href = `/products/product.html?slug=${p.slug}`;
    card.className = "related-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <span>₹${p.price}</span>
    `;

    grid.appendChild(card);
  });
}

/* =====================
   WHATSAPP BUTTON
====================== */
document.getElementById("whatsappBtn")?.addEventListener("click", () => {
  const phone = "919005252278";
  const msg =
    "Namaste 🙏 Main Secret Sanctuary ke product ke baare me jaankari chahta/chahti hoon.";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});
