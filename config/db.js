import mongoose from 'mongoose'

let connectionPromise = null

mongoose.set('bufferCommands', false)

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    const error = new Error('MONGODB_URI is required')
    error.statusCode = 503
    throw error
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    })
  }

  try {
    await connectionPromise
  } catch (error) {
    connectionPromise = null
    error.statusCode = 503
    throw error
  }

  console.log('MongoDB connected')
  return mongoose.connection
}
