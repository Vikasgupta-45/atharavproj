import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, default: "Untitled session" },
        style: { type: String, default: "clear" },
        preview: { type: String, default: "" },
        input: { type: String, default: "" },
        output: { type: String, default: "" },
        consistency: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
