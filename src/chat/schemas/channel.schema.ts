import { Schema } from "mongoose";

export const channelSchema = new Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true },
    type: { type: String, required: true, default: 'private', enum: ['private'] },
    active: { type: Boolean, required: true, default: true },
    createdBy: { type: String, required: true },
}, {
    timestamps: true,
    _id: false
});