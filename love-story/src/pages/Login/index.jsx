import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntdApp,
  Button,
  ConfigProvider,
  Form,
  Input,
  theme as antdTheme,
} from "antd";
import viVN from "antd/locale/vi_VN";
import {
  CalendarOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  anniversaryPassword,
  coupleInfo,
  heroBackground,
} from "../../data/storyData";
import { setAuthenticated } from "../../utils/auth";
import { loginRequest } from "../../utils/api";

// Tài khoản đăng nhập được xác thực thật qua GraphQL (backend), xem `utils/api.js`.
// Ngày quan trọng là lớp kiểm tra riêng ở FE (backend hiện chưa có field này),
// dùng chung mốc kỷ niệm khai báo trong storyData.
const MEETING_DATE = anniversaryPassword; // định dạng DD/MM/YYYY

// Gõ số tự động chèn "/" — nhanh hơn hẳn việc mở lịch chọn từng ngày.
function formatDateInput(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join("/");
}

function isMeetingDateValid(meetingDate) {
  return meetingDate === MEETING_DATE;
}

function areAllFieldsFilled(values) {
  return (
    Boolean(values.username?.trim()) &&
    Boolean(values.password) &&
    Boolean(values.meetingDate)
  );
}

const loginTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: "#fb7185",
    colorBgContainer: "rgba(255, 255, 255, 0.06)",
    colorBorder: "rgba(255, 255, 255, 0.16)",
    colorText: "#fdf2f8",
    colorTextPlaceholder: "rgba(253, 242, 248, 0.4)",
    colorBgElevated: "#2a1420",
    borderRadius: 14,
    controlHeightLG: 48,
    fontFamily: "inherit",
  },
  components: {
    Input: { activeShadow: "0 0 0 3px rgba(251, 113, 133, 0.25)" },
    Button: { primaryShadow: "none" },
  },
};

function LoginForm() {
  const navigate = useNavigate();
  const { notification } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const values = Form.useWatch([], form) ?? {};
  const canSubmit = areAllFieldsFilled(values);

  async function handleSubmit(formValues) {
    if (!isMeetingDateValid(formValues.meetingDate)) {
      notification.error({
        title: "Không thể đăng nhập",
        description: "Ngày quan trọng của hai đứa không chính xác ❤️",
        placement: "top",
      });
      return;
    }

    setSubmitting(true);
    const { token, error } = await loginRequest({
      username: formValues.username.trim(),
      password: formValues.password,
    });
    setSubmitting(false);

    if (error) {
      notification.error({
        title: "Không thể đăng nhập",
        description: error,
        placement: "top",
      });
      return;
    }

    notification.success({
      title: "Chào mừng trở về 🤍",
      description: "Đang đưa bạn vào thế giới của hai người...",
      placement: "top",
    });
    setAuthenticated(token);
    setTimeout(() => navigate("/home", { replace: true }), 500);
  }

  return (
    <div className="animate-fade-in-up w-full max-w-[420px]">
      <div className="rounded-[28px] border border-white/15 bg-white/[0.07] px-7 py-10 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:px-9 sm:py-11">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl shadow-inner shadow-black/20">
            ❤️
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Love Story
          </h1>
          <div className="space-y-1">
            <p className="text-[15px] font-medium text-rose-100">
              Chào mừng trở về
            </p>
            <p className="text-sm leading-relaxed text-rose-200/60">
              Hãy đăng nhập để tiếp tục hành trình của {coupleInfo.person1}{" "}
              &amp; {coupleInfo.person2}
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label={<span className="text-rose-100/80">Tên đăng nhập</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="text-rose-200/50" />}
              placeholder="Tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-rose-100/80">Mật khẩu</span>}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-rose-200/50" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="meetingDate"
            label={
              <span className="text-rose-100/80">
                Ngày quan trọng của hai đứa
              </span>
            }
            getValueFromEvent={(e) => formatDateInput(e.target.value)}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập ngày quan trọng của hai đứa",
              },
            ]}
          >
            <Input
              size="large"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              prefix={<CalendarOutlined className="text-rose-200/50" />}
              placeholder="Nhớ Ngày Nào Hông Đó"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-8">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
              disabled={!canSubmit}
              className="!h-12 !rounded-full !font-medium !shadow-lg !shadow-rose-500/20"
            >
              Bước vào thế giới của chúng ta
            </Button>
          </Form.Item>
        </Form>
      </div>

      <p className="mt-6 text-center text-xs italic text-rose-200/40">
        Every love story is beautiful, but ours is my favorite.
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <ConfigProvider theme={loginTheme} locale={viVN}>
      <AntdApp>
        <div className="relative min-h-svh w-full overflow-hidden bg-[#150a12]">
          <div className="absolute inset-0">
            <img
              src={heroBackground}
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-105 object-cover object-center blur-[2px] brightness-[0.5]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/40 via-transparent to-purple-950/30" />
          </div>

          <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
            <LoginForm />
          </div>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}
