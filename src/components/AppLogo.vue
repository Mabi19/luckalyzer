<template>
    <Panel>
        <div class="logo-wrapper">
            <img src="../assets/logo.png" class="logo-image" alt="The Hypixel SkyBlock Luckalyzer">
        </div>
        <div class="flavour-text">
           {{ flavourText }}
        </div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from "./Panel.vue";
import flavourTextData from "../assets/data/flavour-text.json";

function rollFlavourText() {
    let index: number;
    do {
        index = Math.floor(Math.random() * flavourTextData.length);
    } while (index == 9); // "This flavour text will never appear."
    return index;
}

const flavourText = flavourTextData[rollFlavourText()];
</script>

<style scoped>
.logo-wrapper {
    width: 100%;
    padding: 12px 12px 0 12px;
}

.logo-image {
    width: 100%;
    display: block;
    margin: auto;
    image-rendering: pixelated;
}

.flavour-text {
    color: #aaaaaa;
    font-style: italic;
    text-align: center;
}
</style>