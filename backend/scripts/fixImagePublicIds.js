// scripts/fixImagePublicIds.js
// Run once: node --experimental-vm-modules scripts/fixImagePublicIds.js

import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const courses = await Course.find({
  image: { $exists: true, $ne: "" },
  $or: [{ imagePublicId: "" }, { imagePublicId: { $exists: false } }],
});

console.log(`Found ${courses.length} courses missing imagePublicId`);

for (const course of courses) {
  const match = course.image?.match(
    /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i,
  );
  if (match?.[1]) {
    course.imagePublicId = match[1];
    await course.save();
    console.log(`✅ Fixed: "${course.name}" → ${course.imagePublicId}`);
  } else {
    console.log(`⚠️ Skipped: "${course.name}" — URL parse failed`);
  }
}

console.log("Migration complete!");
await mongoose.disconnect();
