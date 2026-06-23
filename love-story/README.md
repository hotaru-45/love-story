# ❤️ Love Story: Cinematic Experience

Một "memory universe" tương tác — không phải website xem ảnh thông thường.
Người dùng cuộn/click/giữ để trải nghiệm câu chuyện tình yêu như một
story-game nhẹ: Home cinematic → Story World (chapters cuộn dọc) → Memory
Map (mốc có khoá/mở) → Memory Gallery (zoom/pan) → Chat Replay → Final
Letter. React + Vite + Tailwind CSS v4 + Framer Motion, không backend,
deploy free trên GitHub Pages.

## 📁 Cấu trúc thư mục

```
love-story/
├─ public/
│  ├─ favicon.svg
│  └─ music/                   # bỏ file nhạc nền vào đây (bg-music.mp3)
├─ src/
│  ├─ data/
│  │  └─ storyData.js          # ✏️ TOÀN BỘ nội dung: chapters, chat, mã bí mật, thư cuối
│  ├─ hooks/
│  │  ├─ useTypewriter.js       # typewriter 1 dòng + sequence nhiều dòng
│  │  ├─ useLocalStorage.js     # lưu note/emotion trên máy người dùng
│  │  └─ unlockContext.js       # context + hook useUnlockSystem() + chime âm thanh
│  ├─ components/
│  │  ├─ HomeIntro.jsx          # cinematic landing, typewriter, zoom transition
│  │  ├─ StoryEngine.jsx        # ⭐ Story World: chapter cuộn dọc, Ken Burns, rewind, hidden layer
│  │  ├─ TimelineMap.jsx        # ⭐ Memory Map: node khoá/mở, heart ẩn
│  │  ├─ UnlockSystem.jsx       # ⭐ ô nhập mã bí mật + toast "achievement unlocked"
│  │  ├─ UnlockProvider.jsx     # provider giữ state unlock (đã tách khỏi hook để hỗ trợ Fast Refresh)
│  │  ├─ MemoryGallery.jsx      # ⭐ grid ảnh immersive
│  │  ├─ MemoryViewer.jsx       # zoom/pan, overlay story, emotion slider, add note
│  │  ├─ ChatReplay.jsx         # ⭐ fake chat, typing indicator, reveal tuần tự
│  │  ├─ FinalLetter.jsx        # ⭐ thư cuối, mở khi cuộn tới cuối, zoom-out ấm áp
│  │  ├─ StoryViewer.jsx        # modal chi tiết dùng chung (progress bar, swipe, voice note)
│  │  ├─ LoveCounter.jsx        # đếm realtime + heartbeat + glow pulse mỗi giây
│  │  ├─ ScrollDepthUnlocker.jsx# sentinel vô hình — cuộn tới đây tự unlock chapter bí mật
│  │  ├─ MemoryAssistant.jsx    # "AI" giả lập gợi nhớ ngẫu nhiên 1 chapter
│  │  ├─ FloatingHearts.jsx     # tim bay nền
│  │  ├─ MusicToggle.jsx        # mini player kiểu Spotify
│  │  └─ Footer.jsx
│  ├─ pages/
│  │  └─ Experience.jsx         # ráp toàn bộ trải nghiệm thành 1 trang cuộn liên tục
│  ├─ styles/
│  │  └─ index.css              # Tailwind + keyframes (heartbeat, ken-burns, glow-pulse, ...)
│  ├─ App.jsx                   # bọc UnlockProvider quanh Experience
│  └─ main.jsx
├─ vite.config.js
└─ package.json
```

(⭐ = component được yêu cầu rõ trong spec, các file còn lại là phần hỗ trợ.)

## 🎮 UnlockSystem — lớp gamification

Có **1 chapter bonus bị khoá** (chapter cuối, `locked: true` trong
`storyData.js`) — các kỷ niệm thật không bị khoá, để không làm khó người
nhận quà. Chapter bonus này mở được qua **4 cách độc lập** (làm 1 trong 4 là đủ):

