const createControllers = (services) => {
  const getItems = async (req, res) => {
    try{
      const data = await services.getItems();

      res.json(data);
    }catch(err){
      res.status(500).json({error: err.message})
    }
  }

  const getKeywords = async (req, res) => {
    try{
      const {itemId} = req.params;
      const data = await services.getKeywords(itemId);

      res.json(data);
    }catch(err){
      res.status(500).json({error: err.message})
    }
  }

  const getMetrics = async (req, res) => {
    try{
      const {itemId} = req.params;
      const {startDate, endDate} = req.query;
      const data = await services.getMetrics(itemId, startDate, endDate);
      
      res.json(data);
    }catch(err){
      res.status(500).json({error: err.message});
    }
  }

  return {
    getItems,
    getKeywords,
    getMetrics
  }
}

export default createControllers;