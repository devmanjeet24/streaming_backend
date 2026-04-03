import Stripe from "stripe";

// ❗ Lazy init (BEST PRACTICE)
let stripe;

export const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET) {
      throw new Error("STRIPE_SECRET missing in .env");
    }

    stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: "2023-10-16",
    });
  }

  return stripe;
};

// ✅ Payment intent
export const createPaymentIntent = async (amount, userId) => {
  const stripe = getStripe();

  return await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    metadata: { userId },
  });
};