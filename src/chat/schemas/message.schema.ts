import { Schema } from "mongoose";

export const messageSchema = new Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    channel: { type: String, required: true, index: true },
    user: { type: String, required: true, index: true },
    content: [
        {
            type: { type: String, required: true },
            value: { type: Object, required: true },
        }
    ],
    parent: { type: String, default: null },
    type: { type: String, required: true, default: 'message', enum: ['message', 'reaction'] },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
