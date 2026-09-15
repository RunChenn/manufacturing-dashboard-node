import mongoose from 'mongoose'

let connectionPromise = null

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required')
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
  }

  await connectionPromise
  console.log('MongoDB connected')
  return mongoose.connection
}
