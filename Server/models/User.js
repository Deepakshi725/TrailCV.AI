import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true }, // Unique and required
    phoneNum: { type: Number, required: true }, // Not unique
    password: { type: String, required: true },
  },
  { versionKey: false }
);

const Users = mongoose.model("User", UserSchema);
export { Users };

