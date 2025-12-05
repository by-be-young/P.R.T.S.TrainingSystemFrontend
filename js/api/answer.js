(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    window.answerApi = {
        // 提交答案
        submitAnswer: function (questionId, questionType, selectedOption) {
            return http.post('/answers', {
                questionId: questionId,
                questionType: questionType,
                selectedOption: selectedOption
            });
        },

        // 获取答题记录
        getAnswerRecords: function (params = {}) {
            return http.get('/answers', {
                page: params.page || 1,
                size: params.size || 20,
                userId: params.userId,
                questionId: params.questionId
            });
        },

        // 获取用户答题统计
        getUserAnswerStats: function () {
            return http.get('/answers/stats');
        }
    };

})();