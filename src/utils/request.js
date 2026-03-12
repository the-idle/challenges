import axios from 'axios';
import { message } from 'antd';

const resolveBaseURL = () => {
    const envBaseURL = import.meta.env.VITE_API_BASE_URL;
    if (envBaseURL && String(envBaseURL).trim()) {
        return String(envBaseURL).trim();
    }
    return '/api';
};

const request = axios.create({
    baseURL: resolveBaseURL(),
    timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么，例如添加 token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 对请求错误做些什么
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    response => {
        const res = response.data;
        if (response.config?.skipBusinessCheck) {
            return res;
        }

        // 检查响应数据中的 code
        if (res.code === 401) {
            // 清除本地存储的 token
            localStorage.removeItem('token');

            // 显示提示消息
            message.error(res.msg || '登录已过期，请重新登录');

            // 延迟跳转到登录页面，让用户看到提示消息
            setTimeout(() => {
                // 使用 window.location.href 进行硬跳转，确保完全刷新页面
                window.location.href = '/login';
            }, 1500);

            return Promise.reject(new Error(res.msg || '登录已过期'));
        }

        // 处理其他业务错误
        if (res.code !== 0 && res.code !== 200) {
            console.error('业务错误:', res.msg || 'Error');
            if (!response.config?.silentError) {
                message.error(res.msg || 'Error');
            }
            return Promise.reject(new Error(res.msg || 'Error'));
        }

        return res;
    },
    error => {
        console.error('响应错误:', error);

        // 处理 HTTP 错误状态码
        if (error.response) {
            const { status } = error.response;

            // 处理 HTTP 401 状态码
            if (status === 401) {
                // 清除本地存储的 token
                localStorage.removeItem('token');

                // 显示提示消息
                message.error('登录已过期，请重新登录');

                // 延迟跳转到登录页面，让用户看到提示消息
                setTimeout(() => {
                    // 使用 window.location.href 进行硬跳转，确保完全刷新页面
                    window.location.href = '/login';
                }, 1500);

                return Promise.reject(error);
            }
        }
        if (!error.config?.silentError) {
            message.error(error.message || '服务器错误');
        }
        return Promise.reject(error);
    }
);

export default request;
