<template>
    <div class="post-card" v-if="post">
        <div class="post-header">
            <img :src="user.avatar" alt="user avatar" />
            <div class="user-info">
                <span class="username">{{ user.name }}</span>
                <span class="timestamp">{{ post.timestamp }}</span>
            </div>
        </div>
        <div class="post-content">
            <p>{{ post.content }}</p>
            <img v-if="post.image" :src="post.image" alt="post image" />
        </div>
        <div class="post-actions">
            <LikeButton :initialLikes="post.likes" :isInitiallyLiked="post.isLiked" @like-toggled="onLikeToggled" />
            <!-- 使用评论按钮组件，处理点击事件 -->
            <CommentButton :initialCommentCount="post.comments.length" />
        </div>
    </div>
</template>

<script>
import LikeButton from './LikeButton.vue';
import CommentButton from './CommentButton.vue'; // 引入评论按钮组件
import axios from 'axios'; // 引入axios用于请求

export default {
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            user: {
                name: '',
                avatar: ''
            }
        };
    },
    components: {
        LikeButton,
        CommentButton // 注册评论按钮组件
    },
    methods: {
        async fetchUserData(userId) {
            try {
                // 发送请求到后端，获取用户信息
                const response = await axios.get(`https://your-api-endpoint.com/users/${userId}`);
                this.user = response.data;
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },
        onLikeToggled(isLiked) {
            // 更新帖子的点赞状态
            this.$emit('like-updated', { postId: this.post.id, isLiked });
        }
    },
    mounted() {
        // 在组件挂载后从后端获取用户信息
        this.fetchUserData(this.post.userId); // 根据post对象的userId获取用户信息
    }
};
</script>

<style scoped>
.post-card {
    background-color: #ffffff;
    /* 背景颜色 */
    border: 1px solid #e1e8ed;
    /* 边框颜色 */
    border-radius: 8px;
    /* 圆角 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    /* 阴影 */
    margin: 16px 0;
    /* 上下外边距 */
    padding: 16px;
    /* 内边距 */
    font-family: Arial, sans-serif;
    /* 字体 */
}

.post-header {
    display: flex;
    /* 使用 flexbox 布局 */
    align-items: center;
    /* 垂直居中对齐 */
    margin-bottom: 12px;
    /* 下外边距 */
}

.post-header img {
    width: 48px;
    /* 用户头像宽度 */
    height: 48px;
    /* 用户头像高度 */
    border-radius: 50%;
    /* 圆形头像 */
    margin-right: 12px;
    /* 右外边距 */
}

.user-info {
    flex-grow: 1;
    /* 用户信息占满剩余空间 */
}

.username {
    font-weight: bold;
    /* 粗体字 */
    color: #1da1f2;
    /* 用户名颜色 */
}

.timestamp {
    color: #657786;
    /* 时间戳颜色 */
    font-size: 0.85em;
    /* 字体大小 */
}

.post-content {
    margin: 12px 0;
    /* 上下外边距 */
}

.post-content p {
    margin: 0;
    /* 去除段落的默认外边距 */
    line-height: 1.5;
    /* 行高 */
    color: #14171a;
    /* 正文颜色 */
}

.post-content img {
    max-width: 100%;
    /* 图片最大宽度 */
    border-radius: 8px;
    /* 圆角 */
    margin-top: 8px;
    /* 图片上边距 */
}

.post-actions {
    display: flex;
    /* 使用 flexbox 布局. */
    justify-content: space-between;
    /* 左右分隔 */
    margin-top: 12px;
    /* 上外边距 */
}

.comment-button {
    display: flex;
    /* 使用 flexbox 布局 */
    align-items: center;
    /* 垂直居中对齐 */
}

.comment-count {
    color: #657786;
    /* 评论数颜色 */
    margin-left: 10px;
    /* 评论数与按钮之间的左边距 */
}

.like-button {
    color: #1da1f2;
    /* 点赞按钮颜色 */
}
</style>
