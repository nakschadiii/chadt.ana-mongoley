export async function setMessage({ user, channel, content, id, parent, type, active }) {
    try {
        //type = message | reaction
        const result = await this.models.message.findOneAndUpdate(
            { _id: id },
            { user, channel, content, parent, type, active },
            { returnDocument: true, upsert: true }
        );

        return {
            success: true,
            data: result
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
