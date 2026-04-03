import express from "express";

export default (controllers, requireToken) => {
    const router = express.Router();

    router.get("/free", requireToken, controllers.getExpenseReportForFree);
    router.get("/keychal", requireToken, controllers.getExpenseReportForKeychal);

    router.get("/free/monthly-cost-by-item", requireToken, controllers.getMonthlyCostByItemForFree);
    router.get("/sponsor/monthly-cost-by-item", requireToken, controllers.getMonthlyCostByItemForSponsor);
    router.get("/keychal/monthly-cost-by-item", requireToken, controllers.getMonthlyCostByItemForKeychal);

    return router;
}