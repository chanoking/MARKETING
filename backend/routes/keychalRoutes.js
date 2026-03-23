// routes/keychalRoutes.js
import express from "express";

// controllers 객체를 인자로 받아 라우터 생성
export default (controllers, requireToken) => {
  const router = express.Router();

  // ==========================
  // Keychal 관련 API
  // ==========================

  router.get("/influencers", requireToken, controllers.getInfluencers);
  router.get("/keywords", controllers.getKeywords);
  router.get("/keyword/states", requireToken, controllers.getKeywordStates);
  router.get("/states/cal", requireToken, controllers.countVisibleKeywords);
  router.get("/statesall", requireToken, controllers.getAllStates);
  router.get("/influencer", controllers.getInflKeywordStates);
  router.get("/infl/keyword", controllers.getInflTheKeywordStates);
  router.get("/inflTotalValue", controllers.getTotalValueForInflByMonth);
  router.get("/summary", requireToken, controllers.getSummary);
  router.get("/keywordInfo", requireToken, controllers.getInfoForKeyword);
  router.get("/inflKeywords", controllers.getKeywordsByInfl);
  router.get("/confirm", controllers.checkConfirm);
  router.post("/doConfirm", controllers.confirm);
  router.post("/keyword_state_update", requireToken, controllers.updateKeywordStates);

  return router;
};