(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 工具函数
    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

    const setToken = (token, remember = false) => {
        if (remember) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
    };

    const setUserInfo = (userInfo, remember = false) => {
        const data = JSON.stringify(userInfo);
        if (remember) {
            localStorage.setItem('userInfo', data);
        } else {
            sessionStorage.setItem('userInfo', data);
        }
    };

    const removeToken = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    };

    const removeUserInfo = () => {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
    };

    window.userApi = {
        login: function (username, password, rememberMe = false) {
            return http.post('/user/login', { username, password })
                .then(res => {
                    if (res.token) {
                        setToken(res.token, rememberMe);
                        if (res.user) {
                            setUserInfo(res.user, rememberMe);
                        }
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
                .catch(error => {
                    return {
                        success: false,
                        message: error.message || '登录失败，请检查用户名和密码'
                    };
                });
        },

        register: function (username, password, confirmPassword) {
            if (!username || username.length < 3) {
                return Promise.resolve({
                    success: false,
                    message: '用户名至少需要3个字符'
                });
            }

            if (!password || password.length < 6) {
                return Promise.resolve({
                    success: false,
                    message: '密码至少需要6个字符'
                });
            }

            if (password !== confirmPassword) {
                return Promise.resolve({
                    success: false,
                    message: '两次输入的密码不一致'
                });
            }

            return http.post('/user/register', { username, password })
                .then(res => {
                    return {
                        success: true,
                        message: res.message || '注册成功',
                        userId: res.userId
                    };
                })
                .catch(error => {
                    return {
                        success: false,
                        message: error.message || '注册失败，用户名可能已存在'
                    };
                });
        },

        getCurrentUser: function () {
            return http.get('/user/current')
                .then(res => {
                    if (res && res.id) {
                        setUserInfo(res);
                    }
                    return res;
                })
                .catch(error => {
                    if (error.response && error.response.status === 401) {
                        this.logout();
                    }
                    return null;
                });
        },

        logout: function () {
            removeToken();
            removeUserInfo();
            return http.post('/user/logout')
                .then(() => {
                    console.log('退出登录成功');
                })
                .catch(() => {
                    console.log('已清除本地登录状态');
                });
        },

        checkLoginStatus: function () {
            const token = getToken();
            if (!token) return Promise.resolve(false);

            return this.getCurrentUser()
                .then(userInfo => !!userInfo)
                .catch(() => false);
        },

        getWrongQuestions: function (params = {}) {
            return http.get('/user/wrong-questions', {
                page: params.page || 1,
                size: params.size || 10
            });
        },

        getLeaderboard: function (type = 'accuracy', limit = 10) {
            return http.get('/user/leaderboard', {
                type,
                limit
            });
        }
    };

})();