import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder = "courses") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1280, height: 720, crop: "fill", gravity: "auto" },
          { quality: "auto:best", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      },
    );
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return null;
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    // result.result === "ok" → deleted successfully
    // result.result === "not found" → already gone from Cloudinary
    return result;
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
    return null;
  }
};

export default cloudinary;
