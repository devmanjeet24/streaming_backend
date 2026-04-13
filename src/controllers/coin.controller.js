import Stripe from "stripe";
import Coin from "../models/coin.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

// Coin packages
const PACKAGES = [
  { id: "pack_100",  coins: 100,  price: 99  }, // ₹99
  { id: "pack_500",  coins: 500,  price: 449 },
  { id: "pack_1000", coins: 1000, price: 799 },
];

// Balance check
export const getBalance = async (req, res) => {
  try {
    const coin = await Coin.findOne({ user: req.user._id });
    res.json({ success: true, balance: coin?.balance ?? 0 });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Stripe payment intent banao
export const createPaymentIntent = async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg) return res.status(400).json({ message: "Invalid package" });

    const intent = await stripe.paymentIntents.create({
      amount: pkg.price * 100, // paise mein
      currency: "inr",
      metadata: {
        userId: req.user._id.toString(),
        coins: pkg.coins.toString(),
      },
    });

    res.json({ success: true, clientSecret: intent.client_secret, coins: pkg.coins });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Coins add karo (payment confirm hone ke baad)
export const addCoins = async (req, res) => {
  try {
    const { coins } = req.body;
    if (!coins) return res.status(400).json({ message: "Coins required" });

    let coinDoc = await Coin.findOne({ user: req.user._id });
    if (!coinDoc) {
      coinDoc = new Coin({ user: req.user._id, balance: 0 });
    }
    coinDoc.balance += coins;
    await coinDoc.save();

    res.json({ success: true, balance: coinDoc.balance });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export { PACKAGES };