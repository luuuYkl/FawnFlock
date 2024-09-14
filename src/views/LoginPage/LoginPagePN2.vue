<template>
    <div class="login-page">
        <header class="header">
            <img src="logo.png" alt="Logo" class="logo" />
        </header>

        <div class="content">
            <h1>手机号登陆</h1>
            <div class="subtext1">
                <p class="subtext">已向尾号</p>
                <p class="subtext">手机号发送验证码</p>
            </div>

            <div class="code-inputs">
                <div contenteditable="true" class="code-box"></div>
                <div contenteditable="true" class="code-box"></div>
                <div contenteditable="true" class="code-box"></div>
                <div contenteditable="true" class="code-box"></div>
            </div>

            <button class="login-button" @click="handleRegistrationSuccess">验证码登陆</button>

            <button class="resend-button">重新发送</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginPagePN2',
    methods: {
    handleRegistrationSuccess() {
      // 注册成功后保存登录状态
      localStorage.setItem('isLoggedIn', 'true');
      this.$router.push('/HomePage'); // 跳转到首页
    }
  }

};
</script>

<style scoped>
.login-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100vh;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #fff;
}

.header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
}

.back-button {
    font-size: 24px;
    background: none;
    border: none;
    cursor: pointer;
}

.logo {
    width: 50px;
    height: 50px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 300px;
}

.content {
    width: 100%;
    max-width: 300px;
    text-align: center;
    margin-top: 20px;
}

h1 {
    display: flex;
    font-size: 28px;
    margin-bottom: 10px;
}

.subtext1 {
    display: flex;
}

.subtext {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
}

.code-inputs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px
}

.code-box {
    width: 20%;
    padding: 10px;
    text-align: center;
    font-size: 24px;
    border: 1px solid #ccc;
    /* 去除圆角 */
    outline: none;
    border: none;
    /* 移除所有边框 */
    border-bottom: 2px solid #ccc;
    /* 添加底部边框，颜色和宽度可以根据需要调整 */
    margin: 0 5px;
}

.code-box:focus {
  border-color: #000; /* 聚焦时边框颜色 */
}

.login-button {
    width: 100%;
    padding: 10px 0;
    background-color: #ddd;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 20px;
}

.resend-button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 14px;
}
</style>