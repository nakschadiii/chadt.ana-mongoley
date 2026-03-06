export async function markMessagesAsRead(user, channel, message) {
    await this.models.member.updateOne(
        { user, channel },
        { $set: { lastReadMessage: message } }
    );
}
