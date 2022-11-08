const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtk80fb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("Database connected");
    const servicesCollection = client.db("doctor_vai").collection("services");

    //get all services
    app.get("/services", async (req, res) => {
      const query = {};
      const services = await servicesCollection.find(query).toArray();
      res.send(services);
    });

    //   get one service
    app.get("/service/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await servicesCollection.findOne(query);
        res.send(service);
      } catch (error) {
        res.send(error);
      }
    });
  } finally {
  }
}
run();

app.get("/", (req, res) => {
  res.send("Hello Doctor uncle!");
});

app.listen(port, () => {
  console.log(`Doctor is running on ${port}`);
});
