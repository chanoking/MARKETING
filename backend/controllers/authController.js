import { ObjectId } from 'mongodb';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createControllers = (db) => {
    const saltRounds = 10;
    
    const loginWithPasskey = async (req, res) => {
        try{
            const {passkey} = req.body;
    
            if (!passkey) res.status(400).json({message: "key 필요!"});
    
            const data = await db.collection("Keychal_Influencers").findOne({passkey});

            if(!data) return res.status(401).json({message: "정보가 일치하지 않습니다."});

            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    const signup = async (req, res) => {
        try{
            const {id, password, manageCode} = req.body;

            if (!id || !password || !manageCode) {
                return res.status(400).json({message: "Required all elements!"})
            }

            const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8}$/;

            if(!regex.test(password)) return res.status(400).json({message: "조건이 충족되지 않았습니다."})

            const user = await db.collection("Info").findOne({id});

            if(user) return res.status(409).json({message: "This ID is already in use."});
            
            
            const mngCode = process.env.MANAGECODE || "";
            

            if(manageCode !== mngCode) {
                return res.status(409).json({message: "The manageCode is not correct!"})
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await db.collection("Info").insertOne({
                id, hashedPassword
            })

            res.status(200).json({message: "회원가입 되었습니다."})
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }
    const login = async (req, res) => {
        try{
            const {id, password} = req.body;
            const user = await db.collection("Info").findOne({id});
            
            if(!user?.id) return res.status(404).json({message: "해당 정보를 찾을 수 없습니다!"});
            
            const match = await bcrypt.compare(password, user?.hashedPassword);

            if (!match) return res.status(401).json({message: "비밀번호가 일치하지 않습니다."});

            const token = jwt.sign(
                {id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "5h"}

            )

            res.status(200).json({
                message: "Log in 성공!",
                token,
                id: user.id
            })

        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    return {
        loginWithPasskey,
        signup,
        login
    }
}

export default createControllers;