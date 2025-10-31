// server/lib/mongodb.js - MongoDB connection

import { MongoClient } from 'mongodb';

let client = null;
let clientPromise = null;

function getClientPromise() {
  // MongoDB URI вшит в код
  const uri = "mongodb+srv://qwerty5q5w_db_user:V0HA2dwaLnHldsUZ@cluster0.wyxtx3z.mongodb.net/?appName=Cluster0";

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the connection
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, create a new connection
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default getClientPromise;
