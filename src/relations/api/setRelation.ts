import { normalizePair } from "../helpers/normalizePair";

export async function setRelation({ source, target, status }) {
    try {
        console.log(this);
        const [userA, userB] = normalizePair(source, target);

        const isSourceA = source === userA;

        const updateField = isSourceA ? 'fromA' : 'fromB';

        await this.models.relations.findOneAndUpdate(
            { userA, userB },
            { $set: { [updateField]: status } },
            { upsert: true, returnDocument: "after" }
        );

        const event = {
            from: isSourceA ? userA : userB,
            to: isSourceA ? userB : userA,
            status
        }

        return { success: true, data: event };

    } catch (error) {
        return { success: false, error: error.message };
    }
}