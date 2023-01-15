<template>
    <Panel>
        <label class="row">
            <span>Item</span>
            <AppSelect v-model="item" :options="itemSelectorOptions"/>
        </label>
    </Panel>

    <Panel v-if="item">
        <label class="row">
            <span>Magic Find</span>
            <input type="number" v-model="magicFind" min="0" max="900"/>
        </label>
        <label class="row">
            <span>Looting level</span>
            <AppSelect v-model="looting" :options="[
                { id: '0', label: '0' },
                { id: '1', label: 'I' },
                { id: '2', label: 'II' },
                { id: '3', label: 'III', color: 'blue' },
                { id: '4', label: 'IV', color: 'gold', },
                { id: '5', label: 'V', color: 'red' },
            ]"/>
        </label>
        <label class="row">
            <span>{{ data[item].mob }}s slain</span>
            <input type="number" v-model="attempts" min="1"/>
        </label>
        <label class="row">
            <span>Selected item drops</span>
            <input type="number" v-model="successes" min="0" :max="maxSuccesses"/>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes != null"/>
</template>

<script setup lang="ts">
import { currentBackground } from "../Background";
import { poibinUpdate } from "../calc";
import { ref, computed, watchEffect } from "vue";
import Panel from "./Panel.vue";
import AppSelect from "./AppSelect.vue";
import Results from "./Results.vue";
import untypedData from "../assets/data/mythological.json";

const data = untypedData as Record<string, { name: string, color: string, mob: string, probability: number }>;

currentBackground.value = "mythological";

const item = ref<string | null>(null);
const magicFind = ref<number | null>(null);
const looting = ref<string | null>(null);
const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);

const itemSelectorOptions = Object.entries(data)
    .map(([id, value]) => ({
        id,
        label: value.name,
        color: value.color,
    }));

const probabilityArray = computed(() => {
    if (!(item.value && magicFind.value != null && looting.value != null && attempts.value && successes.value != null)) {
        return null;
    }
    const magicFindMultiplier = 1 + magicFind.value / 100;
    const lootingMultiplier = 1 + 0.15 * Number(looting.value);
    return new Array(attempts.value).fill(data[item.value].probability * magicFindMultiplier * lootingMultiplier);
});

const maxSuccesses = computed(() => attempts.value ?? undefined);

// recompute when the probabilities change
watchEffect(() => {
    if (probabilityArray.value && successes.value != null && successes.value <= attempts.value!) {
        poibinUpdate(probabilityArray.value, successes.value);
    }
});

// keep data in sync
watchEffect(() => {
    if (attempts.value && successes.value != null) {
        if (successes.value > attempts.value) {
            successes.value = maxSuccesses.value!;
        }
    }
});
</script>