import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    script: { type: String, required: true },
    videoStyle: { type: String, required: true },
    voice: { type: String, required: true },
    images: { type: mongoose.Schema.Types.Mixed, default: null },
    audioUrl: { type: String, default: null },
    captionJson: { type: mongoose.Schema.Types.Mixed, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, default: "pending" },
    videoUrl: { type: String, default: "" },
  },
  {
    timestamps: true, // createdAt and updatedAt auto-managed
  }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
