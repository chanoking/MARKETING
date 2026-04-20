import {ObjectId} from "mongodb";

const createServices = (repositories) => {
    const getItems = async () => {
        return await repositories.findAll("Blog_Items", {});
    }

    const getKeywords = async (itemId) => {
        return await repositories.findAll("Blog_Keywords", {itemId: new ObjectId(itemId) });
    }

    const getMetrics = async (itemId, startDate, endDate, option) => {
        const data = await repositories.findKeywordMetrics(
            new ObjectId(itemId),
            new Date(startDate),
            new Date(endDate)
        );

        const map = new Map();

        data.forEach((item) => {
            const dateKey =
            item.date instanceof Date
                ? item.date.toISOString().slice(0, 10)
                : String(item.date).slice(0, 10);

            if (!map.has(item.keyword)) {
            map.set(item.keyword, new Map());
            }

            const keywordMap = map.get(item.keyword);

            if (!keywordMap.has(dateKey)) {
            keywordMap.set(dateKey, {
                cnt: item.cnt,
                volume: item.mobile,
                env: item.env
            });
            }
        });

        return Array.from(map.entries()).map(([keyword, dateMap]) => ({
            keyword,
            values: Object.fromEntries(dateMap),
        }));
    };

    return {
        getItems,
        getKeywords,
        getMetrics
    }
}

export default createServices;