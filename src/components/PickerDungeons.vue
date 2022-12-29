<template>
    <Panel>
        <label class="row">
            <span>Floor</span>
            <SelectWrapper>
                <select v-model="floor">
                    <option :value="null" disabled>Select an option...</option>
                    <optgroup label="Normal Mode">
                        <option value="f5">F5</option>
                        <option value="f6">F6</option>
                        <option value="f7">F7</option>
                    </optgroup>
                    <optgroup label="Master Mode">
                        <option value="m4" disabled>M4</option>
                        <option value="m5" disabled>M5</option>
                        <option value="m6" disabled>M6</option>
                        <option value="m7">M7</option>
                    </optgroup>
                </select>
            </SelectWrapper>
        </label>
    </Panel>

    <Panel v-if="floor">
        <label class="row">
            <span>Item</span>
            <SelectWrapper>
                <select v-model="item" :class="itemColorClass(item)">
                    <option :value="null" disabled>Select an option...</option>
                    <option v-for="item in Object.keys(data[floor])" :value="item" :class="itemColorClass(item)">{{ data[floor][item].name }}</option>
                </select>
            </SelectWrapper>
        </label>
        <label>
            <span>RNG meter used?</span>
            <input type="checkbox" v-model="rngMeterUsed"/>
        </label>
        <label class="row">
            <span>Runs</span>
            <input type="number" v-model="attempts" min="1"/>
        </label>
        <label class="row">
            <span>Selected item drop count <span v-if="rngMeterUsed" class="inline-note">(NOT including guaranteed drops from completing the RNG meter)</span></span>
            <input type="number" v-model="successes" min="0" :max="attempts ?? undefined"/>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes"/>
</template>

<script setup lang="ts">
import { ref, watchEffect, watch, computed } from "vue";
import { values, isWorking, poibinUpdate } from "../calc";
import { currentBackground } from "../Background";
import Panel from "./Panel.vue";
import Results from "./Results.vue";
import SelectWrapper from "./SelectWrapper.vue";
import untypedData from "../assets/data/dungeons.json";

const SCORE_PER_RUN = 303;

type ProbabilitySpecifier = number;
const data = untypedData as Record<string, Record<string, { name: string, mainChest: ProbabilitySpecifier, otherChests: ProbabilitySpecifier, fillScore: number, color: string }>>;

const floor = ref<string | null>(null);
const item = ref<string | null>(null);
const rngMeterUsed = ref(false);
const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);

function itemColorClass(item: string | null) {
    if (!floor.value || !item || data[floor.value][item] == undefined) return { "t-gray": true };
    return { [`t-${data[floor.value][item].color}`]: true }
}

// set the background
watchEffect(() => {
    switch (floor.value) {
        case null:
            currentBackground.value = "dungeons-generic";
            break;
        case "f1":
        case "m1":
            currentBackground.value = "dungeons-f1";
            break;
        case "f2":
        case "m2":
            currentBackground.value = "dungeons-f2";
            break;
        case "f3":
        case "m3":
            currentBackground.value = "dungeons-f3";
            break;
        case "f4":
        case "m4":
            currentBackground.value = "dungeons-f4";
            break;
        case "f5":
        case "m5":
            currentBackground.value = "dungeons-f5";
            break;
        case "f6":
        case "m6":
            currentBackground.value = "dungeons-f6";
            break;
        case "f7":
            currentBackground.value = "dungeons-f7";
            break;
        case "m7":
            currentBackground.value = "dungeons-m7";
            break;
    }
});

const probabilityArray = computed(() => {
    if (!floor.value || !item.value || !attempts.value || !successes.value || successes.value > attempts.value) {
        return null;
    } else {
        const itemData = data[floor.value][item.value];
        if (!itemData) return null;

        if (rngMeterUsed.value) {
            console.time("dungeon probability array");
            const baseChance = itemData.mainChest;
            const extraChance = itemData.otherChests;
            const fillScore = itemData.fillScore;

            const result = [];
            let currentScore = 0;

            for (let i = 0; i < attempts.value; i++) {
                result.push(baseChance * (1 + 2 * currentScore / fillScore) + extraChance);

                currentScore += SCORE_PER_RUN;
                if (currentScore >= fillScore) {
                    console.log("rolling over");
                    currentScore = 0;
                }
            }
            console.timeEnd("dungeon probability array");
            return result;
        } else {
            return new Array(attempts.value).fill(itemData.mainChest + itemData.otherChests);
        }
    }
});

// keep data in sync
watch(floor, () => {
    item.value = null;
    rngMeterUsed.value = false;
    attempts.value = null;
    successes.value = null;
});
watchEffect(() => {
    if (attempts.value && successes.value) {
        if (successes.value > attempts.value) {
            successes.value = attempts.value;
        }
    }
});

// recompute when the probabilities change
watchEffect(() => {
    if (probabilityArray.value && successes.value && successes.value <= attempts.value!) {
        poibinUpdate(probabilityArray.value, successes.value);
    }
});
</script>
