require("dotenv").config();

const express = require("express");
const app = express();
// const cors = require("cors");
app.use(express.json());
app.use(
  // cors({
  //   origin: "http://localhost:5500",
  // })
  express.static("public")
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const items = require("./items");
const storeItems = new Map(items["itemsArray"]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.price,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.SERVER_URL}/index.html`,
      cancel_url: `${process.env.SERVER_URL}/menu.html`,
      //success_url: `${process.env.NGROK_URL}/index.html`,
      //cancel_url: `${process.env.NGROK_URL}/menu.html`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(7000);
