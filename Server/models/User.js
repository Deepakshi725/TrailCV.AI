import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema({
  resume: {
    text: String,
    fileUrl: String,
    fileType: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  jobDescription: {
    text: String,
    fileUrl: String,
    fileType: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  matchScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true }, // Unique and required
    phoneNum: { type: Number, required: true }, // Not unique
    password: { type: String, required: true },
    analyses: [AnalysisSchema]
  },
  { versionKey: false }
);

const Users = mongoose.model("User", UserSchema);
export { Users };

