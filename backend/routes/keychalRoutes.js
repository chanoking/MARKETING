// routes/keychalRoutes.js
import express from "express";

// controllers 객체를 인자로 받아 라우터 생성
export default (controllers) => {
  const router = express.Router();

  // ==========================
  // Keychal 관련 API
  // ==========================

  router.get("/influencers", controllers.getInfluencers);
  router.get("/keywords", controllers.getKeywords);
  router.get("/keyword/states", controllers.getKeywordStates);
  router.get("/states/cal", controllers.countVisibleKeywords);
  router.get("/statesall", controllers.getAllStates);
  router.get("/influencer", controllers.getInflKeywordStates)
  router.post("/keyword_state_update", controllers.updateKeywordStates);

  return router;
};