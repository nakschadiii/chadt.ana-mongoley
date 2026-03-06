export async function setChannel({ user, channel, type = 'private', active = true, payload = {} }) {
    try {
        const filter = channel
            ? { _id: channel }
            : { _id: crypto.randomUUID() };

        const result = await this.models.channel.findOneAndUpdate(
            filter,
            {
                $set: { ...payload, type, active },
                //$setOnInsert: { createdBy: user, active: true }
            },
            { returnDocument: "after", upsert: true }
        );

        console.log(result);

        if (!channel) await this.models.member.create({
            channel: result._id,
            user,
            status: 'owner'
        });

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
