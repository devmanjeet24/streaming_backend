import User from "../models/user.model.js";

// UPDATE PROFILE (image + username)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { username } = req.body;

    // ✅ Validation
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Image (Cloudinary)
    if (req.file) {
      user.avatar = req.file.path; // Cloudinary URL
    }

    user.username = username.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        username: user.username,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};