export async function setAlias({ source, target, alias }) {
    console.log(source, target, alias);
    return await this.models.alias.findOneAndUpdate(
        { source, target },
        { alias },
        { returnDocument: true, upsert: true }
    );
}
