import {
  generateScript,
  generationConfig,
  model,
} from "../config/geminiConfig.js";
const SCRIPT_PROMPT = `Write a short, engaging story for a 30-second video on the topic: {topic}.  
• Start with an attention-grabbing hook in the first line  
• Include a twist, emotion, or surprising fact to keep viewers interested  
• End with a thought-provoking or impactful line  
• Do not use labels like "Scene", "Voiceover", or technical instructions  
• Output only the story in this exact JSON format:

{
  "scripts": [
    {
      "content": ""
    }
  ]
}

`;
const getScript = async (prompt) => {
  const PROMPT = SCRIPT_PROMPT.replace("{topic}", prompt);
  const result = await generateScript.sendMessage(PROMPT);
  let resp = result?.response?.text();
  resp = JSON.parse(resp);
  console.log(resp.scripts[0].content);

  return resp.scripts[0].content;
};

export default getScript;
