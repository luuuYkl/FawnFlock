<template>
  <div class="login-page">
    <header class="header">
      <button class="back-button" @click="$router.back()">
        ← 返回
      </button>
      <img src="@/assets/2022-09-16.png" alt="Logo" class="logo" />
    </header>

    <div class="content">
      <h1>手机号登录</h1>
      <p class="subtitle">新用户自动注册</p>

      <!-- 手机号输入 -->
      <div class="input-group" :class="{ 'has-error': errors.phoneNumber }">
        <div class="country-code">
          <select v-model="countryCode">
            <option value="+86">+86</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
          </select>
        </div>
        <input
          type="tel"
          v-model="phoneNumber"
          placeholder="请输入手机号"
          maxlength="11"
          @input="validatePhoneNumber"
          @blur="validatePhoneNumber"
        />
        <span v-if="phoneNumber && isPhoneValid" class="valid-icon">✓</span>
      </div>
      <p v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</p>

      <!-- 密码输入 -->
      <div class="input-group" :class="{ 'has-error': errors.password }">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="请输入密码 (6-20位)"
          maxlength="20"
          @input="validatePassword"
          @blur="validatePassword"
          @keyup.enter="submitPhoneNumber"
        />
        <button
          type="button"
          class="toggle-password"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? '👁️' : '👁️‍🗨️' }}
        </button>
      </div>
      <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
      
      <!-- 密码强度指示器 -->
      <div v-if="password" class="password-strength">
        <div class="strength-bar">
          <div
            class="strength-fill"
            :class="passwordStrengthClass"
            :style="{ width: passwordStrengthPercent + '%' }"
          ></div>
        </div>
        <span class="strength-text">{{ passwordStrengthText }}</span>
      </div>

      <!-- 登录按钮 -->
      <button
        class="login-button"
        @click="submitPhoneNumber"
        :disabled="loading || !canSubmit"
        :class="{ 'loading': loading }"
      >
        <span v-if="loading" class="spinner"></span>
        <span v-else>{{ isLogin ? '登录' : '注册并登录' }}</span>
      </button>

      <!-- 提示信息 -->
      <div v-if="successMessage" class="message success-message">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="message error-message">
        {{ errorMessage }}
      </div>

      <!-- 协议勾选 -->
      <div class="privacy-section">
        <input type="checkbox" id="agree" v-model="isAgreed" />
        <label for="agree" class="privacy-label">
          已阅读并同意
          <a href="#" class="privacy-link">《用户协议》</a>
          <a href="#" class="privacy-link">《隐私协议》</a>
        </label>
      </div>

      <!-- 其他选项 -->
      <div class="options">
        <a href="#" class="option-link">忘记密码?</a>
        <a href="#" class="option-link">注册新账号</a>
      </div>
    </div>
  </div>
</template>

<script>
import { userAPI } from '@/services/api.service';

