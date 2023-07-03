<template>
    <Panel>
        <label class="row">
            <span>Total attempts at metaphysical Superpairs</span>
            <input type="number" v-model="attempts" min="1" />
        </label>
        <label class="row">
            <span>T7 books obtained</span>
            <input
                type="number"
                v-model="successes"
                min="0"
                :max="attempts ?? undefined"
            />
        </label>
        <label class="row">
            <span>Enderman Slayer LVL 8?</span>
            <input type="checkbox" v-model="eman8" />
        </label>
        <label class="row indent" v-if="eman8">
            <span>obtained after completing</span>
            <input
                type="number"
                v-model="eman8After"
                min="0"
                :max="attempts ?? undefined"
            />
            <span>metaphysical Superpairs</span>
        </label>
        <label class="row">
            <span><span class="t-gray">[Lvl 100]</span> Mythic Guardian Pet?</span>
            <input type="checkbox" v-model="mythicGuardian" />
        </label>
        <label class="row indent" v-if="mythicGuardian">
            <span>obtained after completing</span>
            <input
                type="number"
                v-model="mythicGuardianAfter"
                min="0"
                :max="attempts ?? undefined"
            />
            <span>metaphysical Superpairs</span>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes != null" />
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from "vue";
import { poibinUpdate } from "../calc";
import { currentBackground } from "../Background";
import Panel from "./Panel.vue";
import Results from "./Results.vue";

// set the background
currentBackground.value = "experiments";

const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);
const eman8 = ref(false);
const eman8After = ref(0);
const mythicGuardian = ref(false);
const mythicGuardianAfter = ref(0);

const probabilityArray = computed(() => {
    if (attempts.value && successes.value != null) {
        const beforeEman8 = eman8.value ? eman8After.value : attempts.value;
        const beforeMythicGuardian = mythicGuardian.value
            ? mythicGuardianAfter.value
            : attempts.value;
        return new Array(attempts.value).fill(0.01).map((base, idx) => {
            let mult = 1;
            // NOTE: This assumes that the probabilities are additive
            // Enderman Slayer LVL 8
            if (idx >= beforeEman8) {
                mult += 0.15;
            }
            // [Lvl 100] Mythic Guardian Pet
            if (idx >= beforeMythicGuardian) {
                mult += 0.07;
            }
            return base * mult;
        });
    } else {
        return null;
    }
});

// recompute when the probabilities change
watchEffect(() => {
    if (
        probabilityArray.value &&
        successes.value != null &&
        successes.value <= attempts.value!
    ) {
        poibinUpdate(probabilityArray.value, successes.value);
    }
});

// sync them so that successes or experiments obtained before eman 8 cannot be larger than attempts
watchEffect(() => {
    if (attempts.value && successes.value != null) {
        if (successes.value > attempts.value) {
            successes.value = attempts.value;
        }
    }

    if (attempts.value && eman8After.value > attempts.value) {
        eman8After.value = attempts.value;
    }

    if (attempts.value && mythicGuardianAfter.value > attempts.value) {
        mythicGuardianAfter.value = attempts.value;
    }
});
</script>
