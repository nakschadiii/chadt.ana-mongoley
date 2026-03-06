export const memberWithChannelPipeline = ({ user, limit }) => ([
    {
        $match: {
            user,
            active: true
        }
    },
    {
        $sort: {
            createdAt: -1
        }
    },
    {
        $limit: limit
    },
    {
        $lookup: {
            from: "channels",
            localField: "channel",
            foreignField: "_id",
            as: "channelData",
            pipeline: [
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        type: 1,
                        active: 1
                    }
                }
            ]
        }
    },
    {
        $unwind: "$channelData"
    }
]);
