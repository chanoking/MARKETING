import express from "express";

export default (controllers, requireToken) => {
    const router = express.Router();

    router.get("/free-monthly-cost-by-item", requireToken, controllers.getFreeMonthlyCostByItem);
    router.get("/monthly-cost-sponsor", requireToken, controllers.getMonthlyCostForSponsor);

    return router;
}