import { inngest } from "../inngest/index.js";
import Video from "../schema/videoSchema.js";
import getScript from "../utils/getScript.js";

export const getVideoDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const video = await Video.findOne({ _id: id, createdBy: req.user._id });
    if (!video) return res.status(404).json({ error: "Video not found" });
    return res.status(200).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ createdBy: req.user._id });
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateVideoContent = async (req, res) => {
  try {
    const { prompt, voice, videoStyle } = req.body;
    const userId = req.user._id;
    if (req.user.credits <= 0)
      return res
        .status(401)
        .json({ success: false, message: "Credit limit reached" });
    if (!prompt || !voice || !videoStyle)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    const script = await getScript(prompt);

    const video = await Video.create({
      prompt,
      script,
      videoStyle,
      voice,
      createdBy: userId,
    });
    const result = await inngest.send({
      name: "generate-video-data",
      data: { script, prompt, voice, videoStyle, userId, videoId: video._id },
    });
    return res.status(200).json({ message: "ok", result, videoId: video._id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
