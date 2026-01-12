<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="background-decoration"></div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo 和应用名称 -->
      <div class="app-header">
        <img src="@/assets/2022-09-16.png" alt="Logo" class="app-logo" />
        <h1 class="app-name">FawnFlock</h1>
        <p class="app-slogan">一个温暖的社交平台</p>
      </div>

      <!-- 登录/注册切换选项卡 -->
      <div class="tab-switcher">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'login' }"
          @click="switchTab('login')"
        >
          登录
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'register' }"
          @click="switchTab('register')"
        >
          注册
        </button>
        <div class="tab-indicator" :class="{ 'to-register': activeTab === 'register' }"></div>
      </div>

      <!-- 表单区域 -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- 登录表单 -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'login'" key="login" class="form-content">
            <!-- 手机号/邮箱 -->
            <div class="input-wrapper">
              <div class="input-group" :class="{ focused: focusedInput === 'account', error: errors.account }">
                <span class="input-icon">📱</span>
                <input
                  v-model="loginForm.account"
                  type="text"
                  placeholder="手机号 / 邮箱"
                  @focus="focusedInput = 'account'"
                  @blur="focusedInput = ''; validateAccount()"
                  autocomplete="username"
                />
                <span v-if="loginForm.account && !errors.account" class="valid-icon">✓</span>
              </div>
              <p v-if="errors.account" class="error-hint">{{ errors.account }}</p>
            </div>

            <!-- 密码 -->
            <div class="input-wrapper">
              <div class="input-group" :class="{ focused: focusedInput === 'password', error: errors.password }">
                <span class="input-icon">🔒</span>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="密码"
                  @focus="focusedInput = 'password'"
                  @blur="focusedInput = ''"
                  @keyup.enter="handleSubmit"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <p v-if="errors.password" class="error-hint">{{ errors.password }}</p>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-else key="register" class="form-content">
            <!-- 用户名 -->
            <div class="input-wrapper">
              <div class="input-group" :class="{ focused: focusedInput === 'username', error: errors.username }">
                <span class="input-icon">👤</span>
                <input
                  v-model="registerForm.username"
                  type="text"
                  placeholder="用户名"
                  @focus="focusedInput = 'username'"
                  @blur="focusedInput = ''; validateUsername()"
                  autocomplete="username"
                />
                <span v-if="registerForm.username && !errors.username" class="valid-icon">✓</span>
              </div>
              <p v-if="errors.username" class="error-hint">{{ errors.username }}</p>
            </div>

            <!-- 手机号 -->
            <div class="input-wrapper">
              <div class="input-group" :class="{ focused: focusedInput === 'phone', error: errors.phone }">
                <span class="input-icon">📱</span>
                <div class="country-code">+86</div>
                <input
                  v-model="registerForm.phone"
                  type="tel"
                  placeholder="手机号"
                  maxlength="11"
                  @focus="focusedInput = 'phone'"
                  @blur="focusedInput = ''; validatePhone()"
                  autocomplete="tel"
                />
                <span v-if="registerForm.phone && !errors.phone" class="valid-icon">✓</span>
              </div>
              <p v-if="errors.phone" class="error-hint">{{ errors.phone }}</p>
            </div>

            <!-- 密码 -->
            <div class="input-wrapper">
              <div class="input-group" :class="{ focused: focusedInput === 'regPassword', error: errors.regPassword }">
                <span class="input-icon">🔒</span>
                <input
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="密码 (6-20位)"
                  maxlength="20"
                  @focus="focusedInput = 'regPassword'"
                  @blur="focusedInput = ''; validateRegPassword()"
                  @input="calculatePasswordStrength"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <p v-if="errors.regPassword" class="error-hint">{{ errors.regPassword }}</p>
              
              <!-- 密码强度指示器 -->
              <div v-if="registerForm.password && activeTab === 'register'" class="password-strength">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrength + '%' }"
                  ></div>
                </div>
                <span class="strength-label">密码强度: {{ passwordStrengthText }}</span>
              </div>
            </div>

            <!-- 确认密码 -->
            <div class="input-wrapper">
              <div class="input-group" :class="{ focused: focusedInput === 'confirmPassword', error: errors.confirmPassword }">
                <span class="input-icon">🔒</span>
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="确认密码"
                  @focus="focusedInput = 'confirmPassword'"
                  @blur="focusedInput = ''; validateConfirmPassword()"
                  @keyup.enter="handleSubmit"
                  autocomplete="new-password"
                />
              </div>
              <p v-if="errors.confirmPassword" class="error-hint">{{ errors.confirmPassword }}</p>
            </div>
          </div>
        </transition>

        <!-- 提交按钮 -->
        <button
          type="submit"
          class="submit-button"
          :class="{ loading: loading }"
          :disabled="loading || !canSubmit"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ activeTab === 'login' ? '登录' : '注册' }}</span>
        </button>

        <!-- 消息提示 -->
        <transition name="message">
          <div v-if="message.text" class="message" :class="message.type">
            {{ message.text }}
          </div>
        </transition>

        <!-- 辅助操作 -->
        <div class="auxiliary-actions">
          <a href="#" class="action-link" @click.prevent="handleForgotPassword">忘记密码?</a>
          <span class="separator">|</span>
          <a href="#" class="action-link" @click.prevent="switchTab(activeTab === 'login' ? 'register' : 'login')">
            {{ activeTab === 'login' ? '注册新账号' : '已有账号登录' }}
          </a>
        </div>

        <!-- 用户协议 -->
        <div class="agreement-section">
          <label class="checkbox-label">
            <input type="checkbox" v-model="agreed" />
            <span class="checkbox-text">
              我已阅读并同意
              <a href="#" class="link" @click.prevent="showAgreement('user')">《用户协议》</a>
              和
              <a href="#" class="link" @click.prevent="showAgreement('privacy')">《隐私政策》</a>
            </span>
          </label>
        </div>

        <!-- 第三方登录 -->
        <div class="third-party-login">
          <div class="divider">
            <span class="divider-text">其他登录方式</span>
          </div>
          <div class="third-party-buttons">
            <button type="button" class="third-party-btn wechat" @click="thirdPartyLogin('wechat')" title="微信登录">
              <span class="icon">💬</span>
            </button>
            <button type="button" class="third-party-btn qq" @click="thirdPartyLogin('qq')" title="QQ登录">
              <span class="icon">🐧</span>
            </button>
            <button type="button" class="third-party-btn github" @click="thirdPartyLogin('github')" title="GitHub登录">
              <span class="icon">🐱</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { userAPI } from '@/services/api.service';

