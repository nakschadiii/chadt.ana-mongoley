import { Schema } from "mongoose";

export const activitySchema = new Schema({
    type: { type: String, required: true },
    channel: { type: String, required: true },
    user: { type: String, required: true },
    active: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now }
});
