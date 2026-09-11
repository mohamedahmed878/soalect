import mongoose from "mongoose";

// Cached on the global object so a warm Vercel serverless container
// reuses the same MongoDB connection across requests instead of opening
// a brand new one every time (the standard pattern for Mongoose on
// serverless — see mongoosejs.com/docs/lambda.html).
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

// Never calls process.exit() in production — killing the whole process
// on a single failed connection attempt is fine for a local dev server
// (fail fast, fix .env, restart), but actively harmful on serverless:
// it can abort the function mid-request instead of just returning a
// clean JSON error, and prevents the container from ever recovering.
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    const message = "❌ MONGO_URI مش موجود. انسخ .env.example لـ .env واملأه بالقيم الحقيقية.";
    console.error(message);
    if (process.env.NODE_ENV !== "production") process.exit(1);
    throw new Error(message);
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri)
      .then((m) => {
        console.log(`✅ MongoDB connected: ${m.connection.host}/${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow the next request to retry instead of staying broken forever
        console.error(`❌ MongoDB connection error: ${err.message}`);
        if (process.env.NODE_ENV !== "production") process.exit(1);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
