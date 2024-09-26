<template>
    <footer class="bottom-nav" style="margin: 0 10px;">
        <i class="icon-home active">🏠</i>
        <i class="icon-search">🔍</i>
        <i class="icon-add">➕</i>
        <i class="icon-notification">🔔</i>
        <i class="icon-profile">👤</i>
    </footer>
</template>

<script>
export default {
    name: 'AppFooter'  // 保持名称为多词，方便识别.
};
</script>

<style scoped>
.bottom-nav {
    background-color: #fff;
    padding: 10px 0;
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
}

.bottom-nav i {
    font-size: 24px;
    cursor: pointer;
}

.bottom-nav i.active {
    color: #000;
}
</style>