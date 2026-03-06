import { Schema } from "mongoose";

export const aliasSchema = new Schema({
    source: { type: String, required: true },
    target: { type: String, required: true },
    alias: { type: String, required: true }
});
