<template>
    <Modal title="About" :show="aboutShown" @close="aboutShown = false">
        <p>
            The Luckalyzer is a probability calculator for Hypixel SkyBlock.
        </p>
        <p>
            Made by <CreditsPlayer ign="Mabi19" profile="Coconut"/>
            with help from <CreditsPlayer ign="cslt" profile="Pomegranate"/>,
            giving countless opinions and the data I couldn't obtain myself,
            also <a href="https://redd.it/vilrsm">being RNG carried</a> which is what inspired me to create this in the first place,
            and <CreditsPlayer ign="Zorbas05" profile="Banana"/>, who assisted with taking the Dungeon backgrounds.

        </p>
        <p>
            Background pictures taken using <a href="https://www.complementary.dev/shaders-v4/">Complementary Shaders</a> and <a href="https://imgur.com/0tDBwww">lots of Fabric mods</a>.
            Icon made by <CreditsPlayer ign="darth_taco_tmp"/>.
            Minecraft font by Mojang.
        </p>
        <template v-slot:footer>
            version {{ version }} (build {{ buildID }})
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from "./Modal.vue";
import CreditsPlayer from "./CreditsPlayer.vue";
import { ref } from "vue";

const version = __APP_VERSION__;
const buildID = __BUILD_ID__;

const aboutShown = ref(false);

function open() {
    aboutShown.value = true;
}

defineExpose({ open });
</script>
