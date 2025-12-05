(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 题目类型和难度映射
    const typeNames = {
        1: '干员调配与特性化决策',
        2: '空间部署与极致化战术',
        3: '效能审计与生态位界定',
        4: '横向分析与竞争力评估',
        5: '作战环境与档案类记录'
    };

    const difficultyNames = {
        1: '常识', 2: '基操', 3: '娴熟', 4: '明智', 5: '深邃'
    };

    // 题目管理 API
    window.questionApi = {
        // 获取题目列表：支持分页、筛选和搜索
        getQuestions: function (params = {}) {
            const defaultParams = {
                page: 1,
                size: 50,
                keyword: '',
                type: undefined,
                difficulty: undefined
            };
            return http.get('/questions', { ...defaultParams, ...params }, {
                showLoading: false
            });
        },

        // 获取题目详情：包括题目内容和统计信息
        getQuestionById: function (id, includeAnalysis = true) {
            return http.get(`/questions/${id}`, { includeAnalysis });
        },

        // 获取题目统计：正确率、常见错误选项等
        getQuestionStats: function (id) {
            return http.get(`/stats/question/${id}`);
        },

        // 搜索题目：通过关键词匹配题目内容
        searchQuestions: function (keyword, field = 'question') {
            return http.get('/questions/search', { keyword, field });
        },

        // 创建题目：管理员添加新题目
        createQuestion: function (question) {
            return http.post('/questions', question);
        },

        // 更新题目：管理员修改题目内容
        updateQuestion: function (id, question) {
            return http.put(`/questions/${id}`, question);
        },

        // 删除题目：管理员删除题目
        deleteQuestion: function (id) {
            return http.delete(`/questions/${id}`);
        }
    };

    // 培训题目管理 API
    window.trainingQuestionApi = {
        // 获取培训题目列表：入职培训专用题目
        getTrainingQuestions: function (params = {}) {
            return http.get('/training/questions', {
                page: params.page || 1,
                size: params.size || 20
            });
        },

        // 获取培训题目详情
        getTrainingQuestionById: function (id) {
            return http.get(`/training/questions/${id}`);
        },

        // 创建培训题目：管理员操作
        createTrainingQuestion: function (question) {
            return http.post('/training/questions', question);
        },

        // 更新培训题目：管理员操作
        updateTrainingQuestion: function (id, question) {
            return http.put(`/training/questions/${id}`, question);
        },

        // 删除培训题目：管理员操作
        deleteTrainingQuestion: function (id) {
            return http.delete(`/training/questions/${id}`);
        }
    };

    // 题目数据辅助函数
    window.questionHelper = {
        // 格式化题目显示：转换换行符和添加类型/难度文本
        formatQuestionForDisplay: function (question) {
            if (!question) return null;

            const fmtText = (str) => (str || '').replace(/\n/g, '<br>').replace(/\r\n/g, '<br>');

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

        // 格式化题目提交：HTML转义和字段处理
        formatQuestionForSubmit: function (question) {
            const fmtText = (str) => (str || '').replace(/<br>/g, '\n').replace(/<br\s*\/?>/g, '\n');

            const result = {
                ...question,
                question: fmtText(question.question),
                options: (question.options || []).map(opt => fmtText(opt)),
                analysis: fmtText(question.analysis)
            };

            // 确保关键词是数组格式
            if (question.keywordsInput) {
                result.keywords = question.keywordsInput.split(/[,，]/)
                    .map(k => k.trim())
                    .filter(k => k.length > 0);
            }

            return result;
        },

        // 题目验证：检查必填字段和格式
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