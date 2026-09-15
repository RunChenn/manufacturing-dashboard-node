import mongoose from 'mongoose'

const maintenanceTicketSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: String,
      required: true,
      unique: true,
    },
    abnormalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Abnormality',
    },
    equipmentCode: {
      type: String,
      required: true,
    },
    lineCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'repairing', 'done', 'cancelled'],
      default: 'pending',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startedAt: Date,
    finishedAt: Date,
    downtimeMinutes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

export const MaintenanceTicket = mongoose.model('MaintenanceTicket', maintenanceTicketSchema)