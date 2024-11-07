<!-- 由首页帖子流点击评论组件跳转进入的帖子详细页面 -->
<!-- 需要读取后端评论详细数据并展示 -->

<template>
    <div class="post-detail">
        <!-- 上部分：原帖展示 -->
        <div class="original-post">
            <h2>{{ post.title }}</h2>
            <p>{{ post.body }}</p>

            <!-- 点赞和评论按钮 -->
            <div class="post-buttons" style="display: flex;">
                <like-button :initialLikes="post.likes" />
                <!-- 评论按钮组件 -->
                <comment-button :initialCommentCount="post.commentCount" @click="navigateToPostDetail"
                    style="margin: auto;" />
            </div>
        </div>

        <!-- 下部分：评论区展示 -->
        <div class="comments-section">
            <h3>评论</h3>
            <div class="comment-list">
                <!-- 使用 v-for 循环渲染评论列表，每个评论也以帖子的形式呈现 -->
                <post-card v-for="comment in comments" :key="comment.id" :post="comment" />
            </div>
        </div>
    </div>
</template>

<script>
import LikeButton from './LikeButton.vue';
import CommentButton from './CommentButton.vue';
import PostCard from './PostCard.vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // 确保你已安装并引入 axios

export default {
    components: {
        LikeButton,
        CommentButton,
        PostCard
    },
    data() {
        return {
            post: {}, // 原帖数据
            comments: [] // 评论列表
        };
    },
    setup() {
        const router = useRouter();

        const navigateToPostDetail = (commentId) => {
            router.push({ name: 'PostDetail', params: { id: commentId } });
        };

        return {
            navigateToPostDetail
        };
    },
    async mounted() {
        // 获取帖子详细信息
        try {
            const postId = this.$route.params.id; // 从路由中获取帖子 ID
            const postResponse = await axios.get(`/api/posts/${postId}`);
            this.post = postResponse.data; // 更新帖子数据

            // 获取评论列表
            const commentsResponse = await axios.get(`/api/posts/${postId}/comments`);
            this.comments = commentsResponse.data; // 更新评论列表
        } catch (error) {
            console.error('获取帖子或评论失败:', error);
        }
    }
};
</script>

<style scoped>
/* 帖子详细页的样式 */
.post-detail {
    padding: 20px;
}

.original-post {
    padding: 15px;
    border-bottom: 1px solid #ddd;
}

.comments-section {
    margin-top: 20px;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
</style>
