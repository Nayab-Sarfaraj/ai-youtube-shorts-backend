import { createClient } from "@deepgram/sdk";
import axios from "axios";
import { Inngest } from "inngest";
import { GenerateImageScript } from "../config/geminiConfig.js";
import Video from "../schema/videoSchema.js";
import render_video from "../render.js";
import User from "../schema/UserSchema.js";
import fs from "fs";
import path from "path";
import UploadAudio from "../utils/UploadAudio.js";
import OpenAI from "openai";
import { AssemblyAI } from "assemblyai";
import { model } from "mongoose";
import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();
const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY,
});

// console.log(process.env.ASSEMBLY_AI_API_KEY);
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
      console.log(response.data);
      const audioBuffer = Buffer.from(response.data);
      const url = await UploadAudio(audioBuffer);
      return url;
    });

    const GenerateCaption = await step.run("GenerateCaption", async () => {
      //   // const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
      //   // const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      //   //   {
      //   //     url: "https://vcxubocrekxvkwwbuqgx.supabase.co/storage/v1/object/public/ai-youtube/public/1745994830276.mp3",
      //   //   },

      //   //   {
      //   //     model: "nova-3",
      //   //   }
      //   // );
      //   // if (error) console.log(error);
      //   // console.log(result);
      //   // return result?.results?.channels[0]?.alternatives[0].words;
      const params = {
        audio: GenerateAudioFile,
        speech_model: "universal",
      };
      const transcript = await assemblyClient.transcripts.transcribe(params);

      console.log(transcript);
      return transcript.words;
    });

    const GenerateImagePrompt = await step.run(
      "GenerateImagePrompt",
      async () => {
        const FINAL_PROMPT = ImagePromptScript.replace(
          "{script}",
          script
        ).replace("{style}", videoStyle);
        const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const resp = JSON.parse(result.response.text());
        return resp;
      }
    );
    const GenerateImages = await step.run("GenerateImages", async () => {
      let images = [];
      images = await Promise.all(
        GenerateImagePrompt.map(async (ele) => {
          // const result = await axios.post(
          //   BASE_URL + "/api/generate-image",
          //   {
          //     width: 1024,
          //     height: 1024,
          //     input: ele?.imagePrompt,
          //     model: "sdxl", //'flux'
          //     aspectRatio: "1:1", //Applicable to Flux model only
          //   },
          //   {
          //     headers: {
          //       "x-api-key": process.env.AI_GURU_LAB_API_KEY, // Your API Key
          //       "Content-Type": "application/json",
          //     },
          //   }
          // );
          // console.log(result.data.image);
          // return result.data.image;

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
          console.log(buffers);
          const buffer = Buffer.concat(buffers);
          const url = await UploadAudio(buffer);
          console.log(url);
          return url;
        })
      );

      return images;
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
        return error?.message;
      }
    });

    const renderVideo = step.run("renderVideo", async () => {
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

      return video;
    });

    return renderVideo;
  }
);

export const functions = [GenerateVideoData];
