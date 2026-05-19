<div align="center">

# Auto AI Shorts – Backend

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Inngest](https://img.shields.io/badge/Inngest-Event--Driven-blue?style=for-the-badge)](https://www.inngest.com/)
[![Remotion](https://img.shields.io/badge/Remotion-Lambda-FF3B00?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://www.remotion.dev/)

Backend service for **Auto AI Shorts** – an automated AI-powered pipeline that turns a short text prompt into a rendered, captioned video, ready to share.

</div>

---

### App Demo

| App Demo | Demo Video |
|:---:|:---:|
| [![View on LinkedIn](https://img.shields.io/badge/View%20on-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/update/urn:li:activity:7323445647888543745/) | See below ↓ |

<div align="center">

**Demo Video**

<video src="https://gjgngvgeodcchvlqdbui.supabase.co/storage/v1/object/public/pixlai-assets/WhatsApp%20Video%202026-05-19%20at%208.45.48%20PM.mp4" controls width="600">
  <a href="https://gjgngvgeodcchvlqdbui.supabase.co/storage/v1/object/public/pixlai-assets/WhatsApp%20Video%202026-05-19%20at%208.45.48%20PM.mp4">Watch the demo video</a>
</video>

</div>

---

### Project Overview

**Auto AI Shorts Backend** is a production-style Node.js/Express API that orchestrates an end‑to‑end AI video generation workflow:

- Accepts a user prompt and metadata (voice, style).
- Generates a story script using Gemini.
- Produces AI voice-over audio (ElevenLabs).
- Generates scene-wise images using Replicate.
- Transcribes audio for captions via AssemblyAI.
- Renders the final short-form video using Remotion Lambda.
- Persists user and video data in MongoDB and manages usage credits.
- Built as a production-style portfolio project demonstrating async AI orchestration across 5+ third-party services.

The backend is built to be **event-driven** using **Inngest**, making the long‑running, multi-step video pipeline reliable, observable, and resumable.

---

### Features

- **JWT-based authentication**
  - Sign up / login, `Bearer` token auth middleware, current user profile.
- **Credit-based usage system**
  - Users have a `credits` balance; video generation consumes credits, admin/checkout can grant credits by product tier.
- **End-to-end AI video generation**
  - Gemini for script + image prompts, ElevenLabs for voice, Replicate for image generation, AssemblyAI for captions, Remotion Lambda for final video render.
- **Event-driven pipeline with Inngest**
  - Multi-step function (`GenerateVideoData`) broken into clear, fault‑tolerant steps (audio, captions, image prompts, image renders, DB persistence, final render).
- **Real-time error monitoring**
  - Discord integration to send stack traces to a dedicated channel.
- **Push notifications**
  - Expo push notifications to notify the user when the video render has completed.
- **Typed data models**
  - Mongoose schemas for `User` and `Video` with timestamps and ownership relationships.

---

### Tech Stack

- **Runtime & Framework**
  - Node.js, Express 5, ES modules
- **Data & Persistence**
  - MongoDB with Mongoose
  - (Optional) PostgreSQL via `pg` and Prisma (scripts present, not core to the primary flow)
- **AI & Media**
  - Google Gemini (`@google/generative-ai`) – script + image-prompt generation
  - AssemblyAI – audio transcription for captions
  - ElevenLabs – text-to-speech voice synthesis
  - Replicate – image generation (`black-forest-labs/flux-schnell`)
  - Remotion Lambda – serverless video rendering
  - Supabase Storage – hosting generated audio and images
- **Orchestration & Background Jobs**
  - Inngest – event-driven function orchestration (`generate-video-data`)
- **Auth & Security**
  - JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), CORS, cookies
- **Developer Experience & Monitoring**
  - Discord bot for error alerts
  - Expo push notifications for user devices
  - Nodemon for local development

---

### Architecture

At a high level, the backend is organized into:

- **HTTP API Layer** – Express routes under `/api/**`:
  - `routes/api.js` registers feature routers (`/auth`, `/videos`, `/credits`).
- **Domain Controllers**
  - `controllers/auth.controller.js` – user auth & profile.
  - `controllers/video.controller.js` – video listing, details, and video generation trigger.
  - `controllers/credits.controller.js` – grant credits based on product tiers.
- **Middleware**
  - `middleware/auth.js` – validates JWT, resolves current user, and injects `credits` into JSON responses.
- **Background / Orchestration**
  - `inngest/index.js` – Defines the `Inngest` client and the `GenerateVideoData` step function.
  - `render.js` – Wraps Remotion Lambda client to render the final video.
- **Config**
  - `config/db.js` – MongoDB connection.
  - `config/geminiConfig.js` – Gemini client and chat configurations.
  - `config/pgConfig.js` – PostgreSQL pool (optional/auxiliary).
  - `config/discordConfig.js` – Discord bot for error reporting.
- **Utilities & Models**
  - `utils/getScript.js` – prompt → story script via Gemini.
  - `utils/generateImageScript.js` – script → JSON image prompt spec via Gemini.
  - `utils/UploadAudio.js` – upload buffers (audio/images) to Supabase storage.
  - `utils/notification.js` – Expo push notifications.
  - `schema/UserSchema.js` – user model (auth, credits, push token).
  - `schema/videoSchema.js` – video model (prompt, script, assets, status, links).

The entrypoint `index.js` wires everything together: loads env, connects to MongoDB, mounts the Inngest handler, registers API routes, and starts the HTTP server.

---

### API Endpoints

Base URL: `https://<your-domain>` (or `http://localhost:<PORT>` in development)

All authenticated routes expect a header:

```http
Authorization: Bearer <JWT_TOKEN>
```

#### Health

- **GET** `/`
  - Returns a simple `"API is running..."` message.

#### Auth (`/api/auth`)

- **POST** `/api/auth/signup`
  - **Body**: `{ name, email, password, phoneNumber }`
  - **Description**: Register a new user and return a JWT plus user object.

- **POST** `/api/auth/signin`
  - **Body**: `{ email, password }`
  - **Description**: Login existing user, returns a JWT and user object.

- **GET** `/api/auth/me`
  - **Auth**: Required.
  - **Description**: Returns the authenticated user. The auth middleware also injects a `credits` field into JSON responses.

- **POST** `/api/auth/update-push-token`
  - **Auth**: Required.
  - **Body**: `{ token }` (Expo push token)
  - **Description**: Stores the user’s Expo push token for push notifications.

#### Videos (`/api/videos`)

- **GET** `/api/videos/`
  - **Auth**: Required.
  - **Description**: Returns all videos created by the current user.

- **GET** `/api/videos/get-details/:id`
  - **Auth**: Required.
  - **Params**: `id` – video ID
  - **Description**: Returns details for a single video owned by the user.

- **POST** `/api/videos/gen-video`
  - **Auth**: Required.
  - **Body**: `{ prompt, voice, videoStyle }`
  - **Description**:
    - Validates credits and input fields.
    - Uses Gemini to generate a script.
    - Creates a `Video` document.
    - Sends an Inngest event `generate-video-data` with `{ script, prompt, voice, videoStyle, userId, videoId }`.
    - **Response**: `{ message: "ok", result: <inngestResult>, videoId }`.

#### Credits (`/api/credits`)

- **POST** `/api/credits/`
  - **Auth**: Required.
  - **Body**: `{ productId }` where `productId` ∈ `["credits_5", "credits_10", "credits_25"]`
  - **Description**: Grants the mapped number of credits to the authenticated user and returns the updated user.

---

### Inngest Step Functions – How the Pipeline is Organized

The main Inngest function is defined in `inngest/index.js`:

- **Event**: `generate-video-data`
- **Handler**: `GenerateVideoData`
- **Steps**:
  1. **GenerateAudioFile**
     - Uses ElevenLabs API to synthesize speech from the script.
     - Uploads the resulting audio buffer to Supabase via `UploadAudio`, returning a public URL.
  2. **GenerateCaption**
     - Sends the audio URL to AssemblyAI for transcription.
     - Extracts `words` as caption data.
  3. **GenerateImagePrompt**
     - Calls Gemini chat (`GenerateImageScript`) with a structured prompt to return JSON of image prompts and scene content.
  4. **GenerateImages**
     - For each image prompt, uses `Replicate` (`black-forest-labs/flux-schnell`) to generate an image stream.
     - Converts each stream to a buffer and uploads to Supabase (reusing `UploadAudio` helper), accumulating image URLs.
  5. **saveInDB**
     - Loads the `Video` document by `videoId` and populates:
       - `audioUrl`
       - `captionJson`
       - `images`
     - Saves and returns the updated video.
  6. **renderVideo**
     - Calls `render_video` (Remotion Lambda wrapper) with `{ audioUrl, images, captionJson }`.
     - Updates the video:
       - `videoUrl` (render result)
       - `status = "completed"`
     - Decrements the user’s `credits` by 1 and saves.
     - Triggers an Expo push notification to the user.

All steps are wrapped in `try/catch` blocks and send stack traces to Discord via `sendErrorToDiscord` on failure.

---

### Environment Variables

The project relies on several environment variables. A typical `.env` for local development might include:

```bash
# Core server
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>

# Inngest
INNGEST_EVENT_KEY=<your-inngest-event-key>
INNGEST_SIGNING_KEY=<your-inngest-signing-key>

# AI Providers
GEMINI_API_KEY=<your-gemini-api-key>
ASSEMBLY_AI_API_KEY=<your-assemblyai-api-key>
ELEVEN_LABS=<your-elevenlabs-api-key>
NEBIUS_API_KEY=<your-nebius-openai-compatible-api-key>
REPLICATE_API_TOKEN=<your-replicate-api-token>

# Media & Rendering
REGION=<aws-region-for-remotion-lambda>
SERVER_URL=<remotion-serve-url>

# Supabase (storage for audio/images)
SUPABASE_URL=<your-supabase-url>
SUPABASE_API_KEY=<your-supabase-api-key>
SUPABASE_BUCKET=<your-supabase-bucket-name>

# Discord error reporting
DISCORD_BOT_TOKEN=<your-discord-bot-token>
CHANNEL_ID=<discord-channel-id-for-errors>

# Expo push notifications
EXPO_ACCESS_TOKEN=<optional-expo-access-token-if-used>

```

> **Note**: Do not commit real secrets to version control. Use `.env` locally and your deployment platform’s secret manager in production.

---

### Project Structure

```bash
.
├─ index.js                 # Express entrypoint, Inngest handler mount
├─ package.json
├─ config/
│  ├─ db.js                 # MongoDB connection
│  ├─ pgConfig.js           # PostgreSQL pool (optional)
│  ├─ geminiConfig.js       # Gemini model configuration
│  └─ discordConfig.js      # Discord error reporting client
├─ controllers/
│  ├─ auth.controller.js    # Auth logic (signup, signin, me, push token)
│  ├─ video.controller.js   # Video listing, details, and generation trigger
│  └─ credits.controller.js # Credit granting
├─ routes/
│  ├─ api.js                # Aggregates feature routes under /api
│  ├─ auth.routes.js
│  ├─ video.routes.js
│  └─ credit.routes.js
├─ middleware/
│  └─ auth.js               # JWT auth + credits injection
├─ inngest/
│  └─ index.js              # Inngest client + GenerateVideoData function
├─ utils/
│  ├─ getScript.js          # Gemini-based script generation
│  ├─ generateImageScript.js# Gemini-based image prompt generation
│  ├─ UploadAudio.js        # Supabase storage uploads
│  └─ notification.js       # Expo push notifications
├─ schema/
│  ├─ UserSchema.js         # User model
│  └─ videoSchema.js        # Video model
└─ render.js                # Remotion Lambda rendering helper
```

---

### Setup Instructions

#### 1. Prerequisites

- **Node.js** 20.x (or compatible LTS)
- **MongoDB** instance (Atlas or local)
- Accounts/API keys for:
  - Google Gemini
  - AssemblyAI
  - ElevenLabs
  - Replicate
  - Supabase
  - Discord (bot) – optional but recommended
  - Expo (for push) – optional but recommended
  - AWS (for Remotion Lambda)

#### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

#### 3. Configure environment

- Create a `.env` file in the project root.
- Populate it with the variables described in the **Environment Variables** section.

#### 4. Database & Prisma (optional)

- If you use PostgreSQL/Prisma in your deployment, run:

```bash
npm run generate
npm run deploy
```

Otherwise, the primary flow works with MongoDB only.

#### 5. Run the development server

```bash
npm run dev
# or
npm start
```

The API will be available at `http://localhost:<PORT>` (default `5000`).

---

### How It Works (End-to-End Flow)

1. **User signs up & authenticates**
   - The client calls `/api/auth/signup` or `/api/auth/signin` and stores the returned JWT.
2. **User initiates video generation**
   - The client sends `POST /api/videos/gen-video` with `prompt`, `voice`, and `videoStyle`, including the `Authorization: Bearer <token>` header.
   - The server verifies credits and inputs, generates a script using Gemini, creates a `Video` document, and emits an Inngest event `generate-video-data`.
3. **Inngest pipeline runs in the background**
   - The `GenerateVideoData` function runs through its steps:
     - Text-to-speech (ElevenLabs) → audio upload (Supabase)
     - Transcription (AssemblyAI) → caption JSON
     - Image prompts (Gemini) → image generation (Replicate) → image upload (Supabase)
     - Video document enriched with `audioUrl`, `images`, `captionJson`
     - Final video render via Remotion Lambda → `videoUrl`, `status = "completed"`, decrement `credits`
     - Optional push notification via Expo to the user’s device.
4. **User checks status & downloads**
   - The client can poll `/api/videos/get-details/:id` to check the video status and retrieve `videoUrl`, captions, and related metadata.

This backend is designed to showcase a **portfolio-ready**, modern, event-driven AI pipeline that integrates multiple third-party AI services into a cohesive, production-style architecture.
