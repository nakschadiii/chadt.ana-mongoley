function lookupUnreadMessages(userId: string) {
    return {
        $lookup: {
            from: "messages",
            let: { channelId: "$id" },
            pipeline: [
                // 1️⃣ Récupérer lastReadMessage du membre
                {
                    $lookup: {
                        from: "members",
                        let: { channelId: "$$channelId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$channel", "$$channelId"] },
                                            { $eq: ["$user", userId] },
                                            { $eq: ["$active", true] }
                                        ]
                                    }
                                }
                            },
                            { $project: { lastReadMessage: 1, _id: 0 } }
                        ],
                        as: "memberData"
                    }
                },
                { $unwind: { path: "$memberData", preserveNullAndEmptyArrays: true } },

                // 2️⃣ Filtrer les messages non lus
                {
                    $match: {
                        $expr: {
                            $gt: ["$createdAt", { $ifNull: ["$memberData.lastReadMessage", new Date(0)] }]
                        }
                    }
                },

                // 3️⃣ Group par channel pour fusionner
                {
                    $group: {
                        _id: "$channel",
                        sources: { $addToSet: "$user" },
                        contentTypes: { $push: "$content.type" }, // array de arrays
                        timestamp: { $max: "$createdAt" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        sources: 1,
                        contentTypes: {
                            $reduce: {
                                input: "$contentTypes",
                                initialValue: [],
                                in: { $setUnion: ["$$value", "$$this"] } // fusionne et supprime les doublons
                            }
                        },
                        timestamp: 1
                    }
                },
                // 4️⃣ Projection finale en event unique
                /*{
                    $project: {
                        _id: 0,
                        type: { $literal: "message" },
                        subtype: "unread",
                        sources: 1,
                        contentTypes: {
                            $reduce: {
                                input: "$contentTypes",
                                initialValue: [],
                                in: { $setUnion: ["$$value", "$$this"] }
                            }
                        },
                        timestamp: 1
                    }
                }*/
            ],
            as: "messageEvents"
        }
    };
}
