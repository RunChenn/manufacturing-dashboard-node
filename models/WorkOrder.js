import mongoose from 'mongoose'

const workOrderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },
    product: {
      type: String,
      required: true,
    },
    lineCode: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    dueTime: Date,
    owner: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'done', 'delayed'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

export const WorkOrder = mongoose.model('WorkOrder', workOrderSchema)