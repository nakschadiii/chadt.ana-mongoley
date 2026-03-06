
export function getAlias(user: any): any {
    return {
        $lookup: {
            from: "aliases",
            as: "alias",
            let: { source: user, target: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$source", "$$source"] },
                                { $eq: ["$target", "$$target"] }
                            ]
                        }
                    }
                }
            ]
        }
    };
}
