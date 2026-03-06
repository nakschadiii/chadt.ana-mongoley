export async function getRelations({ user }) {
    try {
        const result = await this.models.relations.aggregate([
            {
                $match: {
                    $or: [
                        { userA: user },
                        { userB: user }
                    ]
                }
            },
            {
                $project: {
                    target: {
                        $cond: [
                            { $eq: ['$userA', user] },
                            '$userB',
                            '$userA'
                        ]
                    },
                    fromSelf: {
                        $cond: [
                            { $eq: ['$userA', user] },
                            '$fromA',
                            '$fromB'
                        ]
                    },
                    toSelf: {
                        $cond: [
                            { $eq: ['$userA', user] },
                            '$fromB',
                            '$fromA'
                        ]
                    }
                }
            }
        ]);

        return { success: true, data: result };

    } catch (error) {
        return { success: false, error: error.message };
    }
}