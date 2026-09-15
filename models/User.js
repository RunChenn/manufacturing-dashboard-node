import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'engineer', 'viewer'],
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)