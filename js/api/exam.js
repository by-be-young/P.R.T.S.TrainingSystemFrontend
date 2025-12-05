(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 考试管理 API
    window.examApi = {
        // 生成考试试卷：创建包含随机题目的考试
        generateExamPaper: function (type = 'full', questionCount = 25, timeLimit = 900) {
            return http.post('/exams/generate', {
                type,
                questionCount,
                timeLimit
            });
        },

        // 提交考试答案：批量提交所有题目答案
        submitExamAnswers: function (examId, answers) {
            return http.post(`/exams/${examId}/submit`, {
                answers: answers,
                submitTime: new Date().toISOString()
            });
        },

        // 获取考试结果：考试详情和答案解析
        getExamResult: function (examId) {
            return http.get(`/exams/${examId}`);
        },

        // 获取考试历史：用户过往考试记录
        getExamHistory: function (params = {}) {
            return http.get('/exams/history', {
                page: params.page || 1,
                size: params.size || 10
            });
        },

        // 获取考试统计：全站考试数据汇总
        getExamStats: function () {
            return http.get('/stats/system');
        },

        // 获取考试排行榜：用户考试成绩排名
        getExamLeaderboard: function (type = 'all', limit = 10) {
            return http.get('/exams/leaderboard', { type, limit });
        }
    };

})();