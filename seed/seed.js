import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import { Abnormality } from '../models/Abnormality.js'
import { MaintenanceTicket } from '../models/MaintenanceTicket.js'
import { ProductionLine } from '../models/ProductionLine.js'
import { User } from '../models/User.js'
import { WorkOrder } from '../models/WorkOrder.js'

const rolePermissions = {
  admin: ['dashboard:view', 'line:update', 'notification:manage', 'admin:operate', 'abnormal:create', 'abnormal:update', 'maintenance:update'],
  engineer: ['dashboard:view', 'line:update', 'abnormal:create', 'abnormal:update', 'maintenance:update'],
  viewer: ['dashboard:view'],
}

await connectDB()

await Promise.all([
  User.deleteMany({}),
  ProductionLine.deleteMany({}),
  WorkOrder.deleteMany({}),
  Abnormality.deleteMany({}),
  MaintenanceTicket.deleteMany({}),
])

const passwordHash = await bcrypt.hash('demo1234', 10)

await User.insertMany([
  { username: 'admin', passwordHash, name: 'Admin', role: 'admin', permissions: rolePermissions.admin },
  { username: 'engineer', passwordHash, name: 'Engineer', role: 'engineer', permissions: rolePermissions.engineer },
  { username: 'viewer', passwordHash, name: 'Viewer', role: 'viewer', permissions: rolePermissions.viewer },
])

await ProductionLine.insertMany([
  { code: 'line-a', name: 'Line A', status: 'running', currentWorkOrder: 'MO-20260914-001', output: 1280, target: 1500, yieldRate: 98.4 },
  { code: 'line-b', name: 'Line B', status: 'warning', currentWorkOrder: 'MO-20260914-002', output: 940, target: 1300, yieldRate: 94.8 },
  { code: 'line-c', name: 'Line C', status: 'stopped', currentWorkOrder: 'MO-20260914-003', output: 520, target: 1100, yieldRate: 89.2 },
])

await WorkOrder.insertMany([
  { orderNo: 'MO-20260914-001', product: 'AI Server Node', lineCode: 'line-a', progress: 86, dueTime: new Date(), owner: '製造一課', status: 'running' },
  { orderNo: 'MO-20260914-002', product: 'Storage Module', lineCode: 'line-b', progress: 72, dueTime: new Date(), owner: '製造二課', status: 'running' },
  { orderNo: 'MO-20260914-003', product: 'HPC Accelerator Tray', lineCode: 'line-c', progress: 48, dueTime: new Date(), owner: '製造三課', status: 'delayed' },
])

await Abnormality.create({
  ticketNo: 'ABN-20260914-0001',
  lineCode: 'line-b',
  equipmentCode: 'ICT-03',
  title: 'Line B 良率低於門檻',
  description: '近 10 分鐘平均良率降至 94.8%',
  severity: 'high',
  status: 'open',
})

console.log('Seed completed')
process.exit(0)