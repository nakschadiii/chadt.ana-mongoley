import { Schema } from "mongoose";

export const memberSchema = new Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    channel: { type: String, required: true, index: true },
    user: { type: String, required: true, index: true },
    status: { type: String, required: true, default: 'member', enum: ['owner', 'member'] },
    active: { type: Boolean, required: true, default: true },
    lastReadMessage: { type: String, default: null, ref: 'Message' },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    _id: false
});

memberSchema.index({ user: 1, active: 1 });
memberSchema.index({ channel: 1, createdAt: 1 });
memberSchema.index({ channel: 1, lastReadMessage: 1 }); 