<template>
    <div class="container">
        <div class="column">
            <AppLogo/>
            <PickerRoot/>
        </div>
        <img :src="imageURLs[background]" class="background" role="presentation"/>
        <img v-if="newBackground" :src="imageURLs[newBackground]" @animationend="finishAnim" class="new-bg background" role="presentation"/>
    </div>
    <footer class="footer t-white">
        v{{ version }} &bull; <a @click.prevent="showAbout" class="link-button" href="#">about</a> &bull;
        <a class="link-button github-link" href="https://github.com/Mabi19/luckalyzer"><img src="./assets/github-mark.svg" alt="GitHub logo" class="github-logo"/> <span>github</span></a>
    </footer>
    <AboutDialog ref="aboutDialog"/>
</template>

<script setup lang="ts">
import AppLogo from "./components/AppLogo.vue";
import PickerRoot from "./components/PickerRoot.vue";
import AboutDialog from "./components/AboutDialog.vue";
import { currentBackground, Background, imageURLs } from "./Background";
import { ref, watch } from "vue";

const background = ref<Background>(currentBackground.value);
const newBackground = ref<Background | null>(null);
const version = __APP_VERSION__;

const aboutDialog = ref<InstanceType<typeof AboutDialog> | null>(null);

function showAbout() {
    aboutDialog.value?.open();
}

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
    flex-grow: 1; /* #app is a flexbox */
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

.footer {
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 12px;
    background: rgba(0, 0, 0, 0.7);
    text-align: center;
}

.github-link {
    text-decoration: none;
}

.github-link span {
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
}

.github-logo {
    height: 1em;
    vertical-align: -4px;
}
</style>
