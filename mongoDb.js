/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ======================================             Mongodb            =================================================== */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
import dotenv from "dotenv";
dotenv.config()
import { MongoClient } from "mongodb";
const urlMongoDb = process.env.URL_MONGODB;
const dbName = "Twitter";

export const client = new MongoClient(urlMongoDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
  });

export async function selectTimelineTweets(dbCollection) {
    try {
      let db = client.db(dbName).collection(dbCollection);
      let findResult = await db.find({ referenced_tweets: null }).toArray();
      console.log("Found documents =>", findResult);
    } catch (e) {
      console.error(e);
    } finally {
    }
  }
  
  export async function selectAll(dbCollection) {
    try {
      let db = client.db(dbName).collection(dbCollection);
      let findResult = await db.find({}).limit(100).sort({ _id: -1 }).toArray();
      /* console.log("Found documents =>", findResult); */
  
      return findResult;
    } catch (e) {
      console.error(e);
    } finally {
      //
    }
  }
  
  export async function findOne(id, dbCollection) {
    try {
      let db = client.db(dbName).collection(dbCollection);
      let findResult = await db
        .find({ id: id })
        .limit(10)
        .sort({ _id: -1 })
        .toArray();
      return findResult;
    } catch (e) {
      console.error(e);
    } finally {
      //
    }
  }
  
  export async function findCollections(dbCollection) {
    try {
      let db = client.db(dbName);
      let collections = await db.listCollections().toArray();
      return collections;
    } catch (e) {
      console.error(e);
    } finally {
      //
    }
  }
  export async function insertCollection(newCollection) {
    try {
      let db = client.db(dbName);
      await db.createCollection(newCollection);
      console.log("Insert collection: ", newCollection);
    } catch (e) {
      console.error(e);
    } finally {
      //
    }
  }
  export async function insertMany(data, dbCollection) {
    try {
      let db = client.db(dbName).collection(dbCollection);
      let insertResult = await db.insertMany(data);
      console.log(`Inserted documents to ${dbCollection} =>`, insertResult);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }
  
  export async function insertOne(data, dbCollection) {
    try {
      let db = client.db(dbName).collection(dbCollection);
      let insertResult = await db.insertOne(data);
      console.log("Inserted document =>", insertResult);
    } catch (e) {
      console.error(e);
    } finally {
    }
  }
  