export default {
  name: 'LoginPagePhoneNumber',
  data() {
    return {
      phoneNumber: '',
      password: '',
      loading: false,
      countryCode: '+86',
      isAgreed: true,
      showPassword: false,
      isLogin: true,
      errors: {
        phoneNumber: '',
        password: ''
      },
      errorMessage: '',
      successMessage: ''
    };
  },
  computed: {
    isPhoneValid() {
      return /^1[3-9]\d{9}$/.test(this.phoneNumber);
    },
    passwordStrength() {
      const pwd = this.password;
      if (!pwd) return 0;
      
      let strength = 0;
      if (pwd.length >= 6) strength += 25;
      if (pwd.length >= 10) strength += 25;
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
      if (/\d/.test(pwd)) strength += 15;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 10;
      
      return Math.min(strength, 100);
    },
    passwordStrengthPercent() {
      return this.passwordStrength;
    },
    passwordStrengthClass() {
      if (this.passwordStrength < 30) return 'weak';
      if (this.passwordStrength < 60) return 'medium';
      return 'strong';
    },
    passwordStrengthText() {
      if (this.passwordStrength < 30) return '弱';
      if (this.passwordStrength < 60) return '中';
      return '强';
    },
    canSubmit() {
      return this.isPhoneValid && 
             this.password.length >= 6 && 
             this.isAgreed &&
             !this.errors.phoneNumber &&
             !this.errors.password;
    }
  },
  methods: {
    validatePhoneNumber() {
      if (!this.phoneNumber) {
        this.errors.phoneNumber = '';
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
        this.errors.phoneNumber = '请输入正确的11位手机号';
      } else {
        this.errors.phoneNumber = '';
      }
    },
    validatePassword() {
      if (!this.password) {
        this.errors.password = '';
        return;
      }
      
      if (this.password.length < 6) {
        this.errors.password = '密码至少需要6位';
      } else if (this.password.length > 20) {
        this.errors.password = '密码不能超过20位';
      } else {
        this.errors.password = '';
      }
    },
    async submitPhoneNumber() {
      // 清除之前的消息
      this.errorMessage = '';
      this.successMessage = '';
      
      // 验证表单
      this.validatePhoneNumber();
      this.validatePassword();
      
      if (!this.canSubmit) {
        if (!this.isAgreed) {
          this.errorMessage = '请先同意用户协议';
        }
        return;
      }
      
      this.loading = true;
      
      try {
        // 尝试注册（新用户自动注册）
        const res = await userAPI.register(
          `用户${this.phoneNumber.slice(-4)}`,
          this.phoneNumber,
          this.password
        );
        
        // 保存登录信息
        localStorage.setItem('token', res.token || 'mock-token');
        localStorage.setItem('userId', res.user?.id || Date.now());
        localStorage.setItem('username', res.user?.username || `用户${this.phoneNumber.slice(-4)}`);
        
        this.successMessage = '登录成功，即将跳转...';
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.$router.push('/HomePage');
        }, 1000);
        
      } catch (e) {
        console.error('登录/注册失败:', e);
        
        // 根据错误类型显示不同的提示
        if (e?.response?.status === 409) {
          this.errorMessage = '该手机号已注册，请直接登录';
        } else if (e?.response?.status === 400) {
          this.errorMessage = '手机号或密码格式不正确';
        } else {
          this.errorMessage = e?.response?.data?.error || '登录失败，请稍后重试';
        }
      } finally {
        this.loading = false;
      }
    },
    clearMessage() {
      this.errorMessage = '';
      this.successMessage = '';
    }
  },
  watch: {
    phoneNumber() {
      this.clearMessage();
    },
    password() {
      this.clearMessage();
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
  min-height: 100vh;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.content {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 8px;
  padding: 12px 15px;
  transition: all 0.3s ease;
  position: relative;
}

.input-group:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group.has-error {
  border-color: #ff4d4f;
}

.country-code {
  margin-right: 10px;
  padding-right: 10px;
  border-right: 1px solid #e0e0e0;
}

.country-code select {
  border: none;
  font-size: 16px;
  outline: none;
  cursor: pointer;
  color: #333;
}

input[type="text"],
input[type="tel"],
input[type="password"] {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
}

input::placeholder {
  color: #999;
}

.valid-icon {
  color: #52c41a;
  font-weight: bold;
  margin-left: 10px;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0 5px;
  margin-left: 10px;
}

.error-text {
  color: #ff4d4f;
  font-size: 12px;
  margin: 0 0 15px 5px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.password-strength {
  margin-bottom: 20px;
}

.strength-bar {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background-color: #ff4d4f;
}

.strength-fill.medium {
  background-color: #faad14;
}

.strength-fill.strong {
  background-color: #52c41a;
}

.strength-text {
  font-size: 12px;
  color: #666;
}

.login-button {
  width: 100%;
  padding: 14px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-button.loading {
  position: relative;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.success-message {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.privacy-section {
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  margin-bottom: 20px;
}

.privacy-section input[type="checkbox"] {
  margin-right: 5px;
  cursor: pointer;
}

.privacy-label {
  cursor: pointer;
}

.privacy-link {
  color: #667eea;
  text-decoration: none;
  margin: 0 2px;
}

.privacy-link:hover {
  text-decoration: underline;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-link {
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
}

.option-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .content {
    padding: 30px 20px;
  }
  
  h1 {
    font-size: 24px;
  }
}
</style>