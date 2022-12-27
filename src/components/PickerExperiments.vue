<template>
    <Panel>
        <label class="row">
            <span>Total attempts at metaphysical Superpairs</span>
            <input type="number" v-model="attempts" min="1"/>
        </label>
        <label class="row">
            <span>T7 books obtained</span>
            <input type="number" v-model="successes" min="0" :max="attempts ?? undefined"/>
        </label>
        <label class="row">
            <span>Enderman Slayer LVL 8?</span>
            <input type="checkbox" v-model="eman8"/>
        </label>
        <label class="row indent" v-if="eman8">
            <span>obtained after completing</span>
            <input type="number" v-model="eman8After" min="0" :max="attempts ?? undefined"/>
            <span>metaphysical Superpairs</span>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes"/>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from "vue";
import { values, isWorking, poibinUpdate } from "../calc";
import { Background, currentBackground } from "../Background";
import Panel from "./Panel.vue";
import Results from "./Results.vue";

// set the background
currentBackground.value = "experiments";

const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);
const eman8 = ref(false);
const eman8After = ref(0);

const probabilityArray = computed(() => {
    if (attempts.value && successes.value) {
        const beforeEman8 = eman8.value ? eman8After.value : attempts.value;
        const afterEman8 = eman8.value ? attempts.value - eman8After.value : 0;
        return new Array(beforeEman8).fill(0.01).concat(new Array(afterEman8).fill(0.0115)) as number[];
    } else {
        return null;
    }
});

// recompute when the probabilities change
watchEffect(() => {
    if (probabilityArray.value && successes.value && successes.value <= attempts.value!) {
        poibinUpdate(probabilityArray.value, successes.value);
    }
});

// sync them so that successes or experiments obtained before eman 8 cannot be larger than attempts
watchEffect(() => {
    if (attempts.value && successes.value) {
        if (successes.value > attempts.value) {
            successes.value = attempts.value;
        }
    }

    if (attempts.value && eman8After.value > attempts.value) {
        eman8After.value = attempts.value;
    }
})
</script>