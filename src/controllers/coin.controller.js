import Stripe from "stripe";
import Coin from "../models/coin.model.js";
import Transaction from "../models/transaction.model.js";

const stripe = process.env.STRIPE_SECRET
  ? new Stripe(process.env.STRIPE_SECRET)
  : null;

export const PACKAGES = [
  { id: "pack_100",  coins: 100,  price: 99  },
  { id: "pack_500",  coins: 500,  price: 449 },
  { id: "pack_1000", coins: 1000, price: 799 },
];

// GET /coins/balance
export const getBalance = async (req, res) => {
  try {
    const coin = await Coin.findOne({ user: req.user._id });
    res.json({ success: true, balance: coin?.balance ?? 0 });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /coins/buy — Stripe payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });

    const { packageId, customCoins } = req.body;

    let coins, priceInPaise;

    if (customCoins) {
      // Manual amount — 1 coin = ₹1
      coins = parseInt(customCoins);
      if (coins < 10) return res.status(400).json({ message: "Minimum 10 coins" });
      priceInPaise = coins * 100;
    } else {
      const pkg = PACKAGES.find(p => p.id === packageId);
      if (!pkg) return res.status(400).json({ message: "Invalid package" });
      coins = pkg.coins;
      priceInPaise = pkg.price * 100;
    }

    const intent = await stripe.paymentIntents.create({
      amount: priceInPaise,
      currency: "inr",
      metadata: {
        userId: req.user._id.toString(),
        coins: coins.toString(),
      },
    });

    res.json({ 
      success: true, 
      clientSecret: intent.client_secret, 
      paymentIntentId: intent.id,
      coins 
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /coins/add — testing only
export const addCoins = async (req, res) => {
  try {
    const { coins } = req.body;
    if (!coins) return res.status(400).json({ message: "Coins required" });

    let coinDoc = await Coin.findOne({ user: req.user._id });
    if (!coinDoc) coinDoc = new Coin({ user: req.user._id, balance: 0 });
    coinDoc.balance += parseInt(coins);
    await coinDoc.save();

    await Transaction.create({
      user: req.user._id,
      type: "credit",
      amount: parseInt(coins),
      description: `Added ${coins} coins (test)`,
    });

    res.json({ success: true, balance: coinDoc.balance });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /coins/transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, transactions });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /coins/webhook — Stripe webhook
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    return res.status(400).json({ message: `Webhook error: ${e.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const userId = intent.metadata.userId;
    const coins = parseInt(intent.metadata.coins);

    let coinDoc = await Coin.findOne({ user: userId });
    if (!coinDoc) coinDoc = new Coin({ user: userId, balance: 0 });
    coinDoc.balance += coins;
    await coinDoc.save();

    await Transaction.create({
      user: userId,
      type: "credit",
      amount: coins,
      description: `Purchased ${coins} coins via Stripe`,
    });
  }

  res.json({ received: true });
};

// POST /coins/confirm — Flutter payment success ke baad yeh call karo
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });

    // Stripe se verify karo ki payment actually hua
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const userId = intent.metadata.userId;
    const coins = parseInt(intent.metadata.coins);

    // Check karo — pehle se process hua hai kya (duplicate prevention)
    const existing = await Transaction.findOne({
      description: { $regex: paymentIntentId },
    });

    if (existing) {
      const coinDoc = await Coin.findOne({ user: userId });
      return res.json({ success: true, balance: coinDoc?.balance ?? 0, alreadyProcessed: true });
    }

    // Coins add karo
    let coinDoc = await Coin.findOne({ user: userId });
    if (!coinDoc) coinDoc = new Coin({ user: userId, balance: 0 });
    coinDoc.balance += coins;
    await coinDoc.save();

    await Transaction.create({
      user: userId,
      type: "credit",
      amount: coins,
      description: `Purchased ${coins} coins [${paymentIntentId}]`,
    });

    res.json({ success: true, balance: coinDoc.balance });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};



