export function eventsPipeline({ user }) {
    return [
        ...buildLookupMessages(user, ['text', 'image', 'video', 'sticker', 'poll', 'hashtag', "mention"]),
        ...buildLookupActivities(user, ['camera', 'text', 'audio', 'presence']),
        ...buildTimestamp(),
        ...buildMentionned(user),
        ...cleanupFinal()
    ];
}

const buildLookupMessages = (user: string, types: string[]) => [
    // 🔥 Lookup des messages non lus
    {
        $lookup: {
            from: 'messages',
            let: {
                channelId: '$id',
                lastRead: '$lastReadMessage'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$channel', '$$channelId'] },
                                { $eq: ['$active', true] },
                                { $ne: ["$user", user] },

                                // 👇 Filtre des messages après lastReadMessage
                                {
                                    $cond: [
                                        { $ifNull: ['$$lastRead.createdAt', false] },
                                        { $gt: ['$createdAt', '$$lastRead.createdAt'] },
                                        true
                                    ]
                                }
                            ]
                        }
                    }
                }
            ],
            as: 'messages'
        }
    },

    // 🔥 Construction des stats
    {
        $addFields: {
            messageStats: {
                $arrayToObject: {
                    $map: {
                        input: types,
                        as: 'type',
                        in: {
                            k: '$$type',
                            v: {
                                $let: {
                                    vars: {
                                        users: {
                                            $setUnion: [
                                                {
                                                    $map: {
                                                        input: {
                                                            $filter: {
                                                                input: '$messages',
                                                                as: 'm',
                                                                cond: {
                                                                    $in: ['$$type', '$$m.content.type']
                                                                }
                                                            }
                                                        },
                                                        as: 'm',
                                                        in: '$$m.user'
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $eq: [{ $size: '$$users' }, 0] },
                                            undefined,
                                            '$$users'
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
];

const buildLookupActivities = (user: string, types: string[]) => [
    {
        $lookup: {
            from: 'activities',
            let: { channelId: '$id' }, // ⚠️ vérifie que c'est bien $id et pas $_id
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$channel', '$$channelId'] },
                                { $eq: ['$active', true] },
                                { $ne: ["$user", user] }
                            ]
                        }
                    }
                }
            ],
            as: 'activities'
        }
    },
    {
        $addFields: {
            activityStats: {
                $arrayToObject: {
                    $map: {
                        input: types,
                        as: 'type',
                        in: {
                            k: '$$type',
                            v: {
                                $let: {
                                    vars: {
                                        users: {
                                            $setUnion: [
                                                {
                                                    $map: {
                                                        input: {
                                                            $filter: {
                                                                input: '$activities',
                                                                as: 'a',
                                                                cond: { $eq: ['$$a.type', '$$type'] }
                                                            }
                                                        },
                                                        as: 'a',
                                                        in: '$$a.user'
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $eq: [{ $size: '$$users' }, 0] },
                                            undefined,
                                            '$$users'
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
];

const buildTimestamp = () => [
    {
        $addFields: {
            timestamp: {
                $max: [
                    '$createdAt',
                    {
                        $max: '$messages.createdAt'
                    },
                    {
                        $max: {
                            $map: {
                                input: '$activities',
                                as: 'a',
                                in: { $toDate: '$$a._id' }
                            }
                        }
                    }
                ]
            },
        }
    }
];

const buildMentionned = (userId: string) => [
    {
        $addFields: {
            mentionned: {
                $gt: [
                    {
                        $size: {
                            $filter: {
                                input: '$messages',
                                as: 'm',
                                cond: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$$m.content',
                                                    as: 'c',
                                                    cond: {
                                                        $and: [
                                                            { $eq: ['$$c.type', 'mention'] },
                                                            { $eq: ['$$c.value', userId] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    0
                ]
            }
        }
    }
];

const cleanupFinal = () => [
    {
        $addFields: {
            unread: {
                $cond: [
                    {
                        $eq: [
                            {
                                $size: {
                                    $filter: {
                                        input: { $objectToArray: '$messageStats' },
                                        as: 'm',
                                        cond: { $ne: ['$$m.v', undefined] }
                                    }
                                }
                            },
                            0
                        ]
                    },
                    null,
                    '$messageStats'
                ]
            },
            activity: {
                $cond: [
                    {
                        $eq: [
                            {
                                $size: {
                                    $filter: {
                                        input: { $objectToArray: '$activityStats' },
                                        as: 'a',
                                        cond: { $ne: ['$$a.v', undefined] }
                                    }
                                }
                            },
                            0
                        ]
                    },
                    null,
                    '$activityStats'
                ]
            }
        }
    },
    {
        $project: {
            id: 1,
            name: 1,
            type: 1,
            actions: 1,
            timestamp: 1,
            mentionned: 1,
            unread: 1,
            activity: 1,
            members: 1,
            active: 1
        }
    }
];