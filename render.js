// lamda.js

import dotenv from "dotenv";
dotenv.config();
import { audioUrl, captionJson, images } from "./data.js";
import ora from "ora";
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";

const region = process.env.REGION;
const serveUrl = process.env.SERVER_URL;

const render_video = async () => {
  // Start spinner
  const spinner = ora("Starting render...").start();

  try {
    const functions = await getFunctions({ region, compatibleOnly: true });

    if (functions.length === 0) {
      throw new Error("No compatible functions found in Lambda.");
    }

    const functionName = functions[0].functionName;

    const { renderId, bucketName } = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: "test",
      inputProps: {
        videoData: {
          audioUrl,
          images,
          captionJson,
        },
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 1,
      framesPerLambda: 20,
      privacy: "public",
    });

    spinner.text = "Render started. Polling progress...";

    // Polling the render progress
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const progress = await getRenderProgress({
        renderId,
        bucketName,
        functionName,
        region,
      });

      if (progress.done) {
        spinner.succeed("Render finished! 🎉");
        console.log("Output File:", progress.outputFile);
        return progress.outputFile;
        process.exit(0);
      }

      if (progress.fatalErrorEncountered) {
        spinner.fail("Error encountered during rendering ❌");
        console.error(progress.errors);
        process.exit(1);
      }

      if (progress.overallProgress !== null) {
        spinner.text = `Rendering... ${(progress.overallProgress * 100).toFixed(
          2
        )}% complete`;
      }
    }
  } catch (err) {
    spinner.fail("An error occurred");
    console.error(err);
    process.exit(1);
    return false;
  }
};

await render_video();

export default render_video;
