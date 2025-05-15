import { AssemblyAI } from "assemblyai";
import axios from "axios";
import dotenv from "dotenv";
import { Inngest } from "inngest";
import OpenAI from "openai";
import Replicate from "replicate";
import { GenerateImageScript } from "../config/geminiConfig.js";
import render_video from "../render.js";
import User from "../schema/UserSchema.js";
import Video from "../schema/videoSchema.js";
import UploadAudio from "../utils/UploadAudio.js";
import sendErrorToDiscord from "../config/discordConfig.js";
import { sendNotificationToDevice } from "../utils/notification.js";
dotenv.config();
const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY,
});

export const inngest = new Inngest({
  id: "my-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const client = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});
const BASE_URL = "https://aigurulab.tech";
const ImagePromptScript = `Generate Image prompt of {style} style with all the details for 30 second  : script : {script}
- Just Give specifying image prompt depends on the story line
- do not give camera angle image prompt
- Follow the Following schema and return JSON data (Max 4 Images)

[
    {
        imagePrompt: '',
        sceneContent: ' <Script Content>'
    }
]
`;

export const GenerateVideoData = inngest.createFunction(
  { id: "generate-video-data" },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    const { script, prompt, voice, videoStyle, userId, videoId } = event?.data;

    if (!voice) voice = "21m00Tcm4TlvDq8ikWAM";

    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
      try {
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
          {
            text: script,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.75,
            },
          },
          {
            responseType: "arraybuffer",
            headers: {
              "xi-api-key": process.env.ELEVEN_LABS,
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
            },
          }
        );

        const audioBuffer = Buffer.from(response.data);
        const url = await UploadAudio(audioBuffer);

        return url;
      } catch (error) {
        await sendErrorToDiscord(error.stack || error.message);
        throw new Error(error);
      }
    });

    const GenerateCaption = await step.run("GenerateCaption", async () => {
      try {
        const params = {
          audio: GenerateAudioFile,
          speech_model: "universal",
        };
        const transcript = await assemblyClient.transcripts.transcribe(params);

        return transcript.words;
      } catch (error) {
        await sendErrorToDiscord(error.stack || error.message);
        throw new Error(error);
      }
    });

    const GenerateImagePrompt = await step.run(
      "GenerateImagePrompt",
      async () => {
        try {
          const FINAL_PROMPT = ImagePromptScript.replace(
            "{script}",
            script
          ).replace("{style}", videoStyle);
          const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
          const resp = JSON.parse(result.response.text());
          return resp;
        } catch (error) {
          await sendErrorToDiscord(error.stack || error.message);
          throw new Error(error);
        }
      }
    );
    const GenerateImages = await step.run("GenerateImages", async () => {
      try {
        let images = [];
        images = await Promise.all(
          GenerateImagePrompt.map(async (ele) => {
            const response = await replicate.run(
              "black-forest-labs/flux-schnell",
              {
                input: {
                  prompt: ele?.imagePrompt,

                  num_inference_steps: 4,
                },
              }
            );

            const imageStream = response[0];

            // Convert the ReadableStream into a Buffer (array of bytes)
            const buffers = [];
            for await (const chunk of imageStream) {
              buffers.push(chunk);
            }

            const buffer = Buffer.concat(buffers);
            const url = await UploadAudio(buffer);

            return url;
          })
        );

        return images;
      } catch (error) {
        await sendErrorToDiscord(error.stack || error.message);
        throw new Error(error);
      }
    });

    const saveInDB = await step.run("saveInDB", async () => {
      try {
        const audioUrl = GenerateAudioFile;
        const captionJson = GenerateCaption;
        const images = GenerateImages;
        const video = await Video.findById(videoId);
        video.audioUrl = audioUrl;
        video.captionJson = captionJson;
        video.images = images;
        const savedVideo = await video.save();
        return savedVideo;
      } catch (error) {
        await sendErrorToDiscord(error.stack || error.message);
        throw new Error(error);
      }
    });

    const renderVideo = step.run("renderVideo", async () => {
      try {
        let video = saveInDB;
        const url = await render_video(
          video.audioUrl,
          video.images,
          video.captionJson
        );
        video = await Video.findById(video._id);
        video.videoUrl = url;
        video.status = "completed";
        await video.save();
        const user = await User.findById(video.createdBy);
        user.credits -= 1;
        await user.save();
        await sendNotificationToDevice();
        return video;
      } catch (error) {
        await sendErrorToDiscord(error.stack || error.message);
        throw new Error(error);
      }
    });

    return renderVideo;
  }
);

export const functions = [GenerateVideoData];
