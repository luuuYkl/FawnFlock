<template>
  <div class="like-button">
    <button @click="likePost">
      Like
    </button>
    <span class="like-count">{{ likeCount }} Likes</span>
  </div>
</template>

<script>
import axios from 'axios'; // 导入 Axios

export default {
  props: {
    initialLikes: {
      type: Number,
      default: 0 // 默认值为 0
    },
    postId: {
      type: Number,
      required: true // 必须传入 postId
    }
  },

  data() {
    return {
      likeCount: this.initialLikes // 初始化点赞数为传入的初始点赞数
    };
  },

  methods: {
    async likePost() {
      try {
        // 发送请求到后端，增加点赞数
        const response = await axios.post(`/api/posts/${this.postId}/like`);

        if (response.data.success) {
          // 增加点赞数
          this.likeCount += 1;
        } else {
          // 处理错误情况
          console.error('Failed to like post:', response.data.message);
        }
      } catch (error) {
        // 处理请求错误
        console.error('Error liking post:', error);
      }
    }
  }
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
