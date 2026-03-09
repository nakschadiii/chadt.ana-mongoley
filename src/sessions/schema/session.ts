import mongoose, { Schema } from "mongoose";


export const sessionSchema = new Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    active: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lang: { type: String, required: true, default: "fr-FR" },
    createdAt: { type: Date, default: Date.now }
});
