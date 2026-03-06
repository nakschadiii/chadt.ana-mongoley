import { getAlias } from "./getAlias";

export async function getProfile({ id, user }) {
    const result = await this.models.profile.aggregate([
        { $match: { _id: id } },
        this.withAliases ? getAlias(user) : {
            $addFields: { alias: [] }
        },
        {
            $project: {
                _id: 1,
                displayname: {
                    $ifNull: [
                        { $arrayElemAt: ["$alias.alias", 0] },
                        "$displayname"
                    ]
                },
                username: 1,
                avatar: 1
            }
        }
    ]);

    console.log(id, user, result, this.withAliases);

    return result[0];
}
