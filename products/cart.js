/* =====================
   HELPERS
===================== */
function fixImagePath(path) {
  if (!path) return "";
  if (typeof path === "object" && path.src) path = path.src;
  if (typeof path !== "string") return "";
  return path.startsWith("/") ? `..${path}` : path;
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  el.textContent = total;
}

/* =====================
   RENDER CART
===================== */
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  if (!container || !totalEl) return;

  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = `<p class="empty-cart">Your sanctuary is empty 🌱</p>`;
    totalEl.textContent = "₹0";
    updateCartCount();
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${fixImagePath(item.image)}" alt="${item.name}">
      <div class="cart-info">
        <h4>${item.name}</h4>
        <span>₹${item.price}</span>

        <div class="qty-controls">
          <button class="qty-minus">−</button>
          <span>${item.qty}</span>
          <button class="qty-plus">+</button>
        </div>

        <button class="remove-btn">Remove</button>
      </div>
    `;

    // qty -
    div.querySelector(".qty-minus").addEventListener("click", () => {
      if (item.qty > 1) {
        item.qty--;
      } else {
        cart.splice(cart.indexOf(item), 1);
      }
      saveCart(cart);
      renderCart();
    });

    // qty +
    div.querySelector(".qty-plus").addEventListener("click", () => {
      item.qty++;
      saveCart(cart);
      renderCart();
    });

    // remove
    div.querySelector(".remove-btn").addEventListener("click", () => {
      const i = cart.indexOf(item);
      if (i > -1) cart.splice(i, 1);
      saveCart(cart);
      renderCart();
    });

    container.appendChild(div);
  });

  totalEl.textContent = `₹${total}`;
  updateCartCount();
}

/* =====================
   CLEAR CART
===================== */
document.getElementById("clearCart")?.addEventListener("click", () => {
  localStorage.removeItem("cart");
  renderCart();
});

/* =====================
   DOM READY
===================== */
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});
