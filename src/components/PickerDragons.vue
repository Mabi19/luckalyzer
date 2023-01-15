<template>
    <Panel>
        <label class="row">
            <span>Item</span>
            <AppSelect class="extra-wide" v-model="item" :options="itemSelectorOptions"/>
        </label>
        <label class="row">
            <span>Magic Find</span>
            <input type="number" v-model="magicFind" min="0" max="900"/>
        </label>
        <label class="row">
            <span>Pet Luck</span>
            <input type="number" v-model="petLuck" min="0" max="900"/>
        </label>
        <label class="row">
            <span>Eyes placed</span>
            <input type="number" v-model="eyesPlaced" min="0" max="8"/>
        </label>
        <label class="row">
            <span>Dragons slain</span>
            <input type="number" v-model="attempts" min="1"/>
        </label>
        <label class="row">
            <span>Selected item drops</span>
            <input type="number" v-model="successes" min="0" :max="maxSuccesses"/>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes != null">
        <Panel color="blue">
            <span>The real world is complicated, so this mode makes a few assumptions:</span>
            <ul>
                <li>You (or someone else who placed eyes) has the Dragon Piper perk</li>
                <li>An average amount of dragons were Superior ({{ Math.round((attempts ?? 0) * 0.044) }} in this case)</li>
                <li>You always get 452 or more Quality</li>
            </ul>
        </Panel>
    </Results>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from "vue";
import { poibinUpdate } from "../calc";
import { currentBackground } from "../Background";
import Panel from "./Panel.vue";
import AppSelect from "./AppSelect.vue";
import Results from "./Results.vue";
import untypedData from "../assets/data/dragons.json";

const data = untypedData as Record<string, { name: string, probability: number, affectedByEyesPlaced: boolean, superiorOnly: boolean, pet: boolean, color: string }>;

// set the background
currentBackground.value = "dragons";

const item = ref<string | null>(null);
const magicFind = ref<number | null>(null);
const petLuck = ref<number | null>(null);
const eyesPlaced = ref<number | null>(null);
const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);

const itemSelectorOptions = Object.entries(data)
    .map(([id, value]) => ({
        id,
        label: value.name,
        color: value.color,
    }));

const probabilityArray = computed(() => {
    if (item.value && magicFind.value != null && petLuck.value != null && eyesPlaced.value != null && attempts.value) {
        // 4.4% chance for a Superior Dragon with Dragon Piper
        const superiorDragons = Math.round(attempts.value * 0.044);

        let superiorProbability = 1;
        let otherProbability = 1;
        for (const [id, itemData] of Object.entries(data)) {

            const magicFindBonus = 1 + (itemData.pet ? magicFind.value + petLuck.value : magicFind.value) / 100;
            const eyeBonus = itemData.affectedByEyesPlaced ? eyesPlaced.value : 1;
            const itemProb = itemData.probability * magicFindBonus * eyeBonus;

            if (id == item.value) {
                superiorProbability = Math.min(1, superiorProbability * itemProb);
                if (itemData.superiorOnly) {
                    // Since it's Superior-only, set the probability for other dragons to 0
                    otherProbability = 0;
                } else {
                    otherProbability = Math.min(1, otherProbability * itemProb);
                }

                break;
            } else {
                superiorProbability = Math.max(0, superiorProbability * (1 - itemProb));
                if (!itemData.superiorOnly) {
                    otherProbability = Math.max(0, otherProbability * (1 - itemProb));
                }
            }
        }

        return new Array(superiorDragons).fill(superiorProbability)
            .concat(new Array(attempts.value - superiorDragons).fill(otherProbability));
    } else {
        return null;
    }
});

const maxSuccesses = computed(() => {
    if (!attempts.value) return undefined;

    if (item.value && data[item.value].superiorOnly) {
        return Math.round(attempts.value * 0.044);
    } else {
        return attempts.value;
    }
});

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
