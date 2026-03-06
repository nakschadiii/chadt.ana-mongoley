export async function setActivity({ user, channel, type, active }) {
    try {
        const result = await this.models.activity.findOneAndUpdate(
            { user, channel },
            { type, active },
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
