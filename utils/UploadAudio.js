import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const UploadAudio = async (buffer) => {
  try {
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET) // 'audio-bucket' is your Supabase storage bucket name
      .upload(`/public/${Date.now()}.mp3`, buffer, {
        cacheControl: "3600",
        upsert: false, // Set to true if you want to overwrite existing files with the same name
      });
    if (error) console.log(error);
    console.log(data);
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
    console.log(imageUrl);
    return imageUrl;
  } catch (error) {
    console.log("ERROR UPLOADING ON SUPERBASE");
  }
};
export default UploadAudio;
