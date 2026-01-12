import { createRouter, createWebHistory } from 'vue-router';
import LoginPage1 from '../views/LoginPage/LoginPage1.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginPage/LoginPageOptimized.vue'),
  },
  {
    path: '/login-old',
    name: 'LoginPage1',
    component: LoginPage1,
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/LoginPagePhoneNumber',
    name: 'LoginPagePhoneNumber',
    component: () => import('../views/LoginPage/LoginPagePhoneNumber.vue'),
  },
  {
    path: '/LoginPagePN2',
    name: 'LoginPagePN2',
    component: () => import('../views/LoginPage/LoginPagePN2.vue'),
  },
  {
    path: '/HomePage',
    name: 'HomePage',
    component: () => import('../components/HomePageOptimized.vue'),
  },
  {
    path: '/HomePage-old',
    name: 'HomePageOld',
    component: () => import('../components/PostHomePage.vue'),
  },
  {
    path: '/home',
    redirect: '/HomePage'
  },
  // 单一路由声明，避免重复
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('../components/posts/PostDetailOptimized.vue'),
    props: true
  },
  {
    path: '/post-old/:id',
    name: 'PostDetailOld',
    component: () => import('../components/posts/PostDetail.vue'),
    props: true
  },
  // 发帖页面
  {
    path: '/create-post',
    name: 'CreatePost',
    component: () => import('../views/CreatePost.vue')
  }
  ,
  {
    path: '/me',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue')
  }
  ,
  {
    path: '/voice-enroll',
    name: 'VoiceEnrollment',
    component: () => import('../views/VoiceEnrollmentOptimized.vue')
  },
  {
    path: '/voice-enroll-old',
    name: 'VoiceEnrollmentOld',
    component: () => import('../views/VoiceEnrollment.vue')
  },
  {
    path: '/voice-enroll-v2',
    name: 'VoiceEnrollmentV2',
    component: () => import('../views/VoiceEnrollmentV2.vue')
  }
  ,
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue')
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue')
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('../views/Contacts.vue')
  },
  {
    path: '/topics',
    name: 'Topics',
    component: () => import('../views/Topics.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