export default {
  name: 'LoginPageOptimized',
  data() {
    return {
      activeTab: 'login',
      focusedInput: '',
      showPassword: false,
      loading: false,
      agreed: false,
      
      loginForm: {
        account: '',
        password: ''
      },
      
      registerForm: {
        username: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      
      errors: {
        account: '',
        password: '',
        username: '',
        phone: '',
        regPassword: '',
        confirmPassword: ''
      },
      
      message: {
        text: '',
        type: '' // success, error, warning
      },
      
      passwordStrength: 0
    };
  },
  
  computed: {
    canSubmit() {
      if (!this.agreed) return false;
      
      if (this.activeTab === 'login') {
        return this.loginForm.account && 
               this.loginForm.password && 
               !this.errors.account && 
               !this.errors.password;
      } else {
        return this.registerForm.username && 
               this.registerForm.phone && 
               this.registerForm.password && 
               this.registerForm.confirmPassword &&
               !this.errors.username &&
               !this.errors.phone &&
               !this.errors.regPassword &&
               !this.errors.confirmPassword;
      }
    },
    
    passwordStrengthClass() {
      if (this.passwordStrength < 40) return 'weak';
      if (this.passwordStrength < 70) return 'medium';
      return 'strong';
    },
    
    passwordStrengthText() {
      if (this.passwordStrength < 40) return '弱';
      if (this.passwordStrength < 70) return '中等';
      return '强';
    }
  },
  
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
      this.clearErrors();
      this.clearMessage();
      this.showPassword = false;
    },
    
    validateAccount() {
      const account = this.loginForm.account;
      if (!account) {
        this.errors.account = '';
        return;
      }
      
      const isPhone = /^1[3-9]\d{9}$/.test(account);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account);
      
      if (!isPhone && !isEmail) {
        this.errors.account = '请输入正确的手机号或邮箱';
      } else {
        this.errors.account = '';
      }
    },
    
    validateUsername() {
      const username = this.registerForm.username;
      if (!username) {
        this.errors.username = '';
        return;
      }
      
      if (username.length < 2 || username.length > 20) {
        this.errors.username = '用户名长度为2-20个字符';
      } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) {
        this.errors.username = '用户名只能包含中文、字母、数字和下划线';
      } else {
        this.errors.username = '';
      }
    },
    
    validatePhone() {
      const phone = this.registerForm.phone;
      if (!phone) {
        this.errors.phone = '';
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        this.errors.phone = '请输入正确的11位手机号';
      } else {
        this.errors.phone = '';
      }
    },
    
    validateRegPassword() {
      const password = this.registerForm.password;
      if (!password) {
        this.errors.regPassword = '';
        return;
      }
      
      if (password.length < 6) {
        this.errors.regPassword = '密码至少需要6位';
      } else if (password.length > 20) {
        this.errors.regPassword = '密码不能超过20位';
      } else {
        this.errors.regPassword = '';
      }
    },
    
    validateConfirmPassword() {
      if (!this.registerForm.confirmPassword) {
        this.errors.confirmPassword = '';
        return;
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致';
      } else {
        this.errors.confirmPassword = '';
      }
    },
    
    calculatePasswordStrength() {
      const pwd = this.registerForm.password;
      if (!pwd) {
        this.passwordStrength = 0;
        return;
      }
      
      let strength = 0;
      
      // 长度
      if (pwd.length >= 6) strength += 20;
      if (pwd.length >= 10) strength += 20;
      if (pwd.length >= 14) strength += 10;
      
      // 包含小写字母
      if (/[a-z]/.test(pwd)) strength += 15;
      
      // 包含大写字母
      if (/[A-Z]/.test(pwd)) strength += 15;
      
      // 包含数字
      if (/\d/.test(pwd)) strength += 10;
      
      // 包含特殊字符
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 10;
      
      this.passwordStrength = Math.min(strength, 100);
    },
    
    clearErrors() {
      this.errors = {
        account: '',
        password: '',
        username: '',
        phone: '',
        regPassword: '',
        confirmPassword: ''
      };
    },
    
    showMessage(text, type = 'error') {
      this.message = { text, type };
      setTimeout(() => {
        this.message = { text: '', type: '' };
      }, 4000);
    },
    
    clearMessage() {
      this.message = { text: '', type: '' };
    },
    
    async handleSubmit() {
      if (!this.agreed) {
        this.showMessage('请先阅读并同意用户协议和隐私政策', 'warning');
        return;
      }
      
      if (!this.canSubmit) return;
      
      this.loading = true;
      this.clearMessage();
      
      try {
        if (this.activeTab === 'login') {
          await this.handleLogin();
        } else {
          await this.handleRegister();
        }
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async handleLogin() {
      try {
        const res = await userAPI.login(this.loginForm.account, this.loginForm.password);
        
        // 保存登录信息
        localStorage.setItem('token', res.token || 'mock-token');
        localStorage.setItem('userId', res.user?.id || Date.now());
        localStorage.setItem('username', res.user?.username || this.loginForm.account);
        localStorage.setItem('isLoggedIn', 'true');
        
        this.showMessage('登录成功！', 'success');
        
        setTimeout(() => {
          this.$router.push('/HomePage');
        }, 1000);
      } catch (error) {
        console.error('登录失败:', error);
        
        if (error?.response?.status === 404) {
          this.showMessage('用户不存在，请先注册', 'error');
        } else if (error?.response?.status === 401) {
          this.showMessage('密码错误，请重试', 'error');
        } else {
          this.showMessage(error?.response?.data?.error || '登录失败，请稍后重试', 'error');
        }
      }
    },
    
    async handleRegister() {
      try {
        // 验证所有字段
        this.validateUsername();
        this.validatePhone();
        this.validateRegPassword();
        this.validateConfirmPassword();
        
        if (this.errors.username || this.errors.phone || 
            this.errors.regPassword || this.errors.confirmPassword) {
          return;
        }
        
        const res = await userAPI.register(
          this.registerForm.username,
          this.registerForm.phone,
          this.registerForm.password
        );
        
        // 保存登录信息
        localStorage.setItem('token', res.token || 'mock-token');
        localStorage.setItem('userId', res.user?.id || Date.now());
        localStorage.setItem('username', res.user?.username || this.registerForm.username);
        localStorage.setItem('isLoggedIn', 'true');
        
        this.showMessage('注册成功！即将跳转...', 'success');
        
        setTimeout(() => {
          this.$router.push('/HomePage');
        }, 1500);
      } catch (error) {
        console.error('注册失败:', error);
        
        if (error?.response?.status === 409) {
          this.showMessage('该手机号已被注册', 'error');
        } else if (error?.response?.status === 400) {
          this.showMessage('注册信息格式不正确', 'error');
        } else {
          this.showMessage(error?.response?.data?.error || '注册失败，请稍后重试', 'error');
        }
      }
    },
    
    handleForgotPassword() {
      this.showMessage('忘记密码功能即将开放', 'warning');
    },
    
    showAgreement(type) {
      const text = type === 'user' ? '用户协议' : '隐私政策';
      this.showMessage(`${text}功能即将开放`, 'warning');
    },
    
    thirdPartyLogin(platform) {
      const platformNames = {
        wechat: '微信',
        qq: 'QQ',
        github: 'GitHub'
      };
      this.showMessage(`${platformNames[platform]}登录功能即将开放`, 'warning');
    }
  }
};
</script>

