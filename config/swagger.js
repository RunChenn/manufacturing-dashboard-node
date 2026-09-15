const swaggerUiVersion = '5.32.15'

function getApiBaseUrl(req) {
  const protocol = req.get('x-forwarded-proto') || req.protocol
  return `${protocol}://${req.get('host')}/api`
}

function getOpenApiSpec(req) {
  return {
    ...openApiSpec,
    servers: [
      {
        url: getApiBaseUrl(req),
        description: 'Current API server',
      },
      ...openApiSpec.servers,
    ],
  }
}

function getSwaggerHtml() {
  const swaggerUiBaseUrl = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${swaggerUiVersion}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manufacturing Dashboard API Docs</title>
  <link rel="stylesheet" href="${swaggerUiBaseUrl}/swagger-ui.css">
  <style>
    body {
      margin: 0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${swaggerUiBaseUrl}/swagger-ui-bundle.js"></script>
  <script src="${swaggerUiBaseUrl}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: 'StandaloneLayout'
      })
    }
  </script>
</body>
</html>`
}

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Manufacturing Dashboard API',
    version: '1.0.0',
    description: '設備維修、異常通報與生產看板後端 API 文件。',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local development API server',
    },
  ],
  tags: [
    { name: 'Health', description: '服務狀態檢查' },
    { name: 'Auth', description: '登入與目前使用者' },
    { name: 'Dashboard', description: '生產看板總覽' },
    { name: 'Abnormalities', description: '異常通報管理' },
    { name: 'Maintenance', description: '設備維修單管理' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: '操作失敗',
          },
        },
      },
      UserProfile: {
        type: 'object',
        required: ['id', 'name', 'role', 'permissions'],
        properties: {
          id: { type: 'string', example: '66f000000000000000000001' },
          name: { type: 'string', example: 'Admin' },
          role: {
            type: 'string',
            enum: ['admin', 'engineer', 'viewer'],
            example: 'admin',
          },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['dashboard:view', 'abnormal:create', 'abnormal:update'],
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'demo1234' },
        },
      },
      LoginResponse: {
        type: 'object',
        required: ['accessToken', 'user'],
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: { $ref: '#/components/schemas/UserProfile' },
        },
      },
      MeResponse: {
        type: 'object',
        required: ['user'],
        properties: {
          user: { $ref: '#/components/schemas/UserProfile' },
        },
      },
      Metric: {
        type: 'object',
        required: ['id', 'label', 'value', 'helper'],
        properties: {
          id: { type: 'string', example: 'output' },
          label: { type: 'string', example: '今日產出' },
          value: { type: 'string', example: '2,740' },
          helper: { type: 'string', example: 'MongoDB 即時資料' },
        },
      },
      ProductionLine: {
        type: 'object',
        required: ['id', 'name', 'status', 'workOrder', 'output', 'target', 'yieldRate', 'updatedAt'],
        properties: {
          id: { type: 'string', example: 'line-a' },
          name: { type: 'string', example: 'Line A' },
          status: {
            type: 'string',
            enum: ['running', 'warning', 'stopped'],
            example: 'running',
          },
          workOrder: { type: 'string', example: 'MO-20260914-001' },
          output: { type: 'number', example: 1280 },
          target: { type: 'number', example: 1500 },
          yieldRate: { type: 'number', example: 98.4 },
          updatedAt: { type: 'string', example: '13:32' },
        },
      },
      WorkOrder: {
        type: 'object',
        required: ['id', 'product', 'line', 'progress', 'dueTime', 'owner'],
        properties: {
          id: { type: 'string', example: 'MO-20260914-001' },
          product: { type: 'string', example: 'AI Server Node' },
          line: { type: 'string', example: 'line-a' },
          progress: { type: 'number', example: 86 },
          dueTime: { type: 'string', example: '16:00' },
          owner: { type: 'string', example: '製造一課' },
        },
      },
      TrendPoint: {
        type: 'object',
        required: ['time', 'yieldRate'],
        properties: {
          time: { type: 'string', example: '13:00' },
          yieldRate: { type: 'number', example: 96.1 },
        },
      },
      DashboardSummaryResponse: {
        type: 'object',
        required: ['metrics', 'lines', 'workOrders', 'yieldTrend'],
        properties: {
          metrics: {
            type: 'array',
            items: { $ref: '#/components/schemas/Metric' },
          },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProductionLine' },
          },
          workOrders: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkOrder' },
          },
          yieldTrend: {
            type: 'array',
            items: { $ref: '#/components/schemas/TrendPoint' },
          },
        },
      },
      Abnormality: {
        type: 'object',
        required: ['_id', 'ticketNo', 'lineCode', 'equipmentCode', 'title', 'severity', 'status', 'createdAt', 'updatedAt'],
        properties: {
          _id: { type: 'string', example: '66f000000000000000000101' },
          ticketNo: { type: 'string', example: 'ABN-20260915-0001' },
          lineCode: { type: 'string', example: 'line-b' },
          equipmentCode: { type: 'string', example: 'ICT-03' },
          title: { type: 'string', example: 'Line B 良率低於門檻' },
          description: { type: 'string', example: '近 10 分鐘平均良率降至 94.8%' },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            example: 'high',
          },
          status: {
            type: 'string',
            enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
            example: 'open',
          },
          reportedBy: { type: 'string', example: '66f000000000000000000001' },
          assignedTo: { type: 'string', nullable: true, example: '66f000000000000000000002' },
          resolvedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2026-09-15T08:30:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-15T07:10:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-15T07:10:00.000Z',
          },
        },
      },
      CreateAbnormalityRequest: {
        type: 'object',
        required: ['lineCode', 'equipmentCode', 'title', 'severity'],
        properties: {
          lineCode: { type: 'string', example: 'line-b' },
          equipmentCode: { type: 'string', example: 'ICT-03' },
          title: { type: 'string', example: 'Line B 良率低於門檻' },
          description: { type: 'string', example: '近 10 分鐘平均良率降至 94.8%' },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            example: 'high',
          },
        },
      },
      UpdateAbnormalityStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
            example: 'in_progress',
          },
        },
      },
      AbnormalityListResponse: {
        type: 'object',
        required: ['items', 'pagination'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Abnormality' },
          },
          pagination: {
            type: 'object',
            required: ['page', 'pageSize', 'total'],
            properties: {
              page: { type: 'number', example: 1 },
              pageSize: { type: 'number', example: 20 },
              total: { type: 'number', example: 42 },
            },
          },
        },
      },
      MaintenanceTicket: {
        type: 'object',
        required: ['_id', 'ticketNo', 'equipmentCode', 'lineCode', 'status', 'downtimeMinutes', 'notes', 'createdAt', 'updatedAt'],
        properties: {
          _id: { type: 'string', example: '66f000000000000000000201' },
          ticketNo: { type: 'string', example: 'MNT-20260915-0001' },
          abnormalityId: { type: 'string', nullable: true, example: '66f000000000000000000101' },
          equipmentCode: { type: 'string', example: 'ICT-03' },
          lineCode: { type: 'string', example: 'line-b' },
          status: {
            type: 'string',
            enum: ['pending', 'scheduled', 'repairing', 'done', 'cancelled'],
            example: 'repairing',
          },
          assignee: { type: 'string', nullable: true, example: '66f000000000000000000002' },
          startedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2026-09-15T07:20:00.000Z',
          },
          finishedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2026-09-15T08:20:00.000Z',
          },
          downtimeMinutes: { type: 'number', example: 42 },
          notes: { type: 'string', example: '已更換連線模組' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-15T07:10:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-15T07:20:00.000Z',
          },
        },
      },
      CreateMaintenanceTicketRequest: {
        type: 'object',
        required: ['equipmentCode', 'lineCode'],
        properties: {
          abnormalityId: { type: 'string', example: '66f000000000000000000101' },
          equipmentCode: { type: 'string', example: 'ICT-03' },
          lineCode: { type: 'string', example: 'line-b' },
          assignee: { type: 'string', example: '66f000000000000000000002' },
          notes: { type: 'string', example: '由異常單建立維修單' },
        },
      },
      UpdateMaintenanceStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'scheduled', 'repairing', 'done', 'cancelled'],
            example: 'repairing',
          },
        },
      },
      MaintenanceTicketListResponse: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/MaintenanceTicket' },
          },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: '尚未登入或 token 已過期',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { message: '尚未登入' },
          },
        },
      },
      Forbidden: {
        description: '沒有操作權限',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { message: '沒有操作權限' },
          },
        },
      },
      ValidationError: {
        description: '請求資料格式錯誤',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { message: 'Validation error' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: '服務狀態檢查',
        responses: {
          200: {
            description: 'API server 正常',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '登入',
        description: '使用帳號密碼登入，成功後回傳 JWT accessToken 與使用者資訊。',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: '登入成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          401: {
            description: '帳號或密碼錯誤',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: '帳號或密碼錯誤' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: '取得目前使用者',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: '目前登入使用者',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MeResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: '找不到使用者',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: '找不到使用者' },
              },
            },
          },
        },
      },
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: '取得生產看板總覽',
        description: '回傳前端 Dashboard 所需的統計卡、產線列表、工單列表與良率趨勢。',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: '看板總覽資料',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardSummaryResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/abnormalities': {
      get: {
        tags: ['Abnormalities'],
        summary: '異常通報列表',
        description: '支援依產線、設備、嚴重程度、狀態與分頁查詢異常單。',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'lineCode', in: 'query', schema: { type: 'string' }, example: 'line-b' },
          { name: 'equipmentCode', in: 'query', schema: { type: 'string' }, example: 'ICT-03' },
          {
            name: 'severity',
            in: 'query',
            schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            example: 'high',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'] },
            example: 'open',
          },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          200: {
            description: '異常通報列表',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AbnormalityListResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Abnormalities'],
        summary: '新增異常通報',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAbnormalityRequest' },
            },
          },
        },
        responses: {
          201: {
            description: '異常通報建立成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Abnormality' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/abnormalities/{id}/status': {
      patch: {
        tags: ['Abnormalities'],
        summary: '更新異常通報狀態',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '66f000000000000000000101',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAbnormalityStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: '異常通報狀態更新成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Abnormality' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: '找不到異常單',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: '找不到異常單' },
              },
            },
          },
        },
      },
    },
    '/maintenance-tickets': {
      get: {
        tags: ['Maintenance'],
        summary: '維修單列表',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'lineCode', in: 'query', schema: { type: 'string' }, example: 'line-b' },
          { name: 'equipmentCode', in: 'query', schema: { type: 'string' }, example: 'ICT-03' },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'scheduled', 'repairing', 'done', 'cancelled'] },
            example: 'repairing',
          },
        ],
        responses: {
          200: {
            description: '維修單列表',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MaintenanceTicketListResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Maintenance'],
        summary: '建立維修單',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMaintenanceTicketRequest' },
            },
          },
        },
        responses: {
          201: {
            description: '維修單建立成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MaintenanceTicket' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/maintenance-tickets/{id}/status': {
      patch: {
        tags: ['Maintenance'],
        summary: '更新維修單狀態',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '66f000000000000000000201',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMaintenanceStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: '維修單狀態更新成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MaintenanceTicket' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: '找不到維修單',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: '找不到維修單' },
              },
            },
          },
        },
      },
    },
  },
}

export function setupSwagger(app) {
  app.get('/api/openapi.json', (req, res) => {
    res.json(getOpenApiSpec(req))
  })

  app.get(['/api/docs', '/api/docs/'], (req, res) => {
    res.type('html').send(getSwaggerHtml())
  })
}
