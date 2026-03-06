import { pipelineEvents } from "./pipelineEvents";

export const generateEventsPipeline = ({ user }) => [
    // 1️⃣ Lookup activités actives
    {
        $lookup: {
            from: "activities",
            let: { channelId: "$id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$channel", "$$channelId"] },
                                { $eq: ["$user", user] },
                                { $eq: ["$active", true] }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        type: { $literal: "activity" },
                        subtype: "$type",
                        sources: ["$user", "$channel"],
                        timestamp: "$createdAt",
                        _id: 0
                    }
                }
            ],
            as: "activityEvents"
        }
    },

    // 2️⃣ Lookup messages non lus
    ...pipelineEvents(user),

    // 3️⃣ Channel creation event
    {
        $addFields: {
            creationEvent: {
                type: "channel",
                subtype: "created",
                sources: ["$createdBy"],
                timestamp: "$createdAt"
            }
        }
    },

    // 4️⃣ Fallback dernier membre si conditions
    {
        $lookup: {
            from: "members",
            let: { channelId: "$id" },
            pipeline: [
                { $match: { $expr: { $eq: ["$channel", "$$channelId"] }, active: true } },
                { $sort: { createdAt: -1 } },
                { $limit: 1 },
                { $project: { user: 1, createdAt: 1, _id: 0 } }
            ],
            as: "lastMember"
        }
    },
    {
        $addFields: {
            lastMemberEvent: {
                $cond: [
                    {
                        $and: [
                            { $gt: [{ $size: "$lastMember" }, 0] },
                            { $gt: ["$memberCount", 2] },
                            { $eq: [{ $size: "$activityEvents" }, 0] },
                            { $eq: [{ $size: "$messageEvents" }, 0] }
                        ]
                    },
                    {
                        type: "member",
                        subtype: "lastJoined",
                        sources: [{ $arrayElemAt: ["$lastMember.user", 0] }],
                        timestamp: { $arrayElemAt: ["$lastMember.createdAt", 0] }
                    },
                    "$$REMOVE"
                ]
            }
        }
    },

    // 5️⃣ Concat tous les events
    {
        $addFields: {
            events: {
                $concatArrays: [
                    { $ifNull: ["$activityEvents", []] },
                    { $ifNull: ["$messageEvents", []] },
                    { $cond: [{ $ifNull: ["$creationEvent", false] }, ["$creationEvent"], []] },
                    { $cond: [{ $ifNull: ["$lastMemberEvent", false] }, ["$lastMemberEvent"], []] }
                ]
            }
        }
    },

    // 6️⃣ Cleanup
    { $project: { activityEvents: 0, messageEvents: 0, creationEvent: 0, lastMember: 0, lastMemberEvent: 0 } }
];