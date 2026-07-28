// ============================================================
//  ✏️  Cấu hình "Monthly Love Letter" — thư kỷ niệm xuất hiện vào
//  đúng ngày (trong tháng) mà hai người gặp nhau, mỗi tháng một lần.
//  Đổi ngày, bật/tắt, hoặc thêm thư theo tháng ở file này.
// ============================================================
// Ngày hai người gặp nhau — chỉ phần ngày (dd) được dùng để tính lại
// "ngày kỷ niệm" mỗi tháng, không phụ thuộc vào năm. `coupleInfo.startDate`
// giờ được quản lý ở BE (xem Settings), còn giá trị dưới đây chỉ là fallback
// tĩnh khớp với ngày bắt đầu ban đầu — đổi tay ở đây nếu ngày đó đổi.
export const loveLetterConfig = {
  anniversaryDate: "2025-12-24", // 'YYYY-MM-DD'
};

// Cờ điều khiển tính năng.
// - enabled: tắt hẳn tính năng nếu false.
// - forceShow: CHỈ dùng khi dev/demo để xem trước UI ngay lập tức,
//   không cần chờ đúng ngày kỷ niệm. Nhớ để `false` khi lên thật.
// - anniversaryDay: đặt một số 1-31 để override ngày kỷ niệm lúc test;
//   để `null` sẽ tự lấy theo `loveLetterConfig.anniversaryDate`.
export const LOVE_LETTER_CONFIG = {
  enabled: true,
  forceShow: true,
  anniversaryDay: null,
};

// Thư mặc định — dùng cho những tháng chưa có thư riêng bên dưới.
export const defaultMonthlyLetter = {
  id: "monthly-default",
  title: "Một tháng nữa mình bên nhau 💌",
  subtitle: "Gửi em, người anh thương nhất",
  content: `
    Vậy là chúng ta lại cùng nhau đi qua thêm một tháng nữa rồi.

    Thời gian trôi nhanh thật, nhưng điều anh thấy may mắn nhất là trong những ngày tháng ấy, anh vẫn có em ở bên cạnh.

    Cảm ơn em vì đã xuất hiện trong cuộc đời anh.
    Cảm ơn em vì đã cùng anh tạo nên những kỷ niệm thật đẹp.

    Có thể mỗi ngày chúng ta đều bận rộn với những điều riêng,
    nhưng anh mong rằng chúng ta sẽ luôn dành cho nhau một vị trí thật đặc biệt trong tim.

    Chúc mừng ngày chúng ta gặp nhau tháng này nhé.

    Anh yêu em.
    Hôm nay, ngày mai và cả những ngày sau nữa. ❤️
  `,
  signature: "Người luôn yêu em Khánh Duy ❤️",
};

// Thư riêng theo từng tháng — `month` là 1-12. Tháng nào chưa có ở đây
// sẽ tự dùng `defaultMonthlyLetter`. Cứ thêm dần cho tới khi đủ 12 tháng.
export const monthlyLoveLetters = [
  {
    id: "monthly-01",
    month: 1,
    title: "Tháng của lần đầu tiên",
    subtitle: "Gửi em, người anh thương nhất",
    content: `
      Tháng này làm anh nhớ lại cái ngày đầu tiên mình gặp nhau — cái ngại ngùng không biết bắt đầu câu chuyện từ đâu, ánh mắt lướt qua rồi lại vội tránh đi.

      Ai mà ngờ được, từ một buổi tối rất bình thường ấy, lại thành ra cả một hành trình dài đến tận bây giờ.

      Mỗi lần ngày kỷ niệm quay lại, anh lại thấy biết ơn cái khoảnh khắc mình đã không bỏ lỡ em.

      Cảm ơn em vì đã đồng ý bước vào câu chuyện của anh, và ở lại đó đến tận hôm nay.

      Yêu em, từ ngày đầu tiên ấy đến mãi sau này.
    `,
    signature: "Người luôn yêu em ❤️",
  },
  {
    id: "monthly-02",
    month: 2,
    title: "Một tháng nữa, vẫn chọn em",
    subtitle: "Gửi người thương của anh",
    content: `
      Tháng này có Valentine, nhưng thật ra với anh, ngày nào có em cũng đã là một ngày lễ rồi.

      Anh không giỏi nói những lời hoa mỹ, chỉ biết là mỗi sáng thức dậy nghĩ đến em, anh lại thấy có thêm một lý do để cố gắng.

      Cảm ơn em vì đã kiên nhẫn với một người đôi lúc còn vụng về trong cách thể hiện như anh.

      Nếu được chọn lại từ đầu, anh vẫn sẽ chọn em, không đổi.

      Chúc mừng ngày mình gặp nhau tháng này, em yêu.
    `,
    signature: "Người luôn thương em ❤️",
  },
  {
    id: "monthly-06",
    month: 6,
    title: "Nửa năm, và còn dài lâu nữa",
    subtitle: "Gửi em, mảnh ghép của anh",
    content: `
      Ngồi tính lại mới thấy mình đã đi cùng nhau được một khoảng thời gian không hề ngắn.

      Có những ngày vui đến mức chỉ muốn thời gian ngừng lại, cũng có những ngày giận nhau chỉ vì những chuyện rất nhỏ. Nhưng đi qua hết, mình vẫn ở đây, vẫn chọn nắm tay nhau.

      Anh không hứa mọi thứ sẽ luôn dễ dàng, chỉ hứa sẽ luôn cố gắng cùng em đi tiếp.

      Cảm ơn em vì khoảng thời gian vừa qua, và cảm ơn trước cho những chặng đường sắp tới.

      Chúc mừng ngày kỷ niệm tháng này của chúng mình.
    `,
    signature: "Người đồng hành của em ❤️",
  },
  {
    id: "monthly-12",
    month: 12,
    title: "Về lại nơi mình bắt đầu",
    subtitle: "Gửi em, người anh thương nhất",
    content: `
      Tháng này là tháng mình chính thức bắt đầu — cái ngày mà một tin nhắn ngại ngùng đã mở ra tất cả những điều đang có bây giờ.

      Nhìn lại có vui, có buồn, có cả những lúc mệt mỏi muốn buông, nhưng cuối cùng điều còn lại vẫn là em, vẫn là mình.

      Cảm ơn em vì quãng thời gian đã qua đầy ắp kỷ niệm.

      Anh mong những tháng ngày phía trước, mình vẫn sẽ tiếp tục viết thêm câu chuyện của hai đứa, chậm rãi, nhưng chắc chắn.

      Yêu em, hôm nay và những ngày sau nữa.
    `,
    signature: "Người luôn yêu em ❤️",
  },
];

export function getMonthlyLetter(month) {
  return (
    monthlyLoveLetters.find((letter) => letter.month === month) ??
    defaultMonthlyLetter
  );
}
