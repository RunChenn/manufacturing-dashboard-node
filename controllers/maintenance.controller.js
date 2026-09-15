import { z } from 'zod'
import { MaintenanceTicket } from '../models/MaintenanceTicket.js'

const createMaintenanceSchema = z.object({
  abnormalityId: z.string().optional(),
  equipmentCode: z.string().min(1),
  lineCode: z.string().min(1),
  assignee: z.string().optional(),
  notes: z.string().optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'repairing', 'done', 'cancelled']),
})

function createTicketNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `MNT-${date}-${suffix}`
}

export async function listMaintenanceTickets(req, res) {
  const { lineCode, equipmentCode, status } = req.query
  const filter = {}

  if (lineCode) filter.lineCode = lineCode
  if (equipmentCode) filter.equipmentCode = equipmentCode
  if (status) filter.status = status

  const items = await MaintenanceTicket.find(filter).sort({ createdAt: -1 })

  res.json({ items })
}

export async function createMaintenanceTicket(req, res) {
  const payload = createMaintenanceSchema.parse(req.body)

  const ticket = await MaintenanceTicket.create({
    ...payload,
    ticketNo: createTicketNo(),
  })

  res.status(201).json(ticket)
}

export async function updateMaintenanceStatus(req, res) {
  const payload = updateStatusSchema.parse(req.body)

  const patch = {
    status: payload.status,
  }

  if (payload.status === 'repairing') {
    patch.startedAt = new Date()
  }

  if (payload.status === 'done') {
    patch.finishedAt = new Date()
  }

  const ticket = await MaintenanceTicket.findByIdAndUpdate(req.params.id, patch, { new: true })

  if (!ticket) {
    return res.status(404).json({ message: '找不到維修單' })
  }

  res.json(ticket)
}