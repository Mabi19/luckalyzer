<template>
    <Panel>
        <label class="row">
            <span>Floor</span>
            <AppSelect v-model="floor" :options="[
                {
                    name: 'Normal Mode',
                    options: [
                        { id: 'f5', label: 'F5' },
                        { id: 'f6', label: 'F6' },
                        { id: 'f7', label: 'F7' },
                    ]
                },
                {
                    name: 'Master Mode',
                    options: [
                        { id: 'm4', label: 'M4' },
                        { id: 'm5', label: 'M5' },
                        { id: 'm6', label: 'M6' },
                        { id: 'm7', label: 'M7' },
                    ]
                },
            ]"/>
        </label>
    </Panel>

    <Panel v-if="floor">
        <label class="row">
            <span>Item</span>
            <AppSelect v-model="item" class="extra-wide" :options="itemSelectorOptions" />
        </label>
        <DungeonsDataSelector v-model="selectorState" :item-data="item ? data[floor][item] : undefined"/>
        <label class="row">
            <span>Selected item drop count <span v-if="selectorState.rngMeterUsed" class="inline-note">(NOT including guaranteed drops from completing the RNG meter)</span></span>
            <input type="number" v-model="successes" min="0" :max="selectorState.attempts ?? undefined"/>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes != null">
        <Panel color="blue">
            <span>The real world is complicated, so this mode makes a few assumptions:</span>
            <ul>
                <li>All runs are S+ with an average 303 score</li>
                <li v-if="selectorState.rngMeterUsed">The RNG meter has existed since before you started running the floor</li>
                <li v-if="selectorState.kismetFeathersUsed">You use a simple kismet strategy: always reroll unless you got your chosen drop</li>
                <li>You have 5 Boss Luck and a Treasure Artifact <span class="inline-note">(note that this does not affect all items)</span></li>
            </ul>
        </Panel>
        <Panel color="yellow" v-if="numCorrectnessWarning">
            The drop chances on the wiki disagree with the RNG meter. Because this item can be obtained from
            multiple chests, some of the probabilities come from the wiki and not the RNG meter menu.
            Therefore, the result <span class="underline">may be inaccurate</span>.
        </Panel>
    </Results>
</template>

<script setup lang="ts">
import { ref, watchEffect, watch, computed, reactive } from "vue";
import { poibinUpdate } from "../calc";
import { currentBackground } from "../Background";
import Panel from "./Panel.vue";
import Results from "./Results.vue";
import AppSelect from "./AppSelect.vue";
import DungeonsDataSelector from "./DungeonsDataSelector.vue";
import untypedData from "../assets/data/dungeons.json";
import { DungeonsItemData } from "../DungeonsItemData";

const SCORE_PER_RUN = 303;

const data = untypedData as Record<string, Record<string, DungeonsItemData>>;

const floor = ref<string | null>(null);
const item = ref<string | null>(null);
const successes = ref<number | null>(null);
const selectorState = reactive({
    kismetFeathersUsed: false,
    rngMeterUsed: false,
    attemptsBeforeRNGMeter: 0,
    attempts: null as number | null,
});

const itemSelectorOptions = computed(() => {
    if (!floor.value) return [];
    const items = data[floor.value];
    return Object.entries(items).map(([id, value]) => ({
        id,
        label: value.name,
        color: value.color,
    }));
});

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
    if (!floor.value || !item.value || !selectorState.attempts || successes.value == null || successes.value > selectorState.attempts) {
        return null;
    } else {
        const itemData = data[floor.value][item.value];
        if (!itemData) return null;

        const kismetsUsed = selectorState.kismetFeathersUsed;

        if (itemData.fillScore && selectorState.rngMeterUsed) {
            console.time("dungeon probability array");
            const baseChance = itemData.mainChest;
            const extraChance = itemData.otherChests;
            const fillScore = itemData.fillScore;

            let result = new Array(selectorState.attemptsBeforeRNGMeter).fill(baseChance + extraChance);
            if (kismetsUsed) {
                result = [...result, ...(new Array(selectorState.attemptsBeforeRNGMeter).fill(baseChance * (1 - baseChance)))];
            }

            let currentScore = 15 * selectorState.attemptsBeforeRNGMeter;
            const attemptsAfterUpdate = selectorState.attempts - selectorState.attemptsBeforeRNGMeter;

            for (let i = 0; i < attemptsAfterUpdate; i++) {
                // This assumes that the RNG meter is increased before chests are rolled
                // There is no way to know if this is the case, but it simplifies this function
                // so I'm assuming it is
                currentScore += SCORE_PER_RUN;
                if (currentScore >= fillScore) {
                    currentScore -= fillScore;
                    continue;
                }

                const mainProb = baseChance * (1 + 2 * currentScore / fillScore);
                const prob = mainProb + extraChance;
                result.push(prob);
                if (kismetsUsed) {
                    // This is not perfect, but it's the best way I found to simulate kismets
                    // (it skews the result towards the mean, but for rare drops it should be so little
                    // that it basically doesn't matter)
                    // don't include the extra chance since only the main chest is kismeted for
                    result.push(mainProb * (1 - mainProb));
                }
            }
            console.timeEnd("dungeon probability array");
            return result;
        } else {
            // this is also not perfect, but again it's close enough
            const kismetBonus = kismetsUsed ? (selectorState.attempts - Math.floor(successes.value / 2)) : 0;
            return new Array(selectorState.attempts).fill(itemData.mainChest + itemData.otherChests)
                .concat(new Array(kismetBonus).fill(itemData.mainChest));
        }
    }
});

// keep data in sync
watch(floor, () => {
    item.value = null;
    selectorState.kismetFeathersUsed = false;
    selectorState.rngMeterUsed = false;
    selectorState.attemptsBeforeRNGMeter = 0;
    selectorState.attempts = null;
    successes.value = null;
});

watchEffect(() => {
    if (selectorState.attempts && successes.value != null) {
        if (successes.value > selectorState.attempts) {
            successes.value = selectorState.attempts;
        }
    }
});

// recompute when the probabilities change
watchEffect(() => {
    if (probabilityArray.value && successes.value != null &&
        successes.value <= selectorState.attempts! && selectorState.attempts! >= selectorState.attemptsBeforeRNGMeter) {
        poibinUpdate(probabilityArray.value, successes.value);
    }
});
</script>
