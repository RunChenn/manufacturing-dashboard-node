import mongoose from 'mongoose'

const productionLineSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'warning', 'stopped'],
      default: 'running',
    },
    currentWorkOrder: String,
    output: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      default: 0,
    },
    yieldRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

export const ProductionLine = mongoose.model('ProductionLine', productionLineSchema)