(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 考试管理 API
    window.examApi = {
        // 【考试模块-18】生成考试试卷
        generateExamPaper: function (type = 'full', questionCount = 25, timeLimit = 900) {
            return http.post('/exams/generate', {
                type,
                questionCount,
                timeLimit
            });
        },

        // 【考试模块-19】提交考试答案
        submitExamAnswers: function (examId, answers) {
            return http.post(`/exams/${examId}/submit`, {
                answers: answers,
                submitTime: new Date().toISOString()
            });
        },

        // 【考试模块-20】获取考试历史
        getExamHistory: function (params = {}) {
            return http.get('/exams/history', {
                page: params.page || 1,
                size: params.size || 10
            });
        },

        // 【考试模块-21】获取考试详情
        getExamResult: function (examId) {
            return http.get(`/exams/${examId}`);
        },

        // 【考试模块-22】获取考试排行榜
        getExamLeaderboard: function (type = 'all', limit = 10) {
            return http.get('/exams/leaderboard', { type, limit });
        }
    };

})();