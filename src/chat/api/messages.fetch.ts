export async function fetchMessages({ user, channel, limit }) {
    try {
        const result = await this.models.member.aggregate([]);

        return result;
    } catch (error) {
        throw new Error(error);
    }
}
