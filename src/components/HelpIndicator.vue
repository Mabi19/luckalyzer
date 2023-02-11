<template>
    <img src="../assets/icon-info.png" aria-haspopup="true" alt="Help" class="help-indicator" @mouseenter="$emit('update', true)"
        @mouseleave="$emit('update', false)"
    />
</template>

<script setup lang="ts">
const emit = defineEmits<{
    (event: "update", value: boolean): void
}>();

</script>

<style scoped>
.help-indicator {
    display: inline;
    height: 1rem;
}
</style>