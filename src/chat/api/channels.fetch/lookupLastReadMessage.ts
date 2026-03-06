export function lookupLastReadMessage() {
    return [
        {
            $lookup: {
                from: "messages",
                let: { messageId: "$lastReadMessage" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$messageId"] },
                                    { $eq: ["$active", true] }
                                ]
                            }
                        }
                    },
                ],
                as: "lastReadMessage"
            }
        },
        {
            $unwind: {
                path: "$lastReadMessage",
                preserveNullAndEmptyArrays: true
            }
        }
    ];
}
