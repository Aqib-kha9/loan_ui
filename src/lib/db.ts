import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the DATABASE_URL environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const tryConnect = async (retries = 3, delay = 1000): Promise<typeof mongoose> => {
        try {
            return await mongoose.connect(MONGODB_URI!, opts);
        } catch (err) {
            if (retries === 0) {
                 console.error("MongoDB Connection Failed after retries:", err);
                 throw err;
            }
            console.warn(`MongoDB Connection Error. Retrying in ${delay/1000}s... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            return tryConnect(retries - 1, delay);
        }
    };

    cached.promise = tryConnect().then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
