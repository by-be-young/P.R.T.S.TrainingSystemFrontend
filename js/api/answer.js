(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 答题记录 API
    window.answerApi = {
        // 【答题记录模块-14】提交答案
        submitAnswer: function (questionId, questionType, selectedOption, timeSpent = 0) {
            return http.post('/answers', {
                questionId,
                questionType,
                selectedOption,
                //timeSpent, //有余力可以加上答题时间统计
                examId
            });
        },

        // 【答题记录模块-15】获取答题历史
        getAnswerRecords: function (params = {}) {
            return http.get('/answers/history', {
                page: params.page || 1,
                size: params.size || 20,
                questionType: params.questionType,
                startDate: params.startDate,
                endDate: params.endDate
            });
        },

        // 【答题记录模块-16】获取错题本
        getWrongQuestions: function (params = {}) {
            return http.get('/answers/wrong', {
                page: params.page || 1,
                size: params.size || 10,
                questionType: params.questionType
            });
        },

        // 【答题记录模块-17】从错题本移除题目
        removeWrongQuestion: function (questionId) {
            return http.delete(`/answers/wrong/${questionId}`);
        }
    };

})();