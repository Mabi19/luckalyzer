<template>
    <div class="head-wrapper"><img class="head" :src="imageURL()" :alt="imageAlt()"/><span>{{ ign }}</span></div>
</template>

<script setup lang="ts">
const props = defineProps<{
    ign: string
}>();

const imageURL = () => new URL(`../assets/heads/${props.ign}.png`, import.meta.url).href;
const imageAlt = () => `${props.ign}'s Minecraft head`;

</script>

<style scoped>
.head-wrapper {
    display: inline-block;
    vertical-align: baseline;
    color: var(--green);
}

.head {
    height: 1em;
    vertical-align: text-bottom;
    margin-right: 8px;
}
</style>