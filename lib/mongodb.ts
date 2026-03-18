import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/setupai";

type MongooseConn = typeof mongoose;

declare global {
  // eslint-disable-next-line no-var
  var mongoose:
    | { conn: MongooseConn | null; promise: Promise<MongooseConn> | null }
    | undefined;
}

/**
 * Hot-reload-safe MongoDB connection.
 * Reuses existing connection in development to avoid too many connections.
 * Clears the cache if a previous connection attempt failed so the next
 * request gets a fresh attempt rather than re-throwing the stale error.
 */
export async function connectDB(): Promise<MongooseConn> {
  // Already connected
  if (global.mongoose?.conn) return global.mongoose.conn;

  // In-flight connection — await it
  if (global.mongoose?.promise) {
    try {
      const conn = await global.mongoose.promise;
      return conn;
    } catch (err) {
      // Previous attempt failed — reset so next call retries
      global.mongoose = { conn: null, promise: null };
      throw err;
    }
  }

  // Start a new connection
  const promise = mongoose
    .connect(MONGODB_URI, {
      bufferCommands: false, // fail fast instead of queuing when not connected
    })
    .then((conn) => {
      if (global.mongoose) global.mongoose.conn = conn;
      return conn;
    })
    .catch((err) => {
      // Clear cache so the next request retries
      global.mongoose = { conn: null, promise: null };
      throw err;
    });

  global.mongoose = { conn: null, promise };

  return promise;
}
