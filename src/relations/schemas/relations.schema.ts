import { Schema } from 'mongoose';

export const relationsSchema = new Schema(
    {
        userA: { type: String, required: true },
        userB: { type: String, required: true },

        fromA: { type: String, default: null }, // statut de A vers B
        fromB: { type: String, default: null }, // statut de B vers A
    },
    { timestamps: true }
);

relationsSchema.index(
    { userA: 1, userB: 1 },
    { unique: true }
);