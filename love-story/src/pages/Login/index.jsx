import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntdApp,
  Button,
  ConfigProvider,
  DatePicker,
  Flex,
  Form,
  Input,
  Space,
  Typography,
} from "antd";
import viVN from "antd/locale/vi_VN";
import {
  CalendarOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { setAuthenticated } from "../../utils/auth";
import { loginRequest } from "../../utils/api";
import { fetchPublicSettings, fileUrl } from "../../utils/loveStoryApi";

dayjs.locale("vi");

// Tài khoản đăng nhập được xác thực thật qua GraphQL (backend), xem `utils/api.js`.
// Ngày quan trọng là lớp kiểm tra riêng ở FE, giá trị lấy từ
// `LoveStory_public_settings` (BE) thay vì hardcode trong bundle như trước.
const MEETING_DATE_FORMAT = "DD/MM/YYYY";

// Đổi thay xoay vòng ở góc dưới ảnh — chỉ là gia vị cảm xúc, không ảnh hưởng logic.
const LOVE_QUOTES = [
  "Yêu không phải tìm một người hoàn hảo, mà là học cách nhìn một người không hoàn hảo một cách hoàn hảo.",
  "Có những ngày bình thường, nhưng ở cạnh nhau lại thấy chẳng ngày nào là bình thường cả.",
  "Nắm tay nhau đi qua vài mùa nắng mưa, rồi nhận ra hoá ra đó chính là hạnh phúc.",
  "Nhà không phải một nơi chốn, nhà là bất cứ đâu có em ở đó.",
  "Thương một người lâu dài không phải vì họ hoàn hảo, mà vì mỗi ngày đều chọn thương tiếp.",
  "Every love story is beautiful, but ours is my favorite.",
  "Chỉ cần là em, ngày nào cũng là một ngày đáng để mong chờ.",
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isMeetingDateValid(meetingDate, anniversaryPassword) {
  return Boolean(meetingDate) && meetingDate.format(MEETING_DATE_FORMAT) === anniversaryPassword;
}

function isFormValid(values) {
  return (
    Boolean(values.username?.trim()) &&
    Boolean(values.password) &&
    Boolean(values.meetingDate)
  );
}

async function validateCredential(username, password) {
  return loginRequest({ username: username.trim(), password });
}

const loginTheme = {
  token: {
    colorPrimary: "#fb7185",
    borderRadius: 16,
    controlHeightLG: 50,
    fontFamily: "inherit",
  },
  components: {
    Input: {
      activeShadow: "0 0 0 4px rgba(251, 113, 133, 0.15)",
      hoverBorderColor: "#fda4af",
    },
    DatePicker: {
      activeShadow: "0 0 0 4px rgba(251, 113, 133, 0.15)",
      hoverBorderColor: "#fda4af",
    },
    Button: { primaryShadow: "none" },
  },
};

function useLiveClock() {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const timerId = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return now;
}

function useRotatingQuote() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * LOVE_QUOTES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((current) => (current + 1) % LOVE_QUOTES.length);
        setVisible(true);
      }, 300);
    }, 6000);
    return () => clearInterval(intervalId);
  }, []);

  return { quote: LOVE_QUOTES[index], visible };
}

function LeftShowcase({ coupleInfo, heroBackground }) {
  const now = useLiveClock();
  const { quote, visible } = useRotatingQuote();
  const togetherSince = coupleInfo.startDate
    ? dayjs(coupleInfo.startDate).format(MEETING_DATE_FORMAT)
    : "";

  return (
    <div className="relative h-[38vh] w-full shrink-0 overflow-hidden md:h-full md:w-[55%] lg:w-[60%]">
      <img
        src={heroBackground}
        alt={`${coupleInfo.person1} & ${coupleInfo.person2}`}
        className="animate-ken-burns h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/20 via-transparent to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-8 lg:p-12">
        <Space align="center" size={8}>
          <span className="text-lg leading-none">❤️</span>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/90">
            Love Story
          </span>
        </Space>

        <div className="max-w-md space-y-5">
          <p className="font-serif text-2xl italic leading-snug text-white sm:text-3xl lg:text-[38px]">
            Every love story is beautiful,
            <br className="hidden sm:block" /> but ours is my favorite.
          </p>

          <div className="h-px w-12 bg-white/40" />

          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
              Together since
            </p>
            <p className="mt-1 text-xl font-semibold tracking-wide text-white sm:text-2xl">
              {togetherSince}
            </p>
          </div>

          <p className="hidden text-sm italic leading-relaxed text-white/75 sm:block">
            &ldquo;Our journey begins with one password, and countless beautiful
            memories.&rdquo;
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-white/20 pt-4">
          <p
            className={`max-w-[60%] text-xs italic leading-relaxed text-white/75 transition-opacity duration-300 sm:text-[13px] ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {quote}
          </p>
          <div className="shrink-0 text-right">
            <p className="font-mono text-lg font-medium tracking-wider text-white sm:text-xl">
              {now.format("HH:mm:ss")}
            </p>
            <p className="text-[11px] capitalize text-white/60">
              {now.format("dddd, DD MMMM YYYY")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginCard({ anniversaryPassword }) {
  const navigate = useNavigate();
  const { notification } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const values = Form.useWatch([], form) ?? {};
  const canSubmit = isFormValid(values);

  async function handleLogin(formValues) {
    if (!isMeetingDateValid(formValues.meetingDate, anniversaryPassword)) {
      notification.error({
        title: "Không thể đăng nhập",
        description: "Ngày đầu tiên gặp nhau chưa đúng ❤️",
        placement: "top",
      });
      return;
    }

    setSubmitting(true);
    const { token, tenant, error } = await validateCredential(
      formValues.username,
      formValues.password
    );

    if (error) {
      setSubmitting(false);
      notification.error({
        title: "Không thể đăng nhập",
        description: error,
        placement: "top",
      });
      return;
    }

    setAuthenticated(token, tenant);
    await wait(800);
    notification.success({
      title: "Chào mừng trở về 🤍",
      description: "Đang đưa bạn vào thế giới của hai người...",
      placement: "top",
    });
    setLeaving(true);
    await wait(320);
    navigate("/home", { replace: true });
  }

  return (
    <div
      className={`w-full max-w-[400px] transition-opacity duration-300 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-fade-in-up rounded-[28px] border border-rose-100/70 bg-white/80 px-7 py-9 shadow-[0_25px_70px_-20px_rgba(190,24,93,0.18)] backdrop-blur-xl sm:px-9 sm:py-10 md:px-7 md:py-9 lg:px-9 lg:py-10">
        <Flex vertical align="center" gap={8} className="mb-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100 text-2xl shadow-inner shadow-rose-200/60">
            ❤️
          </span>
          <Typography.Text className="!text-xs !font-semibold !uppercase !tracking-[0.3em] !text-rose-400">
            Love Story
          </Typography.Text>
          <Typography.Title
            level={2}
            className="!m-0 !text-[26px] !font-semibold !tracking-tight !text-neutral-900"
          >
            Welcome Back
          </Typography.Title>
          <Typography.Text className="!text-sm !leading-relaxed !text-neutral-500">
            Enter your memories to continue your journey together.
          </Typography.Text>
        </Flex>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="text-rose-300" />}
              placeholder="Enter username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-rose-300" />}
              placeholder="Enter password"
            />
          </Form.Item>

          <Form.Item
            name="meetingDate"
            label="Ngày gặp nhau"
            rules={[{ required: true, message: "Vui lòng chọn ngày gặp nhau" }]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format={MEETING_DATE_FORMAT}
              placeholder="Choose our first meeting day"
              suffixIcon={<CalendarOutlined className="text-rose-300" />}
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
              className="!rounded-full !bg-gradient-to-r !from-rose-400 !to-rose-500 !font-medium !tracking-wide !shadow-lg !shadow-rose-300/40 !transition-transform !duration-300 hover:!scale-[1.02] hover:!shadow-rose-400/50 active:!scale-[0.99]"
            >
              Enter Our World ❤️
            </Button>
          </Form.Item>
        </Form>
      </div>

      <p className="mt-6 text-center text-xs italic text-neutral-400">
        A private space, made only for the two of us.
      </p>
    </div>
  );
}

const DEFAULT_COUPLE_INFO = { person1: "", person2: "", startDate: "" };

function usePublicSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setSettings({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    coupleInfo: {
      person1: settings?.couple_person1 || DEFAULT_COUPLE_INFO.person1,
      person2: settings?.couple_person2 || DEFAULT_COUPLE_INFO.person2,
      startDate: settings?.start_date || DEFAULT_COUPLE_INFO.startDate,
    },
    heroBackground: fileUrl(settings?.FILE_HERO_BACKGROUND),
    anniversaryPassword: settings?.anniversary_password || "",
  };
}

function LoginScreen() {
  const { coupleInfo, heroBackground, anniversaryPassword } = usePublicSettings();

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-y-auto bg-white md:h-screen md:flex-row md:overflow-hidden">
      <LeftShowcase coupleInfo={coupleInfo} heroBackground={heroBackground} />
      <div className="flex w-full flex-1 items-center justify-center bg-gradient-to-br from-white via-white to-rose-50/70 px-6 py-10 sm:px-10 md:w-[45%] md:overflow-y-auto lg:w-[40%]">
        <LoginCard anniversaryPassword={anniversaryPassword} />
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <ConfigProvider theme={loginTheme} locale={viVN}>
      <AntdApp>
        <LoginScreen />
      </AntdApp>
    </ConfigProvider>
  );
}
