const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


//maiddleware
app.use(cors());
app.use(express.json());


//console.log(process.env.DB_PASS)




const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-56gcpdx-shard-00-00.mgbkpcq.mongodb.net:27017,ac-56gcpdx-shard-00-01.mgbkpcq.mongodb.net:27017,ac-56gcpdx-shard-00-02.mgbkpcq.mongodb.net:27017/?ssl=true&replicaSet=atlas-neronq-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
     const productCollection = client.db('giftToy').collection('products');


     const indexKey = {title:1};
     const indexOptions = {name:'titleCategory'};

     const result = await productCollection.createIndex(indexKey,indexOptions);

     app.get('/toySearchByTitle/:text',async (req,res) =>{
      const searchText = req.params.text;

      const result = await productCollection.find({
        title:{$regex:searchText,$options:"i"}
      }).toArray();
      res.send(result);
     })

    app.get('/products',async(req,res) =>{
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    });

    app.post('/products',async(req,res) =>{
      const body = req.body;
      const result= await productCollection.insertOne(body);
      console.log(result);
      res.send(result);
      
      console.log(body);
    });

    app.get('/mytoys/:email',async(req,res) =>{
      console.log(req.params.email);
      const result = await productCollection.find({postedBy:req.params.email}).toArray();
      res.send(result);
    });

    app.delete ('/mytoys/:id',async(req,res) =>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res) =>{
    res.send('gift toy in running')
})

app.listen(port,() =>{
    console.log(`gift toy server is running on port ${port}`)
})