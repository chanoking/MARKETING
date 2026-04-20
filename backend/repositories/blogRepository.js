const createRepositories = (db) => {
    const findAll = async (collection, find) => {
        return await db.collection(collection).find(find).toArray();
    }

    const findKeywordMetrics = async (itemId, startDate, endDate, option) => {
        const query = {
            date: {
            $gte: startDate,
            $lte: endDate,
            },
            itemId,
        };

        if (option === "노출") {
            query.cnt = { $gt: 0 };
        } else if (option === "미노출") {
            query.cnt = { $lte: 0 };
        }

        return await db.collection("Blog_States").find(query).toArray();
    };

    return {
        findAll,
        findKeywordMetrics
    }
}

export default createRepositories;