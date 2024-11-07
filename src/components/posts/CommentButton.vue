<!-- 评论按钮组件的样式，具有点击后进入详细帖子页面的功能 -->
 <!-- 需要读取后端评论数量数据 -->

 <template>
  <div class="comment-button">
    <!-- 显示评论按钮，点击时触发添加评论的方法 -->
    <button @click="addComment">Comment</button>
    <!-- 显示评论数，超过999时显示999+ -->
    <span class="comment-count">{{ displayCommentCount }}</span>
  </div>
</template>

<script>
import axios from 'axios'; // 确保引入 Axios

export default {
  props: {
    initialCommentCount: {
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
      // 初始化评论数为传入的初始评论数
      commentCount: this.initialCommentCount
    };
  },

  computed: {
    // 计算属性，根据评论数返回合适的显示格式
    displayCommentCount() {
      return this.commentCount > 999 ? '999+' : this.commentCount;
    }
  },

  methods: {
    
    // 获取评论数量
    async fetchCommentCount() {
      try {
        const response = await axios.get(`/posts/${this.postId}/comment_count`);
        
        this.commentCount = response.data.commentCount || this.initialCommentCount;
      } catch (error) {
        console.error("获取评论数量失败:", error);
      }
    },
  },

  mounted() {
    // 组件挂载时调用 fetchCommentCount 获取评论数
    this.fetchCommentCount();
  }
};
</script>

<style scoped>
/* 评论按钮组件的样式 */
.comment-button {
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
}

.comment-count {
  margin-left: 10px; /* 评论数与按钮之间的左边距 */
}
</style>
