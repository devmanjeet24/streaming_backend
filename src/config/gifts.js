import GiftConfig from "../models/gift.config.model.js";

// DB se gifts lo
export const getGifts = async () => {
  const gifts = await GiftConfig.find({ isActive: true });
  const map = {};
  gifts.forEach(g => { map[g.type] = g; });
  return map;
};

// Default gifts seed karo agar DB empty hai
export const seedGifts = async () => {
  const count = await GiftConfig.countDocuments();
  if (count === 0) {
    await GiftConfig.insertMany([
      { type: "rose",   name: "Rose",   emoji: "🌹", coinCost: 10,  diamondsEarned: 8   },
      { type: "fire",   name: "Fire",   emoji: "🔥", coinCost: 50,  diamondsEarned: 40  },
      { type: "crown",  name: "Crown",  emoji: "👑", coinCost: 200, diamondsEarned: 160 },
      { type: "rocket", name: "Rocket", emoji: "🚀", coinCost: 500, diamondsEarned: 400 },
    ]);
    console.log("✅ Default gifts seeded");
  }
};


// main issue, yha array created hai, but ye DB se aana chiaye,  MANJEETISSUE 