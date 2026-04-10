// routes/keychalRoutes.js
import express from "express";

// controllers 객체를 인자로 받아 라우터 생성
export default (controllers, requireToken) => {
  const router = express.Router();

  // ==========================
  // Keychal 관련 API
  // ==========================

  router.get("/influencers", requireToken, controllers.getInfluencers);
  router.get("/keywords/:influencer_id", controllers.getKeywords);
  router.get("/states", controllers.getStatesByInfluencer);
  router.get("/all-keywords-grouped-by-rank", requireToken, controllers.getAllKeywordsByRank);
  router.get("/influencer/amount", controllers.getAmountByMonthAndInfluencer);
  router.get("/monthly-finalization", controllers.isMonthlyAmountFinalized);
  router.post("/monthly-finalization", controllers.finalizeMonthlyAmount);
  router.get("/keywords-summary", controllers.getKeywordsSummary);
  router.get("/influencer/keywords-grouped-by-exposure", controllers.getDefinedKeywordsByExposure);
  router.get("/amount-by-month", controllers.getFullAmountByMonth);
  router.get("/summary-by-month", controllers.getSummaryByMonth);
  router.get("/amount-by-month-influencer", controllers.getAmountGroupedByMonthAndInfluencer);

  return router;
};