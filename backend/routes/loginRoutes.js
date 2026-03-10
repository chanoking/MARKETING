import express from 'express';

export default (controllers) => {
    const router = express.Router();

    router.post("/passkey", controllers.loginWithPasskey)

    return router;
}