<template>
    <div class="head-wrapper"><img class="head" :src="imageURL()" :alt="imageAlt()"/>
        <a v-if="profile" class="skycrypt-link" :href="skycryptURL()">{{ ign }}</a>
        <span v-else>{{ ign }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    ign: string,
    profile?: string,
}>();

const imageURL = () => new URL(`../assets/heads/${props.ign}.png`, import.meta.url).href;
const skycryptURL = () => `https://sky.shiiyu.moe/stats/${props.ign}/${props.profile}`;
const imageAlt = () => `${props.ign}'s Minecraft head`;

</script>

<style scoped>
.head-wrapper {
    display: inline-block;
    vertical-align: baseline;
}

.head-wrapper * {
    color: var(--green);
}

.head {
    height: 1em;
    vertical-align: text-bottom;
    margin-right: 8px;
}
</style>