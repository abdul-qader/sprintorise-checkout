import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "https://sprintorise.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pages } = req.body;

  if (!pages || typeof pages !== "number") {
    return res.status(400).json({ error: "Invalid page count" });
  }

  // 💰 Pricing logic
  const basePrice = 600; // USD
  const pricePerPage = 300; // USD
  const totalAmount = basePrice + pages * pricePerPage; // in dollars

  // Convert to cents for Stripe
  const stripeAmount = totalAmount * 100;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pages}–Page Website Launch Kit`,
              description: `Development of ${pages} custom pages based on your provided design.`,
            },
            unit_amount: stripeAmount, // in cents ✅
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://sprintorise.com/",
      cancel_url: "https://sprintorise.com/",

      // ✅ Discount (STR15)
      discounts: [
        {
          promotion_code: "promo_1RBtxGH5UZYsxJ7SMoPPDw5D",
        },
      ],
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout error" });
  }
}
