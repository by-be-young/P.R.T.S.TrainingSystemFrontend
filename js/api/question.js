(function () {
    'use strict';

    // 检查依赖
    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // ==================== 普通题目接口 ====================
    window.questionApi = {
        getQuestions: function (params = {}) {
            const defaultParams = {
                page: 1,
                size: 20,
                keyword: '',
                type: undefined,
                difficulty: undefined,
                includeAnalysis: false
            };
            return http.get('/questions', { ...defaultParams, ...params }, {
                showLoading: false
            });
        },

        getQuestionById: function (id, includeAnalysis = true) {
            return http.get('/questions/' + id, { includeAnalysis });
        },

        getQuestionStats: function (id) {
            return http.get('/questions/' + id + '/stats');
        },

        createQuestion: function (question) {
            return http.post('/questions', question);
        },

        updateQuestion: function (id, question) {
            return http.put('/questions/' + id, question);
        },

        deleteQuestion: function (id) {
            return http.delete('/questions/' + id);
        }
    };

    // ==================== 培训题目接口 ====================
    window.trainingQuestionApi = {
        getTrainingQuestions: function (params = {}) {
            const defaultParams = {
                page: 1,
                size: 20,
                keyword: '',
                includeAnalysis: false
            };
            return http.get('/training/questions', { ...defaultParams, ...params });
        },

        getTrainingQuestionById: function (id, includeAnalysis = true) {
            return http.get('/training/questions/' + id, { includeAnalysis });
        },

        createTrainingQuestion: function (question) {
            return http.post('/training/questions', question);
        },

        updateTrainingQuestion: function (id, question) {
            return http.put('/training/questions/' + id, question);
        },

        deleteTrainingQuestion: function (id) {
            return http.delete('/training/questions/' + id);
        }
    };

    // ==================== 辅助函数 ====================
    window.questionHelper = {
        formatQuestionForDisplay: function (question) {
            if (!question) return null;

            const typeNames = {
                1: '干员调配与特性化决策',
                2: '空间部署与极致化战术',
                3: '效能审计与生态位界定',
                4: '横向分析与竞争力评估',
                5: '作战环境与档案类记录'
            };

            const difficultyNames = {
                1: '常识',
                2: '基操',
                3: '娴熟',
                4: '明智',
                5: '深邃'
            };

            // 转换换行符为 HTML 换行标签
            const fmtText = (str) => {
                return (str || '').replace(/\n/g, '<br>').replace(/\r\n/g, '<br>');
            };

            return {
                ...question,
                typeText: typeNames[question.type] || '未知类型',
                difficultyText: difficultyNames[question.difficulty] || '未知难度',
                question: fmtText(question.question),
                options: (question.options || ['', '', '', '']).map(opt => fmtText(opt)),
                analysis: fmtText(question.analysis),
                keywords: question.keywords || [],
                resource: question.resource || ''
            };
        },

        formatQuestionForSubmit: function (question) {
            // 转换 HTML 换行标签为普通换行符
            const fmtText = (str) => {
                return (str || '').replace(/<br>/g, '\n').replace(/<br\s*\/?>/g, '\n');
            };

            return {
                ...question,
                question: fmtText(question.question),
                options: (question.options || []).map(opt => fmtText(opt)),
                analysis: fmtText(question.analysis)
            };
        },

        validateQuestion: function (question) {
            const errors = [];

            if (!question.question?.trim()) {
                errors.push('题目内容不能为空');
            }

            if (!question.options || question.options.length < 4) {
                errors.push('需要提供至少4个选项');
            } else {
                question.options.forEach((opt, index) => {
                    if (!opt?.trim()) {
                        errors.push(`选项${String.fromCharCode(65 + index)}不能为空`);
                    }
                });
            }

            if (question.answer < 1 || question.answer > 4) {
                errors.push('正确答案必须在1-4之间');
            }

            if (!question.type || question.type < 1 || question.type > 5) {
                errors.push('题目类型必须在1-5之间');
            }

            if (!question.difficulty || question.difficulty < 1 || question.difficulty > 5) {
                errors.push('题目难度必须在1-5之间');
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        }
    };

})();