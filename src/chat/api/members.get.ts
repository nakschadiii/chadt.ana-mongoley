export async function getMembers({ channel }) {
    try {
        return await this.models.member.find({ channel });
    } catch (error) {
        throw new Error(error.message);
    }
}
