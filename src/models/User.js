const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  username: { type: String, unique: true },

  authProvider: {
    type: String,
    enum: ["email", "google"],
    default: "email",
  },

  googleId: String,

  isVerified: { type: Boolean, default: false },

  otp: String,
  otpExpiry: Date,

  walletBalance: { type: Number, default: 0 },

  profile: {
    photo: String,
    about: String,
    gender: String,
    dob: Date,
    languages: [String],
  },
}, { timestamps: true });