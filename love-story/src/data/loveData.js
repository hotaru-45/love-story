// ============================================================
//  ✏️  Sửa toàn bộ nội dung của website ở file này.
//  Đổi tên, ngày, mốc kỷ niệm, ảnh, lời nhắn... đều ở đây.
// ============================================================

export const coupleInfo = {
  person1: "Duy",
  person2: "Thảo",
  // Ngày bắt đầu yêu nhau (giờ địa phương), dùng cho đồng hồ đếm ngược
  startDate: "2025-12-24T00:00:00",
  tagline: "Hai trái tim, một câu chuyện.",
};

// Mỗi mốc trong timeline. `image: null` sẽ hiện placeholder gradient,
// chỉ cần điền `image: yourImportedImage` để thay bằng ảnh thật.
export const timelineEvents = [
  {
    id: 1,
    date: "14/02/2022",
    title: "Lần đầu gặp nhau",
    description:
      "Một buổi chiều rất bình thường, nhưng lại là khởi đầu cho một câu chuyện không bình thường. Ánh mắt đầu tiên ấy, mình vẫn còn nhớ rõ.",
    image: null,
    emoji: "✨",
  },
  {
    id: 2,
    date: "20/02/2022",
    title: "Lần đầu nhắn tin",
    description:
      'Tin nhắn "chào bạn" ngại ngùng đã mở ra hàng ngàn tin nhắn sau đó. Ai mà biết được một câu chào lại dẫn đến một mối tình.',
    image: null,
    emoji: "💬",
  },
  {
    id: 3,
    date: "08/03/2022",
    title: "Lần đầu hẹn hò",
    description:
      "Buổi hẹn đầu tiên, tim đập nhanh hơn bình thường. Quán cà phê nhỏ, hai ly nước, và một cuộc trò chuyện không muốn kết thúc.",
    image: null,
    emoji: "☕",
  },
  {
    id: 4,
    date: "14/02/2023",
    title: "Kỷ niệm 1 năm",
    description:
      "Một năm đầu tiên bên nhau, với rất nhiều lần cười, vài lần giận, và muôn vàn lý do để yêu nhau nhiều hơn mỗi ngày.",
    image: null,
    emoji: "🎉",
  },
];

// Ảnh gallery dạng grid kiểu Instagram. `src: null` sẽ hiện placeholder.
// Để thêm ảnh thật: import ảnh ở đầu file rồi gán vào `src`.
export const galleryImages = [
  { id: 1, src: null, caption: "Khoảnh khắc đáng nhớ #1", emoji: "📸" },
  { id: 2, src: null, caption: "Khoảnh khắc đáng nhớ #2", emoji: "🌅" },
  { id: 3, src: null, caption: "Khoảnh khắc đáng nhớ #3", emoji: "🍰" },
  { id: 4, src: null, caption: "Khoảnh khắc đáng nhớ #4", emoji: "🌃" },
  { id: 5, src: null, caption: "Khoảnh khắc đáng nhớ #5", emoji: "🎈" },
  { id: 6, src: null, caption: "Khoảnh khắc đáng nhớ #6", emoji: "🌸" },
];

export const loveLetter = {
  title: "Thư gửi người ấy 💌",
  paragraphs: [
    "Em à, có những điều anh chưa từng nói ra nhưng luôn nghĩ trong lòng. Cảm ơn em vì đã xuất hiện và biến những ngày bình thường thành những kỷ niệm anh muốn giữ mãi.",
    "Có thể chúng ta không hoàn hảo, nhưng những gì chúng ta dành cho nhau lại rất thật. Mỗi ngày bên em là một ngày anh thấy mình muốn cố gắng nhiều hơn.",
    "Mong rằng dù mai này có ra sao, mình vẫn sẽ nắm tay nhau đi qua hết những chặng đường còn lại. Yêu em, hôm nay và mãi về sau.",
  ],
  signature: "— Người yêu em nhất",
};

export const footerInfo = {
  madeBy: coupleInfo.person1,
};

// Để bật nhạc nền: bỏ file mp3 của bạn vào `public/music/bg-music.mp3`
export const musicSrc = "./music/bg-music.mp3";
