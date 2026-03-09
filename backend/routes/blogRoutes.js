import express from "express"

export default (controllers) => {
    const router = express.Router();

    router.get("/items", controllers.getItems);
    router.get("/keywords", controllers.getKeywords);
    router.get("/keyword-state", controllers.getKeywordStates);
    router.post("/upload-excel", controllers.upload);
    router.post("/keyword-state-update", controllers.keywordStateUpdate);

    return router;
}