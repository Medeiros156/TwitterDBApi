import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import fetch from 'node-fetch';
dotenv.config()
const urlMongoDb = process.env.URL_MONGODB;
// 'mongodb+srv://Medeiros156:1q2w3e4r@twitter.wmldgzu.mongodb.net/?retryWrites=true&w=majority';
const BearerAuth = process.env.TWITTERAPI_AUTH;

const dbName = "Twitter";
const userID = "1618333300996669442";


const client = new MongoClient(urlMongoDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
});
// Database Name

export const getUser = async (req, res) => {
  try {
    let username = req.query.q;
    let data = await searchUserInfo(username);
    
  res.status(200).json({
    data,
  });
} catch (error) {
  if (error.response) {
    console.log(error.response.status);
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
}
};
export const getTweetsFromDb = async (req, res) => {
  try {
    let param = req.query.q;
    let data = await selectAll(param);
    res.status(200).json({
      data,
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};
export const getRefFromDb = async (req, res) => {
  try {
    let data = await selectAll('References');
    res.status(200).json({
      data,
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};

async function debug() {
  updateDb("1489189886670381056", "CamargoDireita");
}

// debug();



export async function main() {
  try {
    await client.connect();



    const ref = await getReferences().catch(console.error);

    await setRefences(ref).catch(console.error);
    await setCollections(ref).catch(console.error);

    ref.forEach((e) => {
      updateDb(e.id, e.username);
    });
  } catch (error) {
    console.log(error);
  } finally {
  }
}

async function updateDb(id, dbCollection) {
  try {
    let rawData = await searchTweetsFromUser(id, dbCollection);

    let dbData = await selectAll(dbCollection);

    let dbLastId = dbData[0].id;
    let newDataLastId = rawData[0].id;

    let differentData = [];
    if (dbLastId !== newDataLastId) {
      rawData.every((e) => {
        if (e.id !== dbLastId) {
          differentData.push(e);
          return true;
        } else {
          return false;
        }
      });
    }
    if (differentData[0] != undefined) {
      // console.log(e.entities);

      let newData = await transformData(differentData);

      let sendData = newData.reverse();
      console.log(sendData);
      insertMany(sendData, dbCollection);
      console.log(`${dbCollection} UPDATED`);
    } else {
      console.log(`${dbCollection} NO UPDATES`);
    }
  } catch (error) {
    console.error(error);
  }
}

async function transformData(data) {
  try {
    let newData = await Promise.all(
      data.map(async (e) => ({
        user: e.author_id,
        created_at: e.created_at,
        id: e.id,
        text: e.text,
        tweetUrl: ifUrlExists(e),
        mediaUrl: await ifMediaExists(e.attachments, e.id),
        referenced_tweet_url: await ifRefTweetUrlExists(
          ifIdExists(e.referenced_tweets)
        ),
        referenced_tweets: ifIdExists(e.referenced_tweets),
      }))
    );
    return newData;
  } catch (error) {
    console.log(error);
  }
}

async function getReferences() {
  try {
    let id = userID;
    const res = await fetch(
      `https://api.twitter.com/2/users/${id}/following?max_results=50&tweet.fields=author_id,entities,attachments,conversation_id,created_at,referenced_tweets,in_reply_to_user_id`,
      {
        headers: {
          authorization: BearerAuth,
        },
        body: null,
        method: "GET",
      }
    );
    const rawData = await res.json();
    return rawData.data;
  } catch (error) {
    console.error(error);
  }
}

async function setRefences(ref) {
  try {
    for (let i = 0; i < ref.length; i++) {
      const e = ref[i];
      let isFound = await findOne(e.id, "References");
      if (isFound.length == 0) {
        await insertOne(e, "References");
        console.log("Inserting: ", e);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function setCollections(ref) {
  let collections = await findCollections();

  let collectionsArray = collections.map((a) => a.name);
  let refArray = ref.map((a) => a.username);

  let intersection = collectionsArray.filter((e) => refArray.includes(e));

  intersection.forEach((e) => {
    const index = refArray.indexOf(e);
    refArray.splice(index, 1);
  });

  for (let i = 0; i < refArray.length; i++) {
    const e = refArray[i];
    await populateDb(e);
    await insertCollection(e);
  }
}

async function populateDb(dbCollection) {
  let id = await searchUserInfo(dbCollection);
  let newDataPopulate = await searchTweetsFromUser(id.id, dbCollection);

  let populateData = await transformData(newDataPopulate);

  insertMany(populateData.reverse(), dbCollection);
}

async function searchTweetsFromUser(id, dbCollection) {
  try {
    const res = await fetch(
      `https://api.twitter.com/2/users/${id}/tweets?max_results=100&tweet.fields=author_id,entities,attachments,conversation_id,created_at,referenced_tweets,in_reply_to_user_id`,
      {
        headers: {
          authorization: BearerAuth,
        },
        body: null,
        method: "GET",
      }
    );
    const rawData = await res.json();
    // console.log(rawData);

    // console.log(data);
    return rawData.data;
  } catch (error) {
    console.log(error);
  }
}

async function searchUserInfo(username) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}`,
    {
      headers: {
        authorization: BearerAuth,
      },
      body: null,
      method: "GET",
    }
  );

  const data = await res.json();
  // console.log(data);
  return data.data;
}

async function ifMediaExists(e, id) {
  if (e == undefined) {
    return null;
  } else {
    // console.log(e);
    let url = await fetchMediaUrl(id);
    return url;
  }
}

async function fetchMediaUrl(id) {
  try {
    let tweetData = await tweetId(id);
    let type = tweetData.includes.media[0].type;
    /*__________________ LOOP __________________*/
    if (type == "photo") {
      // console.log('photo');
      let mediaArray = tweetData.includes.media;
      // console.log(mediaArray);
      let urlArray = [];

      mediaArray.forEach((e) => {
        urlArray.push(e.url);
      });
      let url = urlArray;
      // console.log(url);
      return url;
    } else if (type == "video") {
      // console.log('video');
      let url = tweetData.includes.media[0].variants[0].url;
      // console.log(url);
      return url;
    }
  } catch (error) {
    console.log(error);
  }
}

async function tweetId(id) {
  const res = await fetch(
    `https://api.twitter.com/2/tweets/${id}?expansions=author_id,referenced_tweets.id,referenced_tweets.id.author_id,entities.mentions.username,attachments.poll_ids,attachments.media_keys,in_reply_to_user_id,geo.place_id,edit_history_tweet_ids&tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld&media.fields=alt_text,duration_ms,height,media_key,preview_image_url,public_metrics,type,url,variants,width&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type&poll.fields=duration_minutes,end_datetime,id,options,voting_status&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,verified_type,withheld`,
    {
      headers: {
        authorization: BearerAuth,
      },
      body: null,
      method: "GET",
    }
  );

  const data = await res.json();
  // console.log(data.includes.media);
  return data;
}

function ifIdExists(e) {
  if (e == undefined) {
    return null;
  } else {
    return e[0].id;
  }
}

function ifRefMediaExists(tweetData) {
  if (
    (tweetData &&
      tweetData.includes &&
      tweetData.includes.media == undefined) ||
    null
  ) {
    return null;
  } else {
    let type = tweetData.includes.media[0].type;
    /*__________________ LOOP __________________*/
    if (type == "photo") {
      // console.log('photo');
      let mediaArray = tweetData.includes.media;
      // console.log(mediaArray);
      let urlArray = [];

      mediaArray.forEach((e) => {
        urlArray.push(e.url);
      });
      // console.log(url);
      return urlArray;
    } else if (type == "video") {
      // console.log('video');
      let url = tweetData.includes.media[0].variants[0].url;
      // console.log(url);
      return url;
    }
  }
}
async function ifRefTweetUrlExists(id) {
  console.log(id);
  if (id != null) {
    let url = RefTweetUrlMedia(id);
    return url;
  } else {
    return null;
  }
}
async function RefTweetUrlMedia(id) {
  try {
    let tweetData = await tweetId(id);

    let url = ifUrlExists(tweetData.data);
    let mediaUrl = ifRefMediaExists(tweetData);
    let refTweetText = tweetData.data.text;
    if (mediaUrl !== null) {
      // let urls = [];
      // urls.push(JSON.stringify(mediaUrl), url, refTweetText);

      let refTweetObj = ({
        url: url,
        mediaUrl: mediaUrl,
        text: refTweetText,
      });
      // return urls;
      return refTweetObj;
    } else {
      let refTweetObj = ({
        url: url,
        text: refTweetText,
      });
      return refTweetObj;
    }
  } catch (error) {
    console.log(error);
  }
}

function ifUrlExists(e) {
  if (e && e.entities && e.entities.urls && e.entities.urls.length > 0) {
    return e.entities.urls[0].url;
  } else {
    return null;
  }
}
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ======================================             Mongodb            =================================================== */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ========================================================================================================================= */
/* ========================================================================================================================= */

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
