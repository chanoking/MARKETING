import express from 'express';

export default (controllers, requireToken) => {
    const router = express.Router();

    router.post("/passkey", controllers.loginWithPasskey)
    router.post("/login", controllers.login);
    router.post("/signup", controllers.signup);

    return router;
}