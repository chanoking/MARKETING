import { ObjectId } from 'mongodb';

const createControllers = (db) => {
    const loginWithPasskey = async (req, res) => {
        try{
            const {passkey} = req.body;
    
            if (!passkey) res.status(400).json({message: "key 필요!"});
    
            const data = await db.collection("Keychal_Influencers").find({_id: new ObjectId(passkey)}).toArray();
            res.json(data);
        }catch(err){
            res.status(500).json({error: err.message});
        }
    }

    return {loginWithPasskey}
}

export default createControllers;