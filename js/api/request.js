import axios from 'axios';
import { getToken, removeToken, removeUserInfo } from '../utils/auth.js';

// 创建 axios 实例
const service = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/api'  // 开发环境
        : '/api',                       // 生产环境（相对路径）
    timeout: 15000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }

        // 如果是GET请求，添加时间戳防止缓存
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: new Date().getTime()
            };
        }

        console.log('请求配置:', {
            url: config.url,
            method: config.method,
            params: config.params,
            data: config.data
        });

        return config;
    },
    error => {
        // 对请求错误做些什么
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        console.log('响应数据:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });

        const res = response.data;

        // 如果后端返回的状态码不是200，则认为是错误
        if (res.code && res.code !== 200) {
            // 401: 未登录或token过期
            if (res.code === 401) {
                removeToken();
                removeUserInfo();
                window.location.href = '/#/login';
                return Promise.reject(new Error(res.message || '用户未登录或登录已过期'));
            }

            // 403: 权限不足
            if (res.code === 403) {
                return Promise.reject(new Error(res.message || '没有权限执行此操作'));
            }

            // 其他错误
            return Promise.reject(new Error(res.message || '请求失败'));
        }

        // 如果直接返回数据（没有code字段）
        return res;
    },
    error => {
        // 对响应错误做点什么
        console.error('响应拦截器错误:', error);

        if (error.response) {
            // 请求已发出，服务器返回状态码不在2xx范围内
            switch (error.response.status) {
                case 400:
                    error.message = '请求参数错误';
                    break;
                case 401:
                    error.message = '未授权，请重新登录';
                    removeToken();
                    removeUserInfo();
                    window.location.href = '/#/login';
                    break;
                case 403:
                    error.message = '拒绝访问';
                    break;
                case 404:
                    error.message = '请求的资源不存在';
                    break;
                case 500:
                    error.message = '服务器内部错误';
                    break;
                case 502:
                    error.message = '网关错误';
                    break;
                case 503:
                    error.message = '服务不可用';
                    break;
                case 504:
                    error.message = '网关超时';
                    break;
                default:
                    error.message = `连接错误 ${error.response.status}`;
            }
        } else if (error.request) {
            // 请求已发出但没有收到响应
            error.message = '网络连接异常，请检查网络设置';
        } else {
            // 请求配置出错
            error.message = '请求配置错误';
        }

        // 显示错误提示（可根据需要集成UI组件）
        if (typeof window.showError === 'function') {
            window.showError(error.message);
        } else {
            console.error('错误信息:', error.message);
        }

        return Promise.reject(error);
    }
);

// 封装通用请求方法
const http = {
    // GET 请求
    get(url, params = {}, config = {}) {
        return service.get(url, {
            params,
            ...config
        });
    },

    // POST 请求
    post(url, data = {}, config = {}) {
        return service.post(url, data, config);
    },

    // PUT 请求
    put(url, data = {}, config = {}) {
        return service.put(url, data, config);
    },

    // DELETE 请求
    delete(url, params = {}, config = {}) {
        return service.delete(url, {
            params,
            ...config
        });
    },

    // 上传文件
    upload(url, file, config = {}) {
        const formData = new FormData();
        formData.append('file', file);

        return service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            ...config
        });
    },

    // 下载文件
    download(url, params = {}, filename = 'download') {
        return service.get(url, {
            params,
            responseType: 'blob'
        }).then(response => {
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        });
    }
};

// 导出默认实例和封装方法
export default service;
export { http };