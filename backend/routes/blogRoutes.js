import express from "express"

export default (controllers, requireToken) => {
    const router = express.Router();

    router.get("/items", requireToken, controllers.getItems);
    router.get("/items/:itemId/keywords", requireToken, controllers.getKeywords);

    return router;
}