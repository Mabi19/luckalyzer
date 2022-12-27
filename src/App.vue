<template>
    <div class="container">
        <div class="column">
            <AppLogo/>
            <PickerRoot/>
        </div>
        <img :src="imageURLs[background]" class="background"/>
        <img v-if="newBackground" :src="imageURLs[newBackground]" @animationend="finishAnim" class="new-bg background"/>
    </div>
</template>

<script setup lang="ts">
import AppLogo from "./components/AppLogo.vue";
import PickerRoot from "./components/PickerRoot.vue";
import { currentBackground, Background, imageURLs } from "./Background";
import { ref, watch } from "vue";

const background = ref<Background>(currentBackground.value);
const newBackground = ref<Background | null>(null);

watch(currentBackground, () => {
    newBackground.value = currentBackground.value;
});

function finishAnim() {
    if (newBackground.value) {
        background.value = newBackground.value;
        newBackground.value = null;
    }
}
</script>

<style scoped>
.container {
    width: 100%;
}

.column {
    width: 600px;
    max-width: 100%;
    padding: 16px;

    margin: auto;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 16px;
}

@keyframes fade-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.new-bg {
    z-index: -1;
    animation: fade-in 1s;
}

.background {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100vh;
    aspect-ratio: 16 / 9;
    z-index: -2;
}

@media (min-aspect-ratio: 16 / 9) {
    .background {
        width: 100vw;
        height: auto;
    }
}
</style>
