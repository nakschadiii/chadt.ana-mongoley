export function lookupMembersIDs({ user }) {
    return [
        {
            $lookup: {
                from: "members",
                localField: "id",
                foreignField: "channel",
                as: "members",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $ne: ["$user", user]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                members: {
                    $map: {
                        input: "$members",
                        as: "member",
                        in: "$$member.user"
                    }
                }
            }
        }
    ];
}
