import { AccessToken } from "livekit-server-sdk";

/// 🎥 CREATE LIVEKIT TOKEN
export const createStreamToken = async (req, res) => {
  try {
    const { roomName } = req.body;
    const user = req.user;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "Room name required",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /// 🎯 ROLE BASED PERMISSIONS
    const isStreamer = user.role === "streamer";

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: user.id.toString(),
        name: user.id.toString(),
      }
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isStreamer,   // 🎙 streamer hi publish karega
      canSubscribe: true,
    });

    const token = at.toJwt();

    return res.status(200).json({
      success: true,
      token,
      roomName,
      isStreamer,
    });

  } catch (error) {
    console.error("STREAM TOKEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create token",
      error: error.message,
    });
  }
};