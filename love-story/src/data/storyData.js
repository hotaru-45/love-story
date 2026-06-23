// ============================================================
//  ✏️  Sửa toàn bộ nội dung của website ở file này.
//  Đổi tên, ngày, mốc kỷ niệm, ảnh, chat, thư cuối... đều ở đây.
// ============================================================
import heroBackgroundImg from "../assets/hình_em_đẹp_background.png";
import finalBackgroundImg from "../assets/hình_em_đẹp_background2.png";
import emGianImg from "../assets/hình_em_giận.png";
import thuyCung1Img from "../assets/2_đứa_đi_thuỷ_cung.png";
import thuyCungEmImg from "../assets/hình_em_ở_thuỷ_cung.png";
import daoThanhAnImg from "../assets/2_đứa_đi_đảo_thạnh_an.png";
import vungTau1Img from "../assets/hình_2_đứa_đi_vũng_tàu.png";
import vungTau2Img from "../assets/hình_2_đứa_đi_vũng_tàu2.png";
import longAnImg from "../assets/đi_chơi_ở_long_an.png";
import capheImg from "../assets/2_đứa_đi_cà_phê.png";
import longAn2Img from "../assets/2_đứa_đi_long_an.png";
import sixthangImg from "../assets/quà_6th.png";
import aPiccher from "../assets/a.png";
import bPiccher from "../assets/b.png";

export const coupleInfo = {
  person1: "Khánh Duy",
  person2: "Phương Thảo",
  startDate: "2025-12-24T00:00:00",
  tagline: [
    "Đây không chỉ là một trang web…",
    "Đây là cả vũ trụ kỷ niệm của chúng mình.",
  ],
};

export const moodMeta = {
  happy: {
    label: "Vui",
    emoji: "😄",
    gradient: "from-amber-300 via-orange-300 to-pink-400",
  },
  sad: {
    label: "Lắng đọng",
    emoji: "🥺",
    gradient: "from-slate-400 via-indigo-400 to-slate-600",
  },
  funny: {
    label: "Hài hước",
    emoji: "😂",
    gradient: "from-yellow-300 via-lime-300 to-emerald-400",
  },
  deep: {
    label: "Sâu lắng",
    emoji: "🌙",
    gradient: "from-indigo-400 via-purple-500 to-rose-500",
  },
};

