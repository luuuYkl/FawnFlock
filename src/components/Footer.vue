<template>
    <footer class="bottom-nav">
        <i class="icon-home active" @click="goHome" role="button" aria-label="首页">🏠</i>
        <i class="icon-add" @click="goCreate" role="button" aria-label="发帖">➕</i>
        <i class="icon-notification" @click="goMessages" role="button" aria-label="私信">🔔</i>
        <i class="icon-profile" @click="goProfile" role="button" aria-label="个人页面">👤</i>
    </footer>
</template>

<script>
export default {
    name: 'AppFooter',
    methods: {
        goProfile() {
            if (this.$router) {
                this.$router.push({ name: 'UserProfile' }).catch(() => {});
            }
        },
        
        goMessages() {
            if (this.$router) {
                this.$router.push({ name: 'Messages' }).catch(() => {});
            }
        },
        goHome() {
            if (this.$router) {
                this.$router.push({ name: 'HomePage' }).catch(() => {});
            }
        },
        goCreate() {
            if (this.$router) {
                this.$router.push({ name: 'CreatePost' }).catch(() => {});
            }
        }
    }
};

</script>

<style scoped>
.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 64px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 10px;
    border-top: 1px solid #e6e6e6;
    box-shadow: 0 -6px 20px rgba(0,0,0,0.04);
    z-index: 1000;
}

.bottom-nav i {
    font-size: 24px;
    cursor: pointer;
}

.bottom-nav i.active {
    color: #000;
}
</style>