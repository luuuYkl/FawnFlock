<template>
  <div class="like-button">
    <button @click="handleLike">{{ isLiked ? "Unlike" : "Like" }}</button>
    <span class="like-count">{{ likeCount }} Likes</span>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    postId: {
      type: Number,
      required: true, // 确保从父组件接收 postId
    },
    userId: {
      type: Number,
      required: true, // 确保从父组件接收 userId
    },
    initialIsLiked: {
      type: Boolean,
      default: false, // 是否已点赞的初始状态
    },
  },
  data() {
    return {
      likeCount: 0, // 初始化点赞数
      isLiked: this.initialIsLiked, // 是否已点赞
    };
  },
  created() {
    this.fetchLikeCount(); // 初始化时获取点赞数
  },
  methods: {
    // 获取点赞数
    async fetchLikeCount() {
      try {
        const response = await axios.post(`http://127.0.0.1:7878/posts/${this.postId}/like_count`);
        console.log("读取点赞数为", response.data);
        if (response.data) {
          this.likeCount = response.data; // 更新点赞数
        } else {
          console.error("获取点赞数失败:", response.data.message);
        }
      } catch (error) {
        console.error("获取点赞数时发生错误:", error);
      }
    },

    // 点赞操作
    async handleLike() {
      const url = `http://127.0.0.1:7878/posts/${this.postId}/like/${this.userId}`;
      try {
        if (!this.isLiked) {
          // 点赞
          const response = await axios.post(url);
          if (response.data.success) {
            this.likeCount += 1; // 点赞数增加
            this.isLiked = true; // 标记为已点赞
            console.log("点赞成功:", response.data);
          } else {
            console.error("点赞失败:", response.data.message);
          }
        } else {
          // 取消点赞
          const response = await axios.delete(url);
          if (response.data.success) {
            this.likeCount -= 1; // 点赞数减少
            this.isLiked = false; // 标记为未点赞
            console.log("取消点赞成功:", response.data);
          } else {
            console.error("取消点赞失败:", response.data.message);
          }
        }
      } catch (error) {
        console.error(`点赞操作失败:`, error);
      }
    },
  },
};
</script>

<style scoped>
.like-button {
  display: flex;
  align-items: center;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.like-count {
  margin-left: auto;
}
</style>
