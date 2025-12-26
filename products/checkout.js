const cart = JSON.parse(localStorage.getItem("cart")) || [];

async function placeOrder() {
  const customer = {
    name: name.value,
    email: email.value,
    phone: phone.value
  };

  const { data: cust } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

  const { data: order } = await supabase
    .from("orders")
    .insert({ customer_id: cust.id, total })
    .select()
    .single();

  for (let item of cart) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price
    });
  }

  // 👉 HERE: redirect to Razorpay / Stripe
}

payBtn.onclick = placeOrder;
