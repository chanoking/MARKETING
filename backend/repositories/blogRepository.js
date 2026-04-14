const createRepositories = (db) => {
    const findAll = async (collection, find) => {
        return await db.collection(collection).find(find).toArray();
    }

    return {
        findAll
    }
}

export default createRepositories;