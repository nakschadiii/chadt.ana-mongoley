export async function setMember({ channel, user, members, payload = {} }) {
    //setLastMessageSeen
    //answerInvite
    try {
        const result = await Promise.all(
            members.map(async (member) => {
                if (user !== member) {
                    const { status } = await this.models.member.findOne({ channel, member: user });

                    if (status !== 'owner') {
                        return {
                            success: false,
                            error: "You are not the owner of this channel"
                        };
                    }
                }

                return await this.models.member.findOneAndUpdate(
                    { channel, member },
                    { ...payload },
                    { returnDocument: true, upsert: true }
                );
            })
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
