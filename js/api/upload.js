(function () {
    'use strict';

    if (typeof http === 'undefined') {
        console.error('请先加载 request.js');
        return;
    }

    // 文件上传 API
    window.uploadApi = {
        // 【文件上传模块-29】上传题目图片
        uploadQuestionImage: function (questionId, file) {
            if (!file) {
                return Promise.reject(new Error('请选择文件'));
            }

            // 验证文件类型
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                return Promise.reject(new Error('只支持 JPG, PNG, GIF 格式的图片'));
            }

            // 验证文件大小 (最大 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return Promise.reject(new Error('图片大小不能超过 5MB'));
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('questionId', questionId);

            return http.post('/upload/question-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },

        // 【文件上传模块-30】上传用户头像
        uploadAvatar: function (file) {
            if (!file) {
                return Promise.reject(new Error('请选择头像文件'));
            }

            // 验证文件类型
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                return Promise.reject(new Error('只支持 JPG, PNG 格式的头像'));
            }

            // 验证文件大小 (最大 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                return Promise.reject(new Error('头像大小不能超过 2MB'));
            }

            const formData = new FormData();
            formData.append('file', file);

            return http.post('/upload/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },

        // 删除题目图片
        deleteQuestionImage: function (questionId) {
            return http.delete(`/upload/question-image/${questionId}`);
        },

        // 删除用户头像
        deleteAvatar: function () {
            return http.delete('/upload/avatar');
        },

        // 获取图片预览 URL
        getImageUrl: function (imagePath) {
            if (!imagePath) return '';
            if (imagePath.startsWith('http')) return imagePath;
            return (window.API_BASE_URL || '/api') + imagePath;
        }
    };

    // 文件上传辅助函数
    window.uploadHelper = {
        // 读取图片为 DataURL
        readImageAsDataURL: function (file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    reject(new Error('文件为空'));
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('读取文件失败'));
                reader.readAsDataURL(file);
            });
        },

        // 压缩图片
        compressImage: function (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
            return new Promise((resolve, reject) => {
                if (!file.type.startsWith('image/')) {
                    resolve(file); // 不是图片，直接返回原文件
                    return;
                }

                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // 计算缩放比例
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    // 设置 canvas 尺寸
                    canvas.width = width;
                    canvas.height = height;

                    // 绘制图片
                    ctx.drawImage(img, 0, 0, width, height);

                    // 转换为 Blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('图片压缩失败'));
                            return;
                        }

                        // 创建新的 File 对象
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        resolve(compressedFile);
                    }, file.type, quality);
                };

                img.onerror = () => reject(new Error('加载图片失败'));
                img.src = URL.createObjectURL(file);
            });
        },

        // 验证图片尺寸
        validateImageDimensions: function (file, minWidth = 100, minHeight = 100) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    if (img.width < minWidth || img.height < minHeight) {
                        reject(new Error(`图片尺寸过小，最小要求：${minWidth}x${minHeight}`));
                    } else {
                        resolve(true);
                    }
                };
                img.onerror = () => reject(new Error('加载图片失败'));
                img.src = URL.createObjectURL(file);
            });
        },

        // 生成文件名
        generateFileName: function (prefix = 'file', extension = 'jpg') {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            return `${prefix}_${timestamp}_${random}.${extension}`;
        }
    };

})();