<style scoped>
/* ===== 主容器 ===== */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 50%, #f8f9fa 100%);
}

/* ===== 背景装饰 ===== */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image: 
    radial-gradient(circle at 20% 30%, #6366f1 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, #ec4899 0%, transparent 50%);
  pointer-events: none;
}

/* ===== 登录卡片 ===== */
.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 1;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 应用头部 ===== */
.app-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  object-fit: contain;
  animation: fadeInScale 0.5s ease-out 0.1s both;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.app-name {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.app-slogan {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* ===== 选项卡切换器 ===== */
.tab-switcher {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
  position: relative;
}

.tab-button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
}

.tab-button.active {
  color: #6366f1;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.tab-indicator.to-register {
  transform: translateX(calc(100% + 4px));
}

/* ===== 表单 ===== */
.login-form {
  width: 100%;
}

.form-content {
  margin-bottom: 24px;
}

/* ===== 输入框 ===== */
.input-wrapper {
  margin-bottom: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  transition: all 0.3s ease;
}

.input-group:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.input-group.focused {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-group.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-icon {
  font-size: 18px;
  margin-right: 10px;
  opacity: 0.6;
}

.input-group.focused .input-icon {
  opacity: 1;
}

.country-code {
  padding-right: 10px;
  margin-right: 10px;
  border-right: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.input-group input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #1a1a1a;
  font-family: inherit;
}

.input-group input::placeholder {
  color: #9ca3af;
  font-size: 14px;
}

.valid-icon {
  color: #10b981;
  font-size: 18px;
  margin-left: 8px;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.toggle-password {
  background: none;
  border: none;
  padding: 0 4px;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.5;
  transition: opacity 0.2s;
  margin-left: 8px;
}

.toggle-password:hover {
  opacity: 1;
}

.error-hint {
  margin: 6px 0 0 4px;
  font-size: 12px;
  color: #ef4444;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* ===== 密码强度 ===== */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.strength-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.strength-fill.strong {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.strength-label {
  font-size: 12px;
  color: #6b7280;
}

/* ===== 提交按钮 ===== */
.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.submit-button:hover:not(:disabled)::before {
  left: 100%;
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 消息提示 ===== */
.message {
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;
  font-size: 14px;
  text-align: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.message.warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from, .message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== 辅助操作 ===== */
.auxiliary-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  gap: 12px;
  font-size: 14px;
}

.action-link {
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.action-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.separator {
  color: #d1d5db;
}

/* ===== 用户协议 ===== */
.agreement-section {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  margin: 2px 8px 0 0;
  cursor: pointer;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.checkbox-text {
  flex: 1;
}

.checkbox-text .link {
  color: #6366f1;
  text-decoration: none;
}

.checkbox-text .link:hover {
  text-decoration: underline;
}

/* ===== 第三方登录 ===== */
.third-party-login {
  margin-top: 24px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background: #ffffff;
  font-size: 12px;
  color: #9ca3af;
}

.third-party-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.third-party-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.third-party-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.third-party-btn.wechat:hover {
  border-color: #07c160;
  background: #f0fdf4;
}

.third-party-btn.qq:hover {
  border-color: #12b7f5;
  background: #eff6ff;
}

.third-party-btn.github:hover {
  border-color: #333333;
  background: #f9fafb;
}

/* ===== 过渡动画 ===== */
.fade-enter-active, .fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* ===== 响应式设计 ===== */
@media (max-width: 480px) {
  .login-page {
    padding: 20px 16px;
  }
  
  .login-card {
    max-width: 100%;
    padding: 32px 24px;
    border-radius: 8px;
  }
  
  .app-logo {
    width: 64px;
    height: 64px;
  }
  
  .app-name {
    font-size: 24px;
  }
  
  .input-group {
    padding: 10px 12px;
  }
  
  .submit-button {
    padding: 12px;
    font-size: 15px;
  }
}

/* 适配移动端宽度为90% */
@media (max-width: 768px) {
  .login-card {
    max-width: 90%;
  }
}
</style>