// Mỗi "chapter" trong câu chuyện. `image: null` sẽ hiện placeholder gradient
// theo mood — chỉ cần import ảnh thật rồi gán vào field `image` để thay thế.
// Dữ liệu này dùng lại cho StoryEngine, TimelineMap, MemoryGallery, ChatReplay.
// `locked: true` = chapter chỉ mở khi người dùng unlock qua UnlockSystem
// (xem `secretCode` + cách unlock trong README). Chỉ nên khoá chapter
// "bonus" — đừng khoá kỷ niệm thật, tránh làm khó người nhận quà.
export const stories = [
  {
    id: 1,
    date: "24/12/2025",
    title: "Lần đầu gặp nhau",
    content:
      "Một buổi chiều rất bình thường, nhưng lại là khởi đầu cho một câu chuyện không bình thường. Mình đã đứng đó, ngại ngùng không biết bắt đầu câu chuyện từ đâu. Ánh mắt đầu tiên ấy, đến giờ vẫn còn nhớ rõ như mới hôm qua.",
    hiddenThought: 'Lúc đó mình đã nghĩ: "người này có gì đó khác lắm."',
    mood: "happy",
    image: aPiccher,
    hasVoiceNote: true,
    locked: false,
  },
  {
    id: 2,
    date: "26/12/2025",
    title: "Lần đầu nhắn tin",
    content:
      'Một tin nhắn "chào bạn" ngại ngùng, gõ đi xoá lại không biết bao nhiêu lần, cuối cùng cũng bấm gửi. Ai mà ngờ được một câu chào đơn giản như vậy lại mở ra hàng ngàn tin nhắn, hàng trăm đêm thức khuya trò chuyện sau đó.',
    hiddenThought: "Mình đã gõ lại câu đó ít nhất 5 lần trước khi gửi.",
    mood: "funny",
    image: bPiccher,
    hasVoiceNote: false,
    locked: false,
  },
  {
    id: 3,
    date: "01/01/2026",
    title: "Lần đầu hẹn hò",
    content:
      "Buổi hẹn đầu tiên, tim đập nhanh hơn bình thường gấp mấy lần. Bờ kè sông Sài Gòn, hai ly nước chưa kịp uống đã nguội vì mải nói chuyện. Một cuộc trò chuyện mà cả hai đều không muốn nó kết thúc.",
    hiddenThought: "Mình đã chọn áo tới 3 lần trước khi ra cửa.",
    mood: "happy",
    image: capheImg,
    hasVoiceNote: true,
    locked: false,
  },
  {
    id: 4,
    date: "20/01/2026",
    title: "Lần đầu cãi nhau",
    content:
      "Chuyện to cũng có chuyện nhỏ cũng có, Nhưng rồi ai cũng là người chủ động nhắn lại trước. Hoá ra giận nhau cũng là một cách để hiểu nhau hơn một chút.",
    hiddenThought: "Thật ra lúc đó chỉ sợ một điều: mất nhau.",
    mood: "sad",
    image: emGianImg,
    hasVoiceNote: false,
    locked: false,
  },
  {
    id: 5,
    date: "14/02/2026",
    title: "Valentine đầu tiên",
    content:
      "Không cần gì cầu kỳ, chỉ cần ngồi cạnh nhau tâm sự ăn uống ( ăn thịt thỏ) cũng đủ thấy ấm. Đó là lúc mình nhận ra, hạnh phúc đôi khi chỉ đơn giản là có người đó ở bên.",
    hiddenThought: "Mình đã âm thầm chụp lại khoảnh khắc đó, không nói gì.",
    mood: "deep",
    image: heroBackgroundImg,
    hasVoiceNote: true,
    locked: false,
  },
  {
    id: 6,
    date: "24/06/2026",
    title: "Kỷ niệm 6 tháng",
    content:
      "Sáu tháng đầu tiên bên nhau, với rất nhiều lần cười, vài lần giận, và muôn vàn lý do để yêu nhau nhiều hơn mỗi ngày. Chặng đường còn dài, nhưng mình tin cả hai sẽ luôn nắm tay nhau đi qua hết.",
    hiddenThought: "Mình mong sáu tháng tiếp theo cũng sẽ nhiều như vậy.",
    mood: "deep",
    image: sixthangImg,
    hasVoiceNote: false,
    locked: false,
  },
  {
    id: 7,
    date: "???",
    title: "🔓 Ký ức bí mật",
    content:
      "Bạn đã tìm ra góc nhỏ bí mật này rồi! Đây là điều mà chỉ có hai người mới biết: cảm ơn vì đã luôn kiên nhẫn, luôn dịu dàng, và luôn chọn ở lại dù mọi thứ không hoàn hảo. Đây là một ký ức chỉ dành riêng cho bạn. 💕",
    hiddenThought: "Cảm ơn vì đã tò mò đủ để tìm ra điều này.",
    mood: "deep",
    image: longAn2Img,
    hasVoiceNote: false,
    locked: true,
  },
];

// Ảnh nền cinematic — hiện ở đầu (HomeIntro) và cuối (FinalLetter) hành trình.
export const heroBackground = vungTau2Img;
export const finalBackground = finalBackgroundImg;

// Ảnh kỷ niệm rời (không gắn với 1 chapter cụ thể) — hiện ở MemoryGallery,
// click để xem lớn. Thêm/xoá/đổi caption tự do ở đây.
export const galleryPhotos = [
  { id: 1, src: thuyCung1Img, caption: "Hai đứa đi thuỷ cung 🐠" },
  { id: 2, src: thuyCungEmImg, caption: "Em ở thuỷ cung 🐡" },
  { id: 3, src: daoThanhAnImg, caption: "Hai đứa đi đảo Thạnh An ⛵" },
  { id: 4, src: vungTau1Img, caption: "Hai đứa đi Vũng Tàu 🌊" },
  { id: 5, src: vungTau2Img, caption: "Vũng Tàu, lần nữa 🌅" },
  { id: 6, src: longAnImg, caption: "Đi chơi ở Long An 🌾" },
];

