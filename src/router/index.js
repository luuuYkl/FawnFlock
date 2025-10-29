import { createRouter, createWebHistory } from 'vue-router';
import LoginPage1 from '../views/LoginPage/LoginPage1.vue';

const routes = [
  {
    path: '/',
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
    component: () => import('../components/posts/PostDetail.vue'),
    props: true
  },
  // 发帖页面
  {
    path: '/create-post',
    name: 'CreatePost',
    component: () => import('../views/CreatePost.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
