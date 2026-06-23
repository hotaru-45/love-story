# Love Story 💕

Website "Kỷ niệm tình yêu" — landing page, đồng hồ đếm thời gian yêu nhau,
timeline kỷ niệm, gallery ảnh, thư tay, nhạc nền và vài easter egg nhỏ.
Xây bằng React + Vite + Tailwind CSS v4, không cần backend, deploy free trên
GitHub Pages.

## 📁 Cấu trúc thư mục

```
love-story/
├─ public/
│  ├─ favicon.svg
│  └─ music/              # bỏ file nhạc nền của bạn vào đây (bg-music.mp3)
├─ src/
│  ├─ data/
│  │  └─ loveData.js      # ✏️ TOÀN BỘ nội dung (tên, ngày, mốc, ảnh, thư) sửa ở đây
│  ├─ components/
│  │  ├─ Hero.jsx          # landing: typing effect, heartbeat, đồng hồ đếm, easter egg
│  │  ├─ FloatingHearts.jsx # tim bay nền
│  │  ├─ Timeline.jsx       # timeline kỷ niệm dạng dọc
│  │  ├─ Gallery.jsx        # grid ảnh + popup zoom
│  │  ├─ Letter.jsx         # thư tay
│  │  ├─ MusicToggle.jsx    # nút bật/tắt nhạc nền
│  │  └─ Footer.jsx
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ vite.config.js
└─ package.json
```

## ✏️ Tuỳ chỉnh nội dung

Mở **`src/data/loveData.js`** và sửa:

- `coupleInfo`: tên 2 người, ngày bắt đầu yêu (`startDate`), câu tagline.
- `timelineEvents`: các mốc (ngày đầu gặp, nhắn tin, hẹn hò, kỷ niệm...).
  Để dùng ảnh thật, `import` ảnh ở đầu file và gán vào field `image`
  (để `null` thì hiện placeholder gradient + emoji).
- `galleryImages`: tương tự, gán `src` bằng ảnh import được, hoặc để `null`.
- `loveLetter`: nội dung thư.
- `footerInfo.madeBy`: tên hiện ở footer.
- `musicSrc`: đường dẫn nhạc nền, mặc định trỏ tới
  `public/music/bg-music.mp3` — chỉ cần bỏ file mp3 của bạn vào đó
  (nếu không có file, nút nhạc vẫn hiện nhưng sẽ không phát được gì).

## 🚀 Chạy local

```bash
cd love-story
npm install
npm run dev
```

Mở link hiện ra trong terminal (mặc định `http://localhost:5173`).

Build thử production:

```bash
npm run build
npm run preview
```

## 🌐 Deploy lên GitHub Pages

Dự án đã cấu hình sẵn `base: './'` (đường dẫn tương đối) nên build ra sẽ
chạy đúng trên GitHub Pages dù tên repo là gì, không cần sửa gì thêm.

**Bước 1 — Tạo repo trên GitHub** (nếu chưa có) và push code lên:

```bash
git init                      # nếu thư mục gốc chưa phải git repo
git add .
git commit -m "Love story website"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

**Bước 2 — Deploy bằng `gh-pages`** (đã cài sẵn trong `devDependencies`):

```bash
cd love-story
npm run deploy
```

Lệnh này sẽ tự build (`predeploy`) rồi đẩy thư mục `dist` lên nhánh
`gh-pages` của repo.

**Bước 3 — Bật GitHub Pages:**

1. Vào repo trên GitHub → **Settings → Pages**.
2. Ở mục **Build and deployment → Source**, chọn **Deploy from a branch**.
3. Branch chọn **`gh-pages`**, folder **`/ (root)`** → **Save**.
4. Đợi 1–2 phút, link public sẽ hiện ở đầu trang đó, dạng:
   `https://<username>.github.io/<repo>/`

Mỗi lần sửa nội dung xong, chạy lại `npm run deploy` để cập nhật bản live.

## 📱 Tạo QR code từ link website

Sau khi có link public (`https://<username>.github.io/<repo>/`):

1. Vào một trang tạo QR code free, ví dụ `qr-code-generator.com` hoặc
   `qrcode-monkey.com`.
2. Dán link vào, tải QR code (PNG/SVG) về.
3. In QR ra thiệp, khung ảnh... để người ấy quét là vào ngay trang web.

## 💡 Ghi chú

- Mọi animation dùng CSS thuần (heartbeat, tim bay) + `framer-motion`
  (fade-in khi scroll) nên trang nhẹ, không cần thêm thư viện animation nặng.
- Click vào icon 💖 ở trang chính 10 lần để mở easter egg.
- Site responsive mobile-first, test tốt nhất ở Chrome DevTools device mode
  hoặc trực tiếp trên điện thoại sau khi deploy.
