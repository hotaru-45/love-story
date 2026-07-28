# ❤️ Love Story — Backend

Node.js thuần (`http` + [`find-my-way`](https://github.com/delvedor/find-my-way))
+ GraphQL ([`@graphql-tools`](https://the-guild.dev/graphql/tools)) + MongoDB
(`mongoose`). Đây là 1 template admin đa tenant (Company/Users/Rooms/...)
dùng chung — trong project này chỉ khai thác đúng 1 phần: **API `login`
thật cho trang đăng nhập của FE `../love-story`**.

## 📁 Cấu trúc chính

```
backend/
├─ server.js                 # entry point, seed tài khoản, cluster, listen port
├─ constants/index.js        # secret token/pass đọc từ env
├─ models/
│  ├─ index.js                # kết nối Mongo + factory model theo tenant (useDb)
│  └─ schemas/                # mongoose schema từng collection
├─ graphql/
│  ├─ schema/                 # *.gql (type) + *.js (resolver) từng module
│  ├─ auth/index.js           # middleware compose: check_tenant, check_company, authentication...
│  └─ utils/passwordHash.js   # hash/verify password (argon2id, Node core crypto.argon2)
├─ router/
│  ├─ index.js                 # định tuyến route (route /graphql, /healthz, /upload...)
│  └─ controllers/graphql.js   # nhận POST /graphql, chạy schema, trả JSON
├─ Dockerfile / .dockerignore
├─ ex.env                     # template — copy thành .env, không commit .env thật
└─ render.yaml (ở repo root)  # Render Blueprint — deploy production
```

## 🚀 Chạy local

```bash
cd backend
npm install
cp ex.env .env
npm run dev              # nodemon, mặc định http://localhost:3003
```

Cần MongoDB chạy sẵn (local không auth là đơn giản nhất khi dev — nếu dùng
Docker: `docker run -d -p 27017:27017 mongo`). Sửa `MONGODB_DATA_URL` trong
`.env` cho khớp:

```
MONGODB_DATA_URL=mongodb://127.0.0.1:27017?readPreference=primary&directConnection=true&ssl=false
```

Khởi động lần đầu, `server.js` tự seed:
- Tài khoản **master** (`sadmin`/`sadmin`) — dùng cho `LoginMaster`, quản trị toàn hệ thống.
- Company `LOVESTORY` + user **`love`/`123456`** — đây là tài khoản trang Login FE dùng, qua query `login(code_company: "LOVESTORY", ...)`.

Test nhanh không cần FE:

```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { login(code_company: \"LOVESTORY\", username: \"love\", password: \"123456\") { token } }"}'
```

`GET /healthz` → `200 ok` nếu server + route sống (không check Mongo).

## 🌐 Deploy production (Render + MongoDB Atlas — cả 2 free, không cần thẻ)

Repo có sẵn `render.yaml` ở gốc repo (`../render.yaml`) — Render đọc file
này để tự tạo service, tự generate secret, chỉ hỏi đúng 1 biến thủ công.

**1) Tạo database (MongoDB Atlas):**
1. [cloud.mongodb.com](https://cloud.mongodb.com) → Sign up → **Create** → chọn **M0 Free**.
2. **Database Access** → tạo user (username tuỳ chọn) + password → lưu lại.
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
   (`0.0.0.0/0`) — bắt buộc, vì Render không có IP cố định.
4. **Connect → Drivers** → copy connection string dạng
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`.

**2) Deploy backend (Render):**
1. [render.com](https://render.com) → Sign up with GitHub → **New → Blueprint**.
2. Chọn repo, để trống "Blueprint Path" (mặc định đọc `render.yaml` ở gốc repo).
3. Render hỏi giá trị biến `MONGODB_DATA_URL` (biến duy nhất để `sync: false`
   trong `render.yaml`, vì chỉ chủ project mới có) → dán connection string ở bước 1.
4. **Apply** → build ~3-5 phút → xong sẽ có URL dạng `https://lovestory-backend.onrender.com`.

**3) Nối FE:** set `VITE_API_URL=<url-render>` trong `love-story/.env.production`
rồi `npm run deploy` lại FE. Chi tiết ở `../love-story/README.md`.

Free tier Render **sleep sau 15 phút không traffic** — request đầu tiên sau
khi sleep chậm ~30-50s (cold start), bình thường, không phải lỗi.

## 🩹 Sự cố thực tế đã gặp khi deploy (và cách đã sửa)

Ghi lại để lần sau (đổi cluster, tạo tenant mới...) không mất công debug lại:

1. **`render.yaml` build fail ngay bước clone** — lỗi
   `lstat backend/backend: no such file or directory`. Nguyên nhân: khai cả
   `rootDir: backend` **và** `dockerfilePath: backend/Dockerfile` /
   `dockerContext: backend` → Render nối `rootDir + dockerfilePath` thành
   `backend/backend`. **Fix**: khi đã có `rootDir`, path Docker phải tính
   tương đối *từ trong* `rootDir` đó (`dockerfilePath: Dockerfile`,
   `dockerContext: .`), không lặp lại tên thư mục.
2. **Login lỗi `bad auth: authentication failed`** — do dán nhầm/sai
   username-password trong `MONGODB_DATA_URL` ở Render Environment (kể cả
   thiếu URL-encode ký tự đặc biệt trong password). Kiểm tra kỹ giá trị
   thật đã dán, không còn placeholder kiểu `<db_password>`.
3. **Cả server crash-loop mỗi khi Mongo lỗi** (vd bad auth ở trên) — bug
   thật trong code: `models/index.js` tạo connection qua
   `mongoose.createConnection()` nhưng không có handler cho event `'error'`.
   Node ném uncaught exception khi 1 EventEmitter emit `'error'` mà không ai
   lắng nghe → sập cả process. Đã thêm
   `baseConn.on('error', (err) => logger.error(...))` để chỉ log, không sập.
4. **`Database name ... is too long. Max database name length is 38 bytes`**
   — hệ thống đặt tên database Mongo theo `${NAME_APP}_${id_tenant}`. Nếu
   `id_tenant` là UUID đầy đủ (36 ký tự) thì `nexora_<uuid>` (43 ký tự) vượt
   giới hạn 38 byte mà MongoDB Atlas áp (Mongo local thường không strict như
   vậy nên không phát hiện được lúc dev). Tenant seed sẵn cho FE
   (`COUPLE_TENANT_ID` trong `server.js`) dùng chuỗi ngắn cố định
   (`'lovestory'`) thay vì `randomUUID()` để né giới hạn này.

## 🔑 Biến môi trường (`.env`, xem thêm `ex.env`)

| Biến | Ý nghĩa |
|---|---|
| `MONGODB_DATA_URL` | Connection string Mongo (local hoặc Atlas) |
| `PORT` | Port HTTP server lắng nghe |
| `NAME_APP` | Prefix tên database Mongo theo tenant (`${NAME_APP}_${id_tenant}`) |
| `CORS_ORIGINS` | Whitelist origin cho phép gọi API (phân tách dấu phẩy); để trống = `*` (chỉ nên dùng dev) |
| `SECRET_TOKEN` / `SECRET_PASS` | Ký JWT + pepper hash password cho user tenant thường |
| `SECRET_TOKEN_MASTER` / `SECRET_PASS_MASTER` | Tương tự, dành riêng cho tài khoản master (`sadmin`) |

Trên Render, 4 biến `SECRET_*` được `render.yaml` tự generate ngẫu nhiên
(`generateValue: true`) — không cần tự nghĩ giá trị.
