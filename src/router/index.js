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
    // 懒加载路由.
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
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('../components/posts/PostDetail.vue')
  }
];


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// router.beforeEach((to, from, next) => {
//   const isLoggedIn = localStorage.getItem('isLoggedIn');

//   if (!isLoggedIn && to.name !== 'LoginPage1' && to.name !== 'LoginPagePhoneNumber' && to.name !== 'LoginPagePN2') {
//     // 如果未登录，且尝试访问非登录页、手机号登录页和验证码登录页，重定向到 LoginPage1
//     next({ name: 'LoginPage1' });
//   } else if (isLoggedIn && to.name === 'LoginPage1') {
//     // 如果已经登录，且尝试访问登录页，重定向到首页
//     next({ name: 'HomePage' });
//   } else {
//     // 否则正常导航
//     next();
//   }
// });


export default router;
