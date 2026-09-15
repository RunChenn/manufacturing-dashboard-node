import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import abnormalitiesRoutes from './routes/abnormalities.routes.js'
import maintenanceRoutes from './routes/maintenance.routes.js'
import { connectDB } from './config/db.js'
import { setupSwagger } from './config/swagger.js'
import { errorMiddleware } from './middlewares/error.middleware.js'

export const app = express()

const allowedOrigins = process.env.CLIENT_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || !allowedOrigins?.length || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(null, false)
  },
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
setupSwagger(app)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      mongodbUri: Boolean(process.env.MONGODB_URI),
      jwtSecret: Boolean(process.env.JWT_SECRET),
      clientOrigin: Boolean(process.env.CLIENT_ORIGIN),
    },
    mongoReadyState: mongoose.connection.readyState,
  })
})

app.use('/api', async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    next(error)
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/abnormalities', abnormalitiesRoutes)
app.use('/api/maintenance-tickets', maintenanceRoutes)

app.use(errorMiddleware)

export default app
