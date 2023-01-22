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

/* The code that adds the class is located in awesome-easter-egg.ts */
.awesome .panel.black {
    border-image: url("../assets/awesome-border-image.svg") 20% fill / 4px / 0px stretch !important;
}

.panel.black {
    /* background-color: black; */
    border-image: url("../assets/panel-border-image.svg") 20% fill / 4px / 0px stretch;
}

.panel.blue {
    border-image: url("../assets/info-border-image.svg") 20% fill / 2px / 0px stretch;
}

.panel.yellow {
    border-image: url("../assets/warning-border-image.svg") 20% fill / 2px / 0px stretch;
}
</style>