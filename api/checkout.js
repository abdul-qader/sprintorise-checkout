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

  const pricePerPage = 300;
  const totalAmount = 600 + (pages * pricePerPage);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Website Launch Kit – ${pages} Page Website Development`,
              description: `Development of ${pages} custom pages based on your provided design. Fully responsive, SEO-friendly, fast-loading, and ready for launch.`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://sprintorise.com/",

      discounts: [
    {
      promotion_code: "promo_1RBtxGH5UZYsxJ7SMoPPDw5D", // Replace this in step 2 below
    },
  ],
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout error" });
  }
}
