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

// verify jwt token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    console.log("Database connected");
    const servicesCollection = client.db("doctor_vai").collection("services");
    const reviewCollection = client.db("doctor_vai").collection("reviews");

    //get all services
    app.get("/services", async (req, res) => {
      try {
        const query = {};
        const services = await servicesCollection.find(query).toArray();
        res.send(services);
      } catch (error) {
        res.send(error);
      }
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

    // add a service
    app.post("/add-service", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send({ success: true, result });
    });

    //   get one service review
    app.get("/review/:name", async (req, res) => {
      try {
        const name = req.params.name;
        const query = { service: name };
        const result = await reviewCollection.find(query).toArray();
        res.send(result);
      } catch (error) {}
    });

    //   add a review
    app.post("/add-review/", async (req, res) => {
      try {
        const comment = req.body;
        const result = await reviewCollection.insertOne(comment);
        res.send({ success: true, result });
      } catch (error) {}
    });

    // get user reviews
    app.get("/my-review", verifyJWT, async (req, res) => {
      const email = req.decoded.email;
      const query = { email: email };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    // edit user review
    app.put("/review/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const comment = req.body;
        const filter = { _id: ObjectId(id) };
        const option = { upsert: true };
        const updateDoc = {
          $set: comment,
        };
        const result = await reviewCollection.updateOne(
          filter,
          updateDoc,
          option
        );
        res.send({ success: true, result });
      } catch (error) {
        res.send(error);
      }
    });

    // delete user review
    app.delete("/my-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    //   login user
    app.put("/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const token = jwt.sign(
          { email: email },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.send({ token });
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

// assignment 11 are done
