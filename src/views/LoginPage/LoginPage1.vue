<template>
  <div class="login-page">
    <div class="head">
      <img src="@/assets/2022-09-16.png" alt="Logo" class="logo" />
      <h1 class="HeadLine">FawnFlock </h1>
      <p class="HeadLine">谁啊黑带大师较大三等奖卡的</p>
    </div>

    <div class="login-buttons">
      <button class="login-button" id="wechat-button">微信号登录</button>
      <p class="or-text">or</p>
      <button class="login-button" @click="goToLoginPagePhoneNumber">手机号登陆</button>
    </div>

    <div class="privacy-section">
      <input type="checkbox" id="agree" />
      <label for="agree">
        已阅读并同意《用户协议》《隐私协议》
        《儿童/青少年个人信息保护政策》
      </label>
    </div>

    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage1",
  methods: {
    goToLoginPagePhoneNumber() {
      console.log('跳转到手机号登录页');
      this.$router.push('/LoginPagePhoneNumber').catch(err => console.log(err));
    }

  },
};

</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  padding: 0 20px;
  font-family: Arial, sans-serif;
}


.logo {
  width: 50px;
  height: 50px;
  margin-top: 100px;
  margin-bottom: 80px;
  object-fit: contain;
  /* 保持图片比例，且图片不会超出容器 */
}

.head {
  margin-bottom: 200px;
}

h1 {
  font-size: 24px;
  margin-bottom: 5px;
}

p {
  font-size: 14px;
  margin-bottom: 40px;
  text-align: center;
}

.login-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-button {
  width: 330px;
  height: 40px;
  background-color: #ddd;
  border: none;
  border-radius: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  cursor: pointer;
}

.or-text {
  font-size: 14px;
  margin: 5px 0;
}

.privacy-section {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 12px;
  text-align: center;
}

.privacy-section input {
  margin-right: 10px;
}

.dots {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.dot {
  width: 20px;
  height: 20px;
  background-color: #ccc;
  border-radius: 35%;
  margin: 0 35px;
}
</style>