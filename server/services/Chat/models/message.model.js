import mongoose from "mongoose";

const filesSchema = new mongoose.Schema(
  {
    name: String,
    content: String,
  },
  {
    _id: false,
  },
);

const artifactsSchema = new mongoose.Schema(
  {
    id: Number,
    type: String,
    files: [filesSchema],
  },
  {
    _id: false,
  },
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
    },
    images: [String],
    artifacts: [artifactsSchema],
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
