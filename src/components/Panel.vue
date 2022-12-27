<template>
    <div class="panel t-white shadow" :class="{ [props.color]: true }">
        <slot/>
    </div>
</template>

<script setup lang="ts">


const props = withDefaults(defineProps<{
    color?: string
}>(), {
    color: "black"
});
</script>

<style>
.panel {
    width: 100%;
    padding: 8px;
}

.panel.black {
    /* background-color: black; */
    color: white;
    border-image: url("../assets/panel-border-image.svg") 20% fill / 4px / 0px stretch;
}
</style>