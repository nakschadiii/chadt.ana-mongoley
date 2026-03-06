const groupMessagesByType = (userId) => ({
    $lookup: {
        from: "messages",
        let: { channelId: "$_id" },
        pipeline: [
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
            {
                $match: {
                    $expr: {
                        $gt: ["$createdAt", { $ifNull: ["$memberData.lastReadMessage", new Date(0)] }]
                    }
                }
            },
            { $unwind: { path: "$content", preserveNullAndEmptyArrays: true } },
            { $project: { type: "$content.type", user: 1, mentions: "$content.mentions" } }
        ],
        as: "messageEvents"
    }
});

const groupActivitiesByType = () => ({
    $lookup: {
        from: "activities",
        let: { channelId: "$_id" },
        pipeline: [
            {
                $match: {
                    $expr: { $and: [{ $eq: ["$channel", "$$channelId"] }, { $eq: ["$active", true] }] }
                }
            },
            { $project: { type: 1, user: 1, timestamp: "$createdAt" } }
        ],
        as: "activityEvents"
    }
});

const extractMentions = () => ({
    $addFields: {
        mentions: {
            $reduce: {
                input: "$messageEvents",
                initialValue: [],
                in: { $setUnion: ["$$value", { $ifNull: ["$$this.mentions", []] }] }
            }
        }
    }
});

const computeLastEventTimestamp = () => ({
    $addFields: {
        lastMessageTimestamp: { $max: "$messageEvents.timestamp" },
        lastActivityTimestamp: { $max: "$activityEvents.timestamp" }
    }
});

const mergeLastEventTimestamp = () => ({
    $addFields: {
        timestamp: {
            $cond: [
                { $gt: ["$lastMessageTimestamp", "$lastActivityTimestamp"] },
                "$lastMessageTimestamp",
                "$lastActivityTimestamp"
            ]
        }
    }
});

const arrayToObjectWithNullFallback = (fieldName, outputName) => ({
    $addFields: {
        [outputName]: {
            $arrayToObject: {
                $map: {
                    input: {
                        $filter: {
                            input: { $objectToArray: `$${fieldName}` },
                            as: "item",
                            cond: { $gt: [{ $size: "$$item.v" }, 0] } // ne garder que les arrays non vides
                        }
                    },
                    as: "item",
                    in: { k: "$$item.k", v: "$$item.v" }
                }
            }
        }
    }
});

export function pipelineEvents({ user }) {
    const pipeline = [
        groupMessagesByType(user),
        groupActivitiesByType(),
        extractMentions(),
        computeLastEventTimestamp(),
        mergeLastEventTimestamp(),
        arrayToObjectWithNullFallback("messageTypes", "messages"),
        arrayToObjectWithNullFallback("activityTypes", "activities")
    ];

    return pipeline;
}

/*

{
    "timestamp": "2026-03-04T12:23:54.229Z",
    "messages": {
      "text": ["user1","user2"],
      "image": ["user3"],
      "video": null,
      "sticker": ["user1"],
      "poll": null
    },
    "activities": {
      "call": ["user2"],
      "typing": null,
      "recording": null,
      "reaction": ["user3"]
    },
    "mentions": ["user2"],
    "pinned": null,
    "lastActiveMember": "user123"
  }
  
  */