import jwt from "jsonwebtoken";

export const requireToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) return res.status(401).json({ message: "로그인이 필요합니다."});

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(401).json({message: "유효하지 않은 토큰입니다."});
        req.user = decoded;
        next();
    });
};

