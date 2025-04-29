import { model } from "../config/geminiConfig.js";

const SCRIPT = `Generate Image prompt of   all the details for 60 second  : script : {script}
- Just Give specifying image prompt depends on the story line
- do not give camera angle image prompt
- Follow the Following schema and return JSON data (Max 4-5 Images)

[
    {
        imagePrompt: '',
        sceneContent: ' <Script Content>'
    }
]  only give me JSON response do not add extra text to the response`;

const getImagePrompt = async (prompt) => {
  const PROMPT = SCRIPT.replace("{script}", prompt);
  const response = await model.generateContent(PROMPT);
  const imagePrompt = response.response.text();

  return imagePrompt;
};

export default getImagePrompt;
