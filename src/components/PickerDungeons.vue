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
                        <option value="m4">M4</option>
                        <option value="m5">M5</option>
                        <option value="m6">M6</option>
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
                <select v-model="item" :class="itemColorClass(item)" class="extra-wide">
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
            <span>Kismet Feathers used?</span>
            <input type="checkbox" v-model="kismetFeathersUsed"/>
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

    <Results v-if="probabilityArray && successes">
        <Panel color="blue">
            <span>The real world is complicated, so this mode makes a few assumptions:</span>
            <ul>
                <li v-if="rngMeterUsed">The RNG meter has existed since before you started running the floor</li>
                <li v-if="kismetFeathersUsed">
                    You use a simple kismet strategy: always reroll unless you got your chosen drop
                    <span v-if="rngMeterUsed" class="inline-note">(also, using kismets with the RNG meter will slightly degrade the accuracy)</span>
                </li>
                <li>You have 10 Boss Luck and a Treasure Artifact <span class="inline-note">(note that this does not affect all items)</span></li>
            </ul>
        </Panel>
        <Panel color="yellow" v-if="numCorrectnessWarning">
            The drop chances on the wiki disagree with the RNG meter. Because this item can be obtained from
            multiple chests, some of the probabilities come from the wiki and not the RNG meter menu.
            Therefore, the result may be <span class="underline">inaccurate</span>.
        </Panel>
    </Results>
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
const kismetFeathersUsed = ref(false);
const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);

function itemColorClass(item: string | null) {
    if (!floor.value || !item || data[floor.value][item] == undefined) return { "t-gray": true };
    return { [`t-${data[floor.value][item].color}`]: true }
}

const numCorrectnessWarning = computed(() => {
    return floor.value && item.value && data[floor.value][item.value] && data[floor.value][item.value].otherChests > 0
});

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

        const kismetsUsed = kismetFeathersUsed.value;

        if (rngMeterUsed.value) {
            console.time("dungeon probability array");
            const baseChance = itemData.mainChest;
            const extraChance = itemData.otherChests;
            const fillScore = itemData.fillScore;

            const result = [];
            let currentScore = 0;

            for (let i = 0; i < attempts.value; i++) {
                const prob = baseChance * (1 + 2 * currentScore / fillScore) + extraChance;
                result.push(prob);
                if (kismetsUsed) {
                    // This is not perfect, but it's the best way I found to simulate kismets
                    // (it skews the result towards the mean, but for rare drops it should be so little
                    // that it basically doesn't matter)
                    result.push(prob * (1 - prob));
                }

                currentScore += SCORE_PER_RUN;
                if (currentScore >= fillScore) {
                    console.log("rolling over");
                    currentScore = 0;
                }
            }
            console.timeEnd("dungeon probability array");
            return result;
        } else {
            const kismetBonus = kismetsUsed ? (attempts.value - successes.value) : 0;
            return new Array(attempts.value + kismetBonus).fill(itemData.mainChest + itemData.otherChests);
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