// id của chapter bị khoá — UnlockSystem sẽ mở chapter này.
export const lockedChapterId = 7;

// Mã bí mật để mở chapter khoá qua UnlockSystem (không phân biệt hoa thường).
export const secretCode = "ourstory";

// Tin nhắn chat kỷ niệm. `storyId` (nếu có) link tới chapter trong `stories`
// để bấm vào "expand context" mở thẳng StoryViewer.
export const chatMessages = [
  {
    id: 1,
    sender: "me",
    text: "Đang nói đến đây rồi chị",
    time: "23:53",
    storyId: 1,
  },
  {
    id: 2,
    sender: "her",
    text: "À nhớ rồi, hôm đó chị cũng ngại quá đi 😂",
    time: "20:15",
    storyId: 2,
  },

  {
    id: 4,
    sender: "me",
    text: "Cuối tuần đi uống nước không?",
    time: "21:03",
    storyId: 3,
  },
  {
    id: 5,
    sender: "her",
    text: "Ok đó, hẹn 8h tối nha",
    time: "21:05",
    storyId: 3,
  },
  {
    id: 6,
    sender: "me",
    text: "Anh có chuyện muốn nói với em 🙄",
    time: "22:40",
    storyId: 4,
  },
  {
    id: 7,
    sender: "her",
    text: "...",
    time: "23:58",
    storyId: 4,
  },
  {
    id: 8,
    sender: "her",
    text: "Happy Valentine ❤️",
    time: "08:00",
    storyId: 5,
  },
  {
    id: 9,
    sender: "me",
    text: "6 tháng rồi đó, cảm ơn em vì đã ở đây 🥹",
    time: "09:12",
    storyId: 6,
  },
];

export const loveQuotes = [
  "Yêu không phải tìm một người hoàn hảo, mà là học cách nhìn một người không hoàn hảo theo cách hoàn hảo nhất.",
  "Có những ngày bình thường, nhưng có em, ngày nào cũng trở nên đặc biệt.",
  "Hạnh phúc là khi cùng một người, mỗi ngày đều muốn kể thêm một câu chuyện mới.",
  "Anh không hứa sẽ cho em cả thế giới, chỉ hứa sẽ luôn ở đó khi em quay lại nhìn.",
  "Tình yêu đẹp nhất là khi cả hai cùng chọn nhau, mỗi ngày, không chỉ một lần.",
];

export const finalLetter = {
  intro: [
    "Nếu bạn đang đọc được những dòng này…",
    "Nghĩa là bạn đã đi đến cuối hành trình kỷ niệm của chúng mình.",
  ],
  title: "Lá thư cuối 💌",
  paragraphs: [
    "Cảm ơn vì đã dành thời gian đi qua hết hành trình nhỏ này cùng mình, từng chương, từng kỷ niệm.",
    "Có thể chúng ta không hoàn hảo, nhưng những gì dành cho nhau lại rất thật. Mỗi ngày bên nhau là một ngày đáng để biết ơn.",
    "Mong rằng dù mai này có ra sao, mình vẫn sẽ nắm tay nhau đi qua hết những chặng đường còn lại. Yêu bạn, hôm nay và mãi về sau.",
  ],
  signature: "— Người yêu bạn nhất",
};

export const footerInfo = {
  madeBy: coupleInfo.person1,
};

// Để bật nhạc nền: bỏ file mp3 của bạn vào `public/music/bg-music.mp3`
export const musicSrc = "./music/bg-music.mp3";
export const trackTitle = `${coupleInfo.person1} & ${coupleInfo.person2} — Bài Hát Của Chúng Mình`;
