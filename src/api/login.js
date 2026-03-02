import request from '@/utils/request';

export const fetchLogin = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data
  });
};
// 获取验证码
export const fetchCaptchaImage = () => {
  return request({
    url: '/captchaImage',
    method: 'get',
  });
};
