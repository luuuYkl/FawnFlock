<template>
  <div class="login-page">
    <header class="header">
      <img src="@/assets/2022-09-16.png" alt="Logo" class="logo" />
    </header>

    <div class="content">
      <h1>手机号登陆</h1>

      <div class="input-group">
        <div class="country-code">
          <select v-model="countryCode">
            <option value="+86">+86</option>
            <!-- 你可以添加更多国家代码 -->
          </select>
        </div>
        <input type="text" v-model="phoneNumber" placeholder="请输入手机号" />
      </div>

      <button class="login-button" @click="submitPhoneNumber">验证码登陆</button>

      <div class="privacy-section">
        <input type="checkbox" id="agree" v-model="isAgreed" />
        <label for="agree">
          已阅读并同意《用户协议》《隐私协议》 《儿童/青少年个人信息保护政策》
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginPagePhoneNumber',
  data() {
    return {
      phoneNumber: '', // 绑定手机号输入框
      countryCode: '+86', // 国家代码
      isAgreed: false // 用户协议是否勾选
    };
  },
  methods: {
    async submitPhoneNumber() {
      if (!this.phoneNumber) {
        alert('请输入手机号');
        return;
      }
      if (!this.isAgreed) {
        alert('请同意用户协议');
        return;
      }

      try {
        const response = await axios.post('http://127.0.0.1:7878/register', {
          //配置api地址
          phoneNumber: this.countryCode + this.phoneNumber
        });
        console.log('手机号已发送:', response.data);
        this.$router.push('/LoginPagePN2');
      } catch (error) {
        console.error('提交手机号时发生错误:', error);
      }
    }
  }
};
</script>

<style scoped>
/* 你的样式代码保持不变 */
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
  justify-content: center;
  margin-top: 20px;
}

.logo {
  width: 50px;
  height: 50px;
  margin-top: 100px;
  margin-bottom: 80px;
  object-fit: contain;
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
  margin-bottom: 50px;
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
  padding-bottom: 5px;
}

.country-code {
  margin-right: 10px;
}

.country-code select {
  border: none;
  font-size: 16px;
}

input[type="text"] {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
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

.privacy-section {
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.privacy-section input {
  margin-right: 5px;
}
</style>
