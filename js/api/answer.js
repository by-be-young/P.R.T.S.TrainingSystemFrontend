(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 答题记录 API
    window.answerApi = {
        // 提交答案：记录用户答题结果
        submitAnswer: function (questionId, questionType, selectedOption, timeSpent = 0) {
            return http.post('/answers', {
                questionId,
                questionType,
                selectedOption,
                timeSpent,
                examId
            });
        },

        // 获取答题记录：用户历史答题详情
        getAnswerRecords: function (params = {}) {
            return http.get('/answers/history', {
                page: params.page || 1,
                size: params.size || 20,
                questionType: params.questionType,
                startDate: params.startDate,
                endDate: params.endDate
            });
        },

        // 获取用户答题统计：正确率、答题数量等
        getUserAnswerStats: function () {
            return http.get('/stats/user');
        }
    };

})();