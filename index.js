const express = require("express");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const multer = require("multer");
const app = express();

const cors = require('cors');
//middle wire
app.use(cors());
app.use(express.json());
app.use('/Images', express.static('public/Images'));


const port = process.env.PORT || 5000;


// upload image 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/Images")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({ storage })

app.post("/upload", upload.single('file'), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.send(req.file.filename)

})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rsqtl7q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const bannerCollection = client.db("brandShop").collection('banner');
    const categoryCollection = client.db("brandShop").collection('category');
    const phoneCollection = client.db("brandShop").collection('phones');
    const imageCollection = client.db("brandShop").collection('image');




    // Banner
    app.post("/banner", async (req, res) => {
      const banner = req.body;
      console.log(banner);
      const result = await bannerCollection.insertOne(banner);
      res.send(result);
    })

    app.get("/banner", async (req, res) => {
      const cursor = bannerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Category
    app.post("/category", async (req, res) => {
      const category = req.body;
      console.log(category);
      const result = await categoryCollection.insertOne(category);
      res.send(result);
    })

    app.get("/category", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Add Phone
    app.post("/phones", async (req, res) => {
      const phones = req.body;
      console.log(phones);
      const result = await phoneCollection.insertOne(phones);
      res.send(result);
    })

    app.get("/phones", async (req, res) => {
      const cursor = phoneCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await phoneCollection.findOne(query);
      res.send(result);
    })
    app.delete("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await phoneCollection.deleteOne(query);
      res.send(result);
    })


    app.put('/phones/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedPhone = req.body;
      console.log(updatedPhone);
      const phone = {
        $set: {
          brand: updatedPhone.brand,
          phoneName: updatedPhone.phoneName,
          details: updatedPhone.details,
          stock: updatedPhone.stock,
          regularPrice: updatedPhone.regularPrice,
          offerPrice: updatedPhone.offerPrice,
          chipset: updatedPhone.chipset,
          photoUrl: updatedPhone.photoUrl,
          storage: updatedPhone.selectedStorage,
          ram: updatedPhone.selectedRam,
          variant: updatedPhone.selectedVariant,

        }
      }

      const result = await phoneCollection.updateOne(filter, phone, options);
      res.send(result);

    })



    app.get("/phones/category/:link", async (req, res) => {
      const link = req.params.link;
      const modStr = link[0].toUpperCase() + link.slice(1);

      const query = { brand: modStr };
      console.log(modStr);

      const cursor = phoneCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    // image data 
    app.post("/image", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await imageCollection.insertOne(data);
      res.send(result);
    })

    app.get("/image", async (req, res) => {
      const cursor = imageCollection.find();
      const result = await cursor.toArray();

      // Modify the image field to include the full URL for each image
      const modifiedResult = result.map(item => {
        return {
          ...item,
          image: `http://localhost:5000/Images/${item.image}`  // Adjust image field to full URL
        };
      });

      res.send(modifiedResult);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Brand Shop server is running");
})

app.listen(port);