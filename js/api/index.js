export * from './request.js';
export * from './question.js';
export * from './user.js';
export * from './answer.js';
export * from './exam.js';

// 或者作为命名空间导出
const api = {
    question: require('./question.js').default || require('./question.js'),
    user: require('./user.js').default || require('./user.js'),
    answer: require('./answer.js').default || require('./answer.js'),
    exam: require('./exam.js').default || require('./exam.js')
};

export default api;