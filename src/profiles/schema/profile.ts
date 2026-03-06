import { Schema } from "mongoose";

export const profileSchema = new Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    displayname: { type: String, required: true }
});
