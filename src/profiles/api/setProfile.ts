export async function setProfile({ data, user }) {
    return await this.models.profile.findOneAndUpdate(
        { _id: user },
        data,
        { returnDocument: true, upsert: true }
    );
}
