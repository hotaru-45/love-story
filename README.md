# ❤️ Love Story

Monorepo gồm 2 project độc lập:

| | Project | Là gì | README |
|---|---|---|---|
| 🖥️ | [`love-story/`](love-story) | Frontend — trang web kỷ niệm (React + Vite + Tailwind + Ant Design), deploy free trên GitHub Pages | [love-story/README.md](love-story/README.md) |
| ⚙️ | [`backend/`](backend) | Backend — API GraphQL + MongoDB, chỉ phục vụ đăng nhập thật cho trang Login của FE | [backend/README.md](backend/README.md) |

`render.yaml` ở gốc repo này là **Render Blueprint** — dùng để deploy
`backend/` lên [Render](https://render.com) (xem chi tiết trong
`backend/README.md`, mục "Deploy production").

## 🚀 Build & chạy cả 2 từ đầu (local)

```bash
git clone https://github.com/<username>/love-story.git
cd love-story

# 1) Backend — API đăng nhập (cần MongoDB chạy sẵn ở local hoặc Atlas)
cd backend
npm install
cp ex.env .env              # sửa MONGODB_DATA_URL nếu cần
npm run dev                  # http://localhost:3003, tự seed tài khoản love/123456
cd ..

# 2) Frontend — trang web chính (mở terminal khác)
cd love-story
npm install
npm run dev                  # http://localhost:5173 (mặc định của Vite)
```

Mở `http://localhost:5173`, đăng nhập `love` / `123456`, ngày `24/12/2025`
(đổi được — xem `love-story/src/data/storyData.js`).

## 📦 Build production

**Frontend** (deploy GitHub Pages, không cần server):

```bash
cd love-story
npm run build      # build thử, xem output ở dist/
npm run deploy      # build + đẩy thẳng lên nhánh gh-pages
```

**Backend** (cần host chạy Node.js 24/7 — Render/VPS/Railway...):

```bash
cd backend
docker build -t love-story-backend .
docker run -d -p 3003:3003 --env-file .env love-story-backend
```

Chi tiết đầy đủ (cách nối FE ↔ BE qua `VITE_API_URL`, deploy Render +
MongoDB Atlas free từng bước, các lỗi thực tế đã gặp khi deploy và cách
sửa) nằm trong README của từng project ở bảng trên — đọc `backend/README.md`
trước nếu định deploy production, vì FE phụ thuộc vào backend đã chạy sẵn.
