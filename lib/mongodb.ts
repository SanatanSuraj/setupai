import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/setupai";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

/**
 * Hot-reload safe MongoDB connection.
 * Reuses existing connection in development to avoid too many connections.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (global.mongoose?.conn) return global.mongoose.conn;
  if (global.mongoose?.promise) return global.mongoose.promise;

  const promise = mongoose.connect(MONGODB_URI);
  global.mongoose = { conn: null, promise };
  global.mongoose.conn = await promise;
  global.mongoose.promise = promise;
  return global.mongoose.conn;
}
