import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User.js'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  )
}

function toUserProfile(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  }
}

export async function login(req, res) {
  const payload = loginSchema.parse(req.body)
  const user = await User.findOne({ username: payload.username })

  if (!user) {
    return res.status(401).json({ message: '帳號或密碼錯誤' })
  }

  const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash)

  if (!isValidPassword) {
    return res.status(401).json({ message: '帳號或密碼錯誤' })
  }

  const accessToken = signToken(user)

  res.json({
    accessToken,
    user: toUserProfile(user),
  })
}

export async function me(req, res) {
  const user = await User.findById(req.user.sub)

  if (!user) {
    return res.status(404).json({ message: '找不到使用者' })
  }

  res.json({
    user: toUserProfile(user),
  })
}