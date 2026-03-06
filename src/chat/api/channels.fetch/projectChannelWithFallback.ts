export const projectChannelWithFallback = () => ([
    {
        $lookup: {
            from: "members",
            let: { channelId: "$channelData._id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$channel", "$$channelId"] },
                                { $eq: ["$active", true] }
                            ]
                        }
                    }
                },
                { $sort: { createdAt: 1 } },
                { $limit: 1 },
                { $project: { user: 1, _id: 0 } }
            ],
            as: "oldestMember"
        }
    },
    {
        $unwind: {
            path: "$oldestMember",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $replaceRoot: {
            newRoot: {
                id: "$channelData._id",
                name: "$channelData.name",
                type: "$channelData.type",
                active: "$channelData.active",
                createdBy: {
                    $ifNull: [
                        "$channelData.createdBy",
                        "$oldestMember.user"
                    ]
                },
                createdAt: "$channelData.createdAt",
                membershipId: "$_id",
                status: "$status",
                joinedAt: "$createdAt",
                lastReadMessage: "$lastReadMessage"
            }
        }
    }
]);
