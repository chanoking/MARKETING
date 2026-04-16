const createRepositories = (db) => {
    const findAll = async (collection, find) => {
        return await db.collection(collection).find(find).toArray();
    }

    const findKeywordMetrics = async (itemId, startDate, endDate) => {
        return await db.collection("Blog_States").find({
            date:{
                $gte: startDate,
                $lte: endDate
            },
            itemId
        }).toArray();
    }

    return {
        findAll,
        findKeywordMetrics
    }
}

export default createRepositories;