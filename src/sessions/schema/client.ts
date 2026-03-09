import mongoose, { Schema } from "mongoose";


export const clientSchema = new Schema({
    visitorId: { type: mongoose.Schema.Types.ObjectId }
});
