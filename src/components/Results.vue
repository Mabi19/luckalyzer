<template>
    <Panel v-if="isWorking && isBigWork">
        <div class="calculating"><LoadingSpinner/><span>Calculating...</span></div>
    </Panel>
    <Panel v-else-if="updateSeen">
        <div v-html="probabilityText"></div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from "./Panel.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import { values, isWorking, isBigWork } from "../calc";
import { computed, ref, watch } from "vue";

const probability = computed(() => (1.0 - values.cdf) + values.pmf);
// This is used to not show values obtained from a previously selected mode
const updateSeen = ref(false);
watch([values], () => updateSeen.value = true);

function formatProbability(probability: number) {
    // toPrecision() returns trailing zeroes
    const stringified = (probability * 100.0)
        .toPrecision(3)
        .replace(/\.?0+$/, "");
    return `${stringified}%`;
}

const probabilityText = computed(() => {
    const probText = formatProbability(probability.value);
    if (probability.value == 0 || probText.includes("e")) {
        return `<span class="t-red">Error</span>: result too small to display accurately`;
    } else {
        return `<span class="t-yellow">${probText}</span> <span class="t-aqua">(1/${Math.round(1 / probability.value)})</span> of people have your luck or better!`;
    }
});
</script>

<style scoped>
.calculating * {
    vertical-align: middle;
}
.calculating span {
    margin-left: 4px;
}
</style>