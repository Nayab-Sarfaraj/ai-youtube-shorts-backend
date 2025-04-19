import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};
export const generateScript = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: 'write a two different script for 30 Seconds video on Topic: {topic}.  \n• Give me response in JSON format and follow the schema  \n\n{  \n  "scripts": [  \n    {  \n      "content": ""  \n    },  \n    {  \n      "content": ""  \n    }  \n  ]  \n}\n',
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n{\n  "scripts": [\n    {\n      "content": "(SCENE START: Fast-paced montage of people looking stressed, deadlines flashing on screens, overflowing inboxes)\\n\\n(VOICEOVER - Urgent, slightly frantic): Are you drowning in tasks? Overwhelmed by your to-do list? Feeling like you\'re constantly playing catch-up?\\n\\n(SCENE CHANGE: Calm, organized workspace. Person smiling, checking off tasks on a clean digital planner on a tablet.)\\n\\n(VOICEOVER - Calm, reassuring): There\'s a better way. Introducing [Product Name]! The simple, powerful task management solution designed to bring clarity and control back to your day.\\n\\n(SCENE CHANGE: Quick shots highlighting key features of the product - drag and drop, collaboration, reminders)\\n\\n(VOICEOVER): Get organized, stay focused, and finally conquer your to-do list. \\n\\n(ON-SCREEN TEXT: [Product Name] Logo. Website Address. Tagline: Conquer Your To-Do List.)"\n    },\n    {\n      "content": "(SCENE START: A single, overflowing physical inbox. Paper bills, flyers, random notes everywhere.)\\n\\n(SOUND: Crushing paper sound effect)\\n\\n(VOICEOVER - Narrator): Remember this? The chaos of physical clutter? It\'s creeping into your digital life too! Too many emails? Scattered notes? \\n\\n(SCENE CHANGE: Hand smoothly dragging and dropping items into organized folders within a digital task manager.)\\n\\n(VOICEOVER - Narrator): [Product Name] helps you declutter your digital workspace and focus on what matters most. \\n\\n(SCENE CHANGE: User easily collaborating with a team member within the app. Video call interface showing them working together.)\\n\\n(VOICEOVER - Narrator): Collaborate seamlessly, prioritize tasks, and achieve your goals, all in one place.\\n\\n(ON-SCREEN TEXT: [Product Name] - Declutter Your Mind. Try it Free! Website Address.)"\n    }\n  ]\n}\n```',
        },
      ],
    },
  ],
});

export const GenerateImageScript = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: 'Generate Image prompt of Cinematic style with all details for each scene for 30 seconds video : script: Rosa Parks refused to give up her seat on a bus in 1955. Her quiet act of defiance sparked the Montgomery Bus Boycott, a pivotal moment in the Civil Rights Movement. One person’s bravery can inspire lasting change for everyone.\n\nJust Give specifying image prompt depends on the story line\ndo not give camera angle image prompt\nFollow the Following schema and return JSON data (Max 4-5 Images)\n[\n    {\n        "imagePrompt": "",\n        "sceneContent": "<Script Content>"\n    }\n]\n',
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: 'I am sorry, image generation is only enabled for the "Gemini 2.0 Flash Experimental" model when the selected output format is "Images and text". However, I can provide the JSON data containing image prompts based on your script.\n\n```json\n[\n    {\n        "imagePrompt": "A tired Rosa Parks, a Black woman in her forties, sits wearily on a bus seat. Her face is etched with a quiet determination. The bus interior is dimly lit, filled with other passengers, some looking on with concern, others with indifference. It\'s 1955 Montgomery, Alabama. Realistic, grainy photo, cinematic lighting.",\n        "sceneContent": "Rosa Parks refused to give up her seat on a bus in 1955."\n    },\n    {\n        "imagePrompt": "A tight close-up on Rosa Parks\' hands, clasped tightly in her lap. Her knuckles are white with tension. The camera focuses on the strength and resolve in her hands despite her fatigue. The worn fabric of her dress is visible. Dramatic lighting, emphasizing texture and emotion.",\n        "sceneContent": "Her quiet act of defiance sparked the Montgomery Bus Boycott, a pivotal moment in the Civil Rights Movement."\n    },\n    {\n        "imagePrompt": "A wide shot of a line of buses sitting idle on the streets of Montgomery. Pedestrians, mostly Black, are walking alongside the buses, their faces showing a mix of determination and hope. The boycott is in full swing. The scene is evocative of the 1950s, capturing the atmosphere of the time. Warm, slightly desaturated colors.",\n        "sceneContent": "The Montgomery Bus Boycott, a pivotal moment in the Civil Rights Movement."\n    },\n    {\n        "imagePrompt": "A symbolic image: a single lit candle burning brightly in the darkness. The flame flickers, representing hope and resilience. Around the candle, faint silhouettes of people marching can be seen, representing the lasting impact of Rosa Parks\' actions. High contrast, dramatic lighting.",\n        "sceneContent": "One person’s bravery can inspire lasting change for everyone."\n    }\n]\n```\n',
        },
      ],
    },
  ],
});
