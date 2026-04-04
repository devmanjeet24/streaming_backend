import User from "../models/user.model.js";

// UPDATE PROFILE (image + username)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Image handling
    if (req.file) {
      user.avatar = req.file.path; // Cloudinary URL
    }

    user.username = username;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};