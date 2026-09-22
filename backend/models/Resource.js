import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
});

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", resourceSchema);

export default Resource;
