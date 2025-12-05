(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    window.adminApi = {
        // 用户管理
        getUsers: function (params = {}) {
            return http.get('/admin/users', {
                page: params.page || 1,
                size: params.size || 20,
                role: params.role,
                status: params.status
            });
        },

        updateUser: function (userId, userData) {
            return http.put(`/admin/users/${userId}`, userData);
        },

        // 系统配置
        getConfig: function () {
            return http.get('/admin/config');
        },

        updateConfig: function (config) {
            return http.put('/admin/config', config);
        },

        // 系统统计
        getSystemStats: function () {
            return http.get('/stats/system');
        },

        // 批量操作
        batchDeleteQuestions: function (questionIds) {
            return http.post('/admin/questions/batch-delete', { ids: questionIds });
        }
    };
})();