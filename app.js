import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import abnormalitiesRoutes from './routes/abnormalities.routes.js'
import maintenanceRoutes from './routes/maintenance.routes.js'
import { connectDB } from './config/db.js'
import { setupSwagger } from './config/swagger.js'
import { errorMiddleware } from './middlewares/error.middleware.js'

export const app = express()

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
setupSwagger(app)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
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