1. Bấm logo "💌 Chuyện Của Chúng Mình" ở Home 5 lần.
2. Bấm vào "heart ẩn" (✨ mờ, opacity thấp) ở cuối Memory Map.
3. Cuộn đủ sâu trang (qua `ScrollDepthUnlocker`, tự động, không cần bấm gì).
4. Nhập đúng mã bí mật (mặc định `ourstory`, đổi ở `secretCode` trong data)
   vào ô "🔐 Bạn biết mã bí mật?" gần Memory Map.

Mở khoá xong sẽ có toast "🏆 Đã mở khoá..." + glow + một tiếng "ding" nhỏ
(tạo bằng Web Audio API, không cần file âm thanh thật). Trạng thái unlock
lưu trong `localStorage` nên không mất khi load lại trang.

## ✏️ Tuỳ chỉnh nội dung

Mở **`src/data/storyData.js`**:

- `coupleInfo`: tên, `startDate`, `tagline` (mảng 2 dòng cho intro typewriter).
- `stories`: mỗi chapter có `date`, `title`, `content`, `hiddenThought` (dòng
  suy nghĩ ẩn hiện khi bấm vào chapter trong Story World), `mood`, `image`
  (để `null` thì dùng gradient placeholder theo mood), `hasVoiceNote`, `locked`.
- `lockedChapterId` / `secretCode`: chapter nào bị khoá và mã mở khoá.
- `chatMessages`, `loveQuotes`, `finalLetter`, `musicSrc`/`trackTitle`.

## 🚀 Chạy local

```bash
cd love-story
npm install
npm run dev
```

Build thử production:

```bash
npm run build
npm run preview
```

## 🌐 Deploy lên GitHub Pages

`vite.config.js` đã cấu hình `base: './'` nên build chạy đúng trên GitHub
Pages dù tên repo là gì.

```bash
git init                      # nếu thư mục gốc chưa phải git repo
git add .
git commit -m "Love story cinematic experience"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main

cd love-story
npm run deploy                 # build + đẩy dist lên nhánh gh-pages
```

Sau đó: repo trên GitHub → **Settings → Pages** → **Source: Deploy from a
branch** → branch **`gh-pages`**, folder **`/ (root)`** → **Save**. Link
public hiện sau 1–2 phút dạng `https://<username>.github.io/<repo>/`. Sửa
nội dung xong, chạy lại `npm run deploy` để cập nhật.

## 📱 Tạo QR code từ link website

Có link public → dán vào trang tạo QR free (`qr-code-generator.com`,
`qrcode-monkey.com`) → tải QR → in ra thiệp/khung ảnh.

## 💡 Quyết định kỹ thuật & những gì đã **không** làm

- **Không dùng CSS `scroll-snap-mandatory` cho Story World.** Đã thử nhưng
  scroll-snap mandatory trên một trang dài nhiều section cao khác nhau dễ bị
  "kẹt"/giật trên mobile. Thay vào đó dùng section cao `min-h-svh` bình
  thường + animation `whileInView` — vẫn có cảm giác "từng chương" khi cuộn,
  nhưng scroll mượt và đáng tin cậy hơn trên mọi thiết bị.
- **Không làm "shake phone to unlock".** API `devicemotion` cần xin quyền
  riêng trên iOS Safari (popup khó chịu) và không hoạt động trên desktop —
  rủi ro UX cao hơn giá trị mang lại. 4 cách unlock hiện tại đã đủ thú vị.
- **"AI memory assistant" là mô phỏng**, không gọi API AI thật (ghi rõ
  trong code/UI) — vì app không có backend nên không có nơi an toàn để giữ
  API key. `MemoryAssistant` chỉ chọn ngẫu nhiên 1 chapter có sẵn.
- **Không crossfade nhạc theo từng chapter** (yêu cầu "sound fade in/out per
  chapter") — cần asset âm thanh riêng cho mỗi chapter mà project không có.
  Nhạc nền dùng chung 1 file qua `MusicToggle` (Spotify-style mini player).
- **Note & emotion slider trong Memory Gallery chỉ lưu local** (localStorage
  của trình duyệt), không sync giữa 2 người vì không có backend.
- Production build ~114KB JS gzip (438 module) — vẫn nhẹ dù đã thêm nhiều
  tính năng.
