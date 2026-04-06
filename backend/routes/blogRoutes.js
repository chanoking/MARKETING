import express from "express"

export default (controllers, requireToken) => {
    const router = express.Router();

    router.get("/items", requireToken, controllers.getItems);
    router.get("/keywords", requireToken, controllers.getKeywords);
    router.get("/keyword-state", requireToken, controllers.getKeywordStates);
    router.post("/upload-excel", requireToken, controllers.upload);
    router.post("/keyword-state-update", requireToken, controllers.keywordStateUpdate);

    return router;
}