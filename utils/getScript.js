import {
  generateScript,
  generationConfig,
  model,
} from "../config/geminiConfig.js";
const SCRIPT_PROMPT = `write a  script for 30 Seconds video on Topic: {topic}.  
• Give me response in JSON format and follow the schema  

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
