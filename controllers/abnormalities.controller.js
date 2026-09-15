import { z } from 'zod'
import { Abnormality } from '../models/Abnormality.js'

const createAbnormalitySchema = z.object({
  lineCode: z.string().min(1),
  equipmentCode: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
})

const updateStatusSchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']),
})

function createTicketNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ABN-${date}-${suffix}`
}

export async function listAbnormalities(req, res) {
  const {
    lineCode,
    equipmentCode,
    severity,
    status,
    page = '1',
    pageSize = '20',
  } = req.query

  const filter = {}

  if (lineCode) filter.lineCode = lineCode
  if (equipmentCode) filter.equipmentCode = equipmentCode
  if (severity) filter.severity = severity
  if (status) filter.status = status

  const limit = Number(pageSize)
  const skip = (Number(page) - 1) * limit

  const [items, total] = await Promise.all([
    Abnormality.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Abnormality.countDocuments(filter),
  ])

  res.json({
    items,
    pagination: {
      page: Number(page),
      pageSize: limit,
      total,
    },
  })
}

export async function createAbnormality(req, res) {
  const payload = createAbnormalitySchema.parse(req.body)

  const abnormality = await Abnormality.create({
    ...payload,
    ticketNo: createTicketNo(),
    reportedBy: req.user.sub,
  })

  res.status(201).json(abnormality)
}

export async function updateAbnormalityStatus(req, res) {
  const payload = updateStatusSchema.parse(req.body)

  const abnormality = await Abnormality.findByIdAndUpdate(
    req.params.id,
    {
      status: payload.status,
      resolvedAt: payload.status === 'resolved' ? new Date() : undefined,
    },
    { new: true },
  )

  if (!abnormality) {
    return res.status(404).json({ message: '找不到異常單' })
  }

  res.json(abnormality)
}