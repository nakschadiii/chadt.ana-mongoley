export function actionsPipeline() {
    const ADMIN_ROLES = ["owner", "moderator"];

    return [
        {
            $lookup: {
                from: "members",
                let: { channelId: "$id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$channel", "$$channelId"] }, active: true } },
                    { $count: "count" }
                ],
                as: "memberStats"
            }
        },
        {
            $addFields: {
                memberCount: { $ifNull: [{ $arrayElemAt: ["$memberStats.count", 0] }, 0] }
            }
        },

        // 2️⃣ Build actions/permissions
        {
            $addFields: {
                actions: {
                    edit: {
                        $cond: [
                            {
                                $and: [
                                    { $in: ["$status", ADMIN_ROLES] },
                                    { $eq: ["$type", "private"] },
                                    { $eq: ["$memberCount", 2] }
                                ]
                            },
                            "renameUser",
                            {
                                $cond: [
                                    { $in: ["$status", ADMIN_ROLES] },
                                    "renameGroup",
                                    null
                                ]
                            }
                        ]
                    },
                    delete: {
                        $cond: [
                            { $eq: ["$status", "owner"] },
                            true,
                            false
                        ]
                    },
                    invite: {
                        $cond: [
                            { $in: ["$status", ADMIN_ROLES] },
                            true,
                            false
                        ]
                    },
                    leave: {
                        $cond: [
                            { $ne: ["$status", "owner"] },
                            true,
                            false
                        ]
                    },
                    kick: {
                        $cond: [
                            {
                                $and: [
                                    { $in: ["$status", ADMIN_ROLES] },
                                    { $gt: ["$memberCount", 2] }
                                ]
                            },
                            true,
                            false
                        ]
                    },
                    pin: {
                        $cond: [
                            { $in: ["$status", ADMIN_ROLES] },
                            true,
                            false
                        ]
                    },
                    send: true
                }
            }
        },

        // cleanup
        { $project: { memberStats: 0, memberCount: 0 } }
    ];
}
