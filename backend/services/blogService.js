import {ObjectId} from "mongodb";

const createServices = (repositories) => {
    const getItems = async () => {
        return await repositories.findAll("Blog_Items", {});
    }

    const getKeywords = async (itemId) => {
        return await repositories.findAll("Blog_Keywords", {itemId: new ObjectId(itemId) })
    }
    return {
        getItems,
        getKeywords
    }
}

export default createServices;