import { Abnormality } from '../models/Abnormality.js'
import { ProductionLine } from '../models/ProductionLine.js'
import { WorkOrder } from '../models/WorkOrder.js'

export async function getSummary(req, res) {
  const [lines, workOrders, openAbnormalCount] = await Promise.all([
    ProductionLine.find().sort({ code: 1 }),
    WorkOrder.find().sort({ dueTime: 1 }).limit(10),
    Abnormality.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress'] } }),
  ])

  const output = lines.reduce((sum, line) => sum + line.output, 0)
  const averageYield = lines.length
    ? lines.reduce((sum, line) => sum + line.yieldRate, 0) / lines.length
    : 0
  const completedOrders = workOrders.filter((order) => order.status === 'done').length

  res.json({
    metrics: [
      { id: 'output', label: '今日產出', value: output.toLocaleString('en-US'), helper: 'MongoDB 即時資料' },
      { id: 'yield', label: '平均良率', value: `${averageYield.toFixed(1)}%`, helper: '目標 95.0%' },
      { id: 'orders', label: '工單完成率', value: `${completedOrders}/${workOrders.length}`, helper: '目前工單' },
      { id: 'alerts', label: '未處理異常', value: String(openAbnormalCount), helper: 'open / assigned / in_progress' },
    ],
    lines: lines.map((line) => ({
      id: line.code,
      name: line.name,
      status: line.status,
      workOrder: line.currentWorkOrder,
      output: line.output,
      target: line.target,
      yieldRate: line.yieldRate,
      updatedAt: line.updatedAt.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    })),
    workOrders: workOrders.map((order) => ({
      id: order.orderNo,
      product: order.product,
      line: order.lineCode,
      progress: order.progress,
      dueTime: order.dueTime?.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) || '',
      owner: order.owner,
    })),
    yieldTrend: [
      { time: '08:00', yieldRate: 95.2 },
      { time: '09:00', yieldRate: 95.8 },
      { time: '10:00', yieldRate: 96.4 },
      { time: '11:00', yieldRate: 95.9 },
      { time: '12:00', yieldRate: 96.8 },
      { time: '13:00', yieldRate: Number(averageYield.toFixed(1)) },
    ],
  })
}