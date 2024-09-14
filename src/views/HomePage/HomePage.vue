<template>
    <div class="page-container">
      <!-- 顶部导航栏 -->
      <header class="header">
        <nav class="top-nav">
          <span class="nav-item active">广场</span>
          <span class="nav-item">附近</span>
        </nav>
      </header>
  
      <!-- 内容区域 -->
      <div class="content">
        <!-- 帖子 -->
        <div class="post">
          <div class="post-header">
            <img src="user-avatar.jpg" alt="User Avatar" class="avatar" />
            <div class="user-info">
              <div class="name">@id</div>
              <div class="description">图标间隔设计原则...</div>
            </div>
          </div>
          <div class="post-content">
            <p>
              1. 触摸目标大小：根据研究，建议每个触摸目标的最小尺寸为48x48像素，这可以确保用户能够轻松点击目标而不会误触相邻的区域。
              <br />
              2. 图标间距：图标之间的间距应足够大，以防止用户误触相邻按钮。通常建议图标之间的间距为8到12像素。
            </p>
          </div>
          <div class="post-footer">
            <i class="icon-like">👍</i>
            <i class="icon-comment">💬</i>
            <i class="icon-share">↗</i>
          </div>
        </div>
  
        <!-- 图片帖子 -->
        <div class="post">
          <div class="post-header">
            <img src="user-avatar.jpg" alt="User Avatar" class="avatar" />
            <div class="user-info">
              <div class="name">@id</div>
            </div>
          </div>
          <div class="post-content">
            <img src="post-image.jpg" alt="Post Image" class="post-image" />
          </div>
          <div class="post-footer">
            <i class="icon-like">👍</i>
            <i class="icon-comment">💬</i>
            <i class="icon-share">↗</i>
          </div>
        </div>
      </div>
  
      <!-- 底部导航栏 -->
      <footer class="bottom-nav">
        <i class="icon-home active">🏠</i>
        <i class="icon-search">🔍</i>
        <i class="icon-add">➕</i>
        <i class="icon-notification">🔔</i>
        <i class="icon-profile">👤</i>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage',
  };
  </script>
  
  <style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .header {
    background-color: #fff;
    padding: 10px;
    border-bottom: 1px solid #ccc;
  }
  
  .top-nav {
    display: flex;
    justify-content: space-around;
    font-weight: bold;
  }
  
  .nav-item {
    cursor: pointer;
    padding: 10px 0;
  }
  
  .nav-item.active {
    border-bottom: 2px solid #000;
  }
  
  .content {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
  }
  
  .post {
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 10px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .user-info .name {
    font-weight: bold;
  }
  
  .post-content p {
    margin: 0;
    line-height: 1.5;
  }
  
  .post-content .post-image {
    width: 100%;
    border-radius: 10px;
    margin-top: 10px;
  }
  
  .post-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
  }
  
  .post-footer .icon-like,
  .post-footer .icon-comment,
  .post-footer .icon-share {
    cursor: pointer;
    font-size: 18px;
  }
  
  .bottom-nav {
    background-color: #fff;
    padding: 10px 0;
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #ccc;
  }
  
  .bottom-nav i {
    font-size: 24px;
    cursor: pointer;
  }
  
  .bottom-nav i.active {
    color: #000;
  }
  </style>
  