(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    window.examApi = {
        // 获取考试试卷
        getExamPaper: function () {
            return http.get('/exam/paper');
        },

        // 提交考试答案
        submitExamAnswers: function (answers) {
            return http.post('/exam/submit', { answers: answers });
        },

        // 获取考试结果
        getExamResult: function (examId) {
            return http.get('/exam/result/' + examId);
        },

        // 获取考试历史
        getExamHistory: function (params = {}) {
            return http.get('/exam/history', {
                page: params.page || 1,
                size: params.size || 10
            });
        },

        // 获取考试统计
        getExamStats: function () {
            return http.get('/exam/stats');
        }
    };

})();