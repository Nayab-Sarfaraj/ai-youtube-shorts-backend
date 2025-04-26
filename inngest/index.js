import { createClient } from "@deepgram/sdk";
import axios from "axios";
import { Inngest } from "inngest";
import { GenerateImageScript } from "../config/geminiConfig.js";
import Video from "../schema/videoSchema.js";
console.log(process.env.INNGEST_EVENT_KEY);
export const inngest = new Inngest({
  id: "my-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

const BASE_URL = "https://aigurulab.tech";
const ImagePromptScript = `Generate Image prompt of {style} style with all the details for 30 second  : script : {script}
- Just Give specifying image prompt depends on the story line
- do not give camera angle image prompt
- Follow the Following schema and return JSON data (Max 4-5 Images)

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
    const { script, prompt, voice, videoStyle, userId, title } = event?.data;

    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
      const result = await axios.post(
        BASE_URL + "/api/text-to-speech",
        {
          input: script,
          voice: voice,
        },
        {
          headers: {
            "x-api-key": process.env.AI_GURU_LAB_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(result.data.audio);

      return result.data.audio;
    });

    const GenerateCaption = await step.run("GenerateCaption", async () => {
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: GenerateAudioFile,
        },

        {
          model: "nova-3",
        }
      );
      console.log(result.results.channels);
      return result?.results?.channels[0]?.alternatives[0].words;
    });

    const GenerateImagePrompt = await step.run(
      "GenerateImagePompt",
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
          const result = await axios.post(
            BASE_URL + "/api/generate-image",
            {
              width: 1024,
              height: 1024,
              input: ele?.imagePrompt,
              model: "sdxl", //'flux'
              aspectRatio: "1:1", //Applicable to Flux model only
            },
            {
              headers: {
                "x-api-key": process.env.AI_GURU_LAB_API_KEY, // Your API Key
                "Content-Type": "application/json",
              },
            }
          );
          console.log(result.data.image);
          return result.data.image;
        })
      );

      return images;
    });

    const saveInDB = await step.run("saveInDB", async () => {
      try {
        const audioUrl = GenerateAudioFile;
        const captionJson = GenerateCaption;
        const images = GenerateImages;
        const video = await Video.create({
          title,
          script,
          prompt,
          voice,
          videoStyle,
          createdBy: userId,
          audioUrl,
          captionJson,
          images,
        });
        return video;
      } catch (error) {
        return error?.message;
      }
    });

    return saveInDB;
  }
);

export const functions = [GenerateVideoData];
