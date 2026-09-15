## 專案定位

後端是一個製造現場 MES Dashboard demo API，使用 Express、MongoDB、Mongoose、JWT 與 Zod，提供登入授權、Dashboard summary、異常單與維修單管理。前端透過 Vite proxy 將 `/api` 請求轉送到本服務。

## 技術棧

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- Zod
- CORS
- Swagger UI
- dotenv

## 主要目錄

```txt
server/
  src/
    app.js            Express app、middleware、route 掛載
    server.js         DB 連線與 HTTP server 啟動
    config/           MongoDB 與 Swagger 設定
    controllers/      API business flow
    middlewares/      JWT 驗證、權限檢查、錯誤處理
    models/           Mongoose models
    routes/           Express routers
    seed/             demo seed data
```

## 環境變數

在 `server/.env` 設定：

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/manufacturing-dashboard
JWT_SECRET=replace-with-local-secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
```

`MONGODB_URI` 與 `JWT_SECRET` 是必要設定。`CLIENT_ORIGIN` 用於 CORS credential request。

## 開發指令

進入後端資料夾：

```bash
cd server
```

安裝依賴：

```bash
npm install
```

寫入 demo data：

```bash
npm run seed
```

啟動開發伺服器：

```bash
npm run dev
```

正式啟動：

```bash
npm start
```

預設 API URL：

```txt
http://localhost:3000
```

健康檢查：

```txt
GET /api/health
```

## Demo 帳號

Seed 會建立三個使用者，密碼皆為 `demo1234`：

| 帳號 | 角色 | 權限 |
| --- | --- | --- |
| `admin` | admin | dashboard、產線更新、通知管理、異常與維修操作 |
| `engineer` | engineer | dashboard、產線更新、異常與維修操作 |
| `viewer` | viewer | dashboard 檢視 |

## 認證與權限

登入流程：

1. `POST /api/auth/login` 接收 `username` 與 `password`。
2. 從 MongoDB 查詢 `User`。
3. 使用 bcrypt 驗證密碼。
4. 簽發 JWT，payload 包含 `sub`、`role`、`permissions`。
5. 回傳 `accessToken` 與 user profile。

受保護 API 使用 `Authorization: Bearer <token>`。`authMiddleware` 驗證 JWT，`requirePermission(permission)` 檢查權限。

## API 路由

| Method | Path | 權限 | 說明 |
| --- | --- | --- | --- |
| `GET` | `/api/health` | 無 | 健康檢查 |
| `POST` | `/api/auth/login` | 無 | 登入 |
| `GET` | `/api/auth/me` | 已登入 | 取得目前使用者 |
| `GET` | `/api/dashboard/summary` | `dashboard:view` | Dashboard 指標、產線、工單與良率趨勢 |
| `GET` | `/api/abnormalities` | `dashboard:view` | 異常單列表，支援 query filter 與 pagination |
| `POST` | `/api/abnormalities` | `abnormal:create` | 建立異常單 |
| `PATCH` | `/api/abnormalities/:id/status` | `abnormal:update` | 更新異常單狀態 |
| `GET` | `/api/maintenance-tickets` | `dashboard:view` | 維修單列表 |
| `POST` | `/api/maintenance-tickets` | `maintenance:update` | 建立維修單 |
| `PATCH` | `/api/maintenance-tickets/:id/status` | `maintenance:update` | 更新維修狀態 |

## 資料模型

| Model | 說明 |
| --- | --- |
| `User` | 使用者帳號、密碼 hash、角色、權限 |
| `ProductionLine` | 產線代碼、名稱、狀態、目前工單、產出、目標、良率 |
| `WorkOrder` | 工單編號、產品、產線、進度、交期、負責單位、狀態 |
| `Abnormality` | 異常單號、產線、設備、標題、描述、嚴重度、狀態、回報與結案資訊 |
| `MaintenanceTicket` | 維修單號、關聯異常、設備、產線、狀態、負責人、維修時間與備註 |

## Seed Data

`server/src/seed/seed.js` 會清空並重建：

- 三個 demo users
- 三條 production lines
- 三張 work orders
- 一張 abnormality ticket

執行 seed 前請確認 `MONGODB_URI` 指向本機或可重建的測試資料庫，避免覆蓋重要資料。

## Swagger

`server/src/config/swagger.js` 會掛載 Swagger UI。啟動後可在瀏覽器查看 API 文件：

```txt
http://localhost:3000/api-docs
```

## Vercel 部署

Vercel 會透過 `api/index.js` 載入 Express app，並由 `vercel.json` 將 `/api/*` 請求轉進同一個 serverless function。

在 Vercel Project Settings > Environment Variables 設定：

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-production-secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=https://your-frontend.vercel.app
```

如果有多個前端網址，例如 production 和 preview，可用逗號分隔：

```env
CLIENT_ORIGIN=https://your-frontend.vercel.app,https://your-preview.vercel.app
```

MongoDB Atlas 需要允許 Vercel 連線；demo 專案可在 Atlas Network Access 加入 `0.0.0.0/0`，正式環境請改用更嚴格的網路控管。

## 錯誤處理

API controller 使用 Zod 驗證 request body。錯誤會交由 `error.middleware.js` 統一轉換 response；JWT 過期或缺少 token 時回傳 `401`，權限不足時回傳 `403`。
