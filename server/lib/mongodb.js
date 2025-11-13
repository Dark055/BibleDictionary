// server/lib/mongodb.js - MongoDB connection

import { MongoClient } from 'mongodb';

let client = null;
let clientPromise = null;

function getClientPromise() {
  // MongoDB URI берётся из переменной окружения
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be set in .env');
  }

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
