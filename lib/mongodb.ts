import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/setupai";

type MongooseConn = typeof mongoose;

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: MongooseConn | null; promise: Promise<MongooseConn> | null } | undefined;
}

/**
 * Hot-reload safe MongoDB connection.
 * Reuses existing connection in development to avoid too many connections.
 */
export async function connectDB(): Promise<MongooseConn> {
  if (global.mongoose?.conn) return global.mongoose.conn;
  if (global.mongoose?.promise) return global.mongoose.promise;

  const promise = mongoose.connect(MONGODB_URI);
  global.mongoose = { conn: null, promise };
  const conn = await promise;
  global.mongoose.conn = conn;
  global.mongoose.promise = promise;
  return conn;
}
