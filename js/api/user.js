(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 本地存储操作
    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const setToken = (token, remember = false) => {
        if (remember) localStorage.setItem('token', token);
        else sessionStorage.setItem('token', token);
    };
    const setUserInfo = (userInfo, remember = false) => {
        const data = JSON.stringify(userInfo);
        if (remember) localStorage.setItem('userInfo', data);
        else sessionStorage.setItem('userInfo', data);
    };
    const removeAuthData = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
    };

    // 用户认证和资料管理 API
    window.userApi = {
        // 【认证模块-1】用户注册
        register: function (username, password, email) {
            if (!username || username.length < 3) {
                return Promise.resolve({ success: false, message: '用户名至少需要3个字符' });
            }
            if (!password || password.length < 6) {
                return Promise.resolve({ success: false, message: '密码至少需要6个字符' });
            }

            return http.post('/auth/register', { username, password, email })
                .then(res => ({
                    success: true,
                    message: '注册成功',
                    userId: res.userId || res.id,
                    user: res
                }))
                .catch(error => ({
                    success: false,
                    message: error.message || '注册失败，用户名可能已存在'
                }));
        },

        // 【认证模块-2】用户登录
        login: function (username, password, rememberMe = false) {
            return http.post('/auth/login', { username, password })
                .then(res => {
                    if (res.token) {
                        setToken(res.token, rememberMe);
                        if (res.user) setUserInfo(res.user, rememberMe);
                        return {
                            success: true,
                            user: res.user,
                            token: res.token,
                            isAdmin: res.user?.isAdmin || false,
                            message: '登录成功'
                        };
                    }
                    throw new Error('登录失败：服务器返回格式异常');
                })
                .catch(error => ({
                    success: false,
                    message: error.message || '登录失败，请检查用户名和密码'
                }));
        },

        // 【认证模块-3】获取当前登录用户信息
        getCurrentUser: function () {
            return http.get('/auth/profile')
                .then(res => {
                    setUserInfo(res);
                    return res;
                })
                .catch(error => {
                    if (error.response && error.response.status === 401) {
                        removeAuthData();
                    }
                    return null;
                });
        },

        // 【认证模块-4】用户退出登录
        logout: function () {
            return http.post('/auth/logout')
                .then(() => {
                    removeAuthData();
                    console.log('退出登录成功');
                    return { success: true };
                })
                .catch(() => {
                    removeAuthData();
                    console.log('已清除本地登录状态');
                    return { success: true };
                });
        },

        // 检查登录状态：验证令牌有效性
        checkLoginStatus: function () {
            const token = getToken();
            if (!token) return Promise.resolve(false);

            return this.getCurrentUser()
                .then(userInfo => !!userInfo)
                .catch(() => false);
        }
    };

})();