const SECRET = {
  SECRET_TOKEN: process.env.SECRET_TOKEN || 'change_this_secret_token',
  SECRET_PASS: process.env.SECRET_PASS || 'change_this_secret_pass',
};
const SECRET_MASTER = {
  SECRET_TOKEN: process.env.SECRET_TOKEN_MASTER || 'change_this_master_token',
  SECRET_PASS: process.env.SECRET_PASS_MASTER || 'change_this_master_pass',
};

const MASTER_LOGIN = {
  MAX_LOGIN: +process.env.MASTER_MAX_LOGIN || 5, // số lần đăng nhập sai tối đa
  LOCKOUT_TIME: +process.env.MASTER_LOCKOUT_TIME || 30, // số phút bị khóa
};

// Lưu ảnh upload qua Cloudinary thay vì đĩa local — Render free tier không
// giữ file giữa các lần deploy/restart (ephemeral disk).
const CLOUDINARY = {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  API_KEY: process.env.CLOUDINARY_API_KEY || '',
  API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

const MANAGER_STAGE = 'MANAGER_STAGE';
const MANAGER_HEADQUARTER = 'MANAGER_HEADQUARTER';
const MANAGER_STORE = 'MANAGER_STORE';
const MANAGER_ORG = 'MANAGER_ORG';
const MANAGER_USER = 'MANAGER_USER';
const MANAGER_CAR = 'MANAGER_CAR';

const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  str = str.replace(/ |,/g, '-');
  str = str.replaceAll('.', '');
  str = str.replaceAll('+', '');
  str = str.replaceAll('/', '-');
  str = str.replace(/̀|́|̃|̉|̣/g, '');
  str = str.replace(/ˆ|̆|̛/g, '');
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  return str;
};

module.exports = {
  removeVietnameseTones,
  SECRET,
  SECRET_MASTER,
  MASTER_LOGIN,
  CLOUDINARY,
  MANAGER_STAGE,
  MANAGER_HEADQUARTER,
  MANAGER_STORE,
  MANAGER_ORG,
  MANAGER_USER,
  MANAGER_CAR,
};
