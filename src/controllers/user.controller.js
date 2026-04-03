import User from "../models/User.js";

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE PROFILE (POST)
export const createProfile = async (req, res) => {
  try {
    const { photo, about, gender, dob, languages } = req.body;

    const user = await User.findById(req.user.id);

    user.profile = {
      photo,
      about,
      gender,
      dob,
      languages,
    };

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Profile created",
      data: user.profile,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profile: updates },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user.profile,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};