<template>
    <Panel>
        <span class="flex-row">
            <label class="row">
                <span>Advanced Mode</span>
                <input type="checkbox" v-model="advancedMode"/>
            </label>
            <HelpIndicator @update="val => showAdvancedModeHelp = val"/>
        </span>

        <Panel color="blue" v-if="showAdvancedModeHelp">
            Advanced mode allows you to select multiple floors.
            This is helpful if you have done some runs of a floor and its Master Mode variant
            and want to analyse them collectively.
        </Panel>
    </Panel>

    <Panel v-show="advancedMode">
        <div class="flex-row">
            <span>Floor(s)</span>
            <AppMultiSelect v-model="advancedFloors" :options="[
                {
                    name: 'Normal Mode',
                    options: [
                        { empty: 1 },
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
        </div>
    </Panel>

    <Panel v-show="!advancedMode">
        <label class="row">
            <span>Floor</span>
            <AppSelect v-model="basicFloor" :options="[
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

    <Panel v-if="floors.length">
        <label class="row" v-if="itemSelectorOptions.length">
            <span>Item</span>
            <AppSelect v-model="item" class="extra-wide" :options="itemSelectorOptions" />
        </label>
        <div v-else>
            The selected floors do not share items.
        </div>
    </Panel>

    <Panel v-if="floors.length" v-for="floor in floors" :key="floor">
        <div class="heading t-gold" v-if="advancedMode">{{ floor.toUpperCase() }}</div>
        <DungeonsDataSelector v-model="selectorStates[floor]" :item-data="item ? data[floor][item] : undefined"/>
    </Panel>

    <Panel v-if="floors.length">
        <label class="row">
            <span>Selected item drop count <span v-if="Object.values(selectorStates).some((el) => el.rngMeterUsed)" class="inline-note">(NOT including guaranteed drops from completing the RNG meter)</span></span>
            <input type="number" v-model="successes" min="0" :max="attemptsSum"/>
        </label>
    </Panel>

    <Results v-if="probabilityArray && successes != null">
        <Panel color="blue">
            <span>The real world is complicated, so this mode makes a few assumptions:</span>
            <ul>
                <li>All runs are S+ with an average 303 score</li>
                <li v-if="Object.values(selectorStates).some((el) => el.kismetFeathersUsed)">You use a simple kismet strategy: always reroll unless you got your chosen drop</li>
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
import AppMultiSelect from "./AppMultiSelect.vue";
import DungeonsDataSelector from "./DungeonsDataSelector.vue";
import HelpIndicator from "./HelpIndicator.vue";
import untypedData from "../assets/data/dungeons.json";
import { DungeonsItemData } from "../DungeonsItemData";

const SCORE_PER_RUN = 303;

const data = untypedData as Record<string, Record<string, DungeonsItemData>>;

const advancedMode = ref(false);
const showAdvancedModeHelp = ref(false);

const advancedFloors = ref<string[]>([]);
const basicFloor = ref<string | null>(null);
const item = ref<string | null>(null);
const successes = ref<number | null>(null);

function makeSelectorState() {
    return {
        kismetFeathersUsed: false,
        rngMeterUsed: false,
        attemptsBeforeRNGMeter: 0,
        attempts: null as number | null,
    }
}

const selectorStates: Record<string, ReturnType<typeof makeSelectorState>> = reactive({});
for (const floor of Object.keys(data)) {
    selectorStates[floor] = makeSelectorState();
}

const attemptsSum = computed(() => Object.values(selectorStates).reduce((curr, next) => curr + (next.attempts ?? 0), 0));

const floors = computed(() => {
    if (advancedMode.value) {
        return advancedFloors.value;
    } else {
        return basicFloor.value != null ? [basicFloor.value!] : [];
    }
})

const itemSelectorOptions = computed(() => {
    if (!floors.value.length) return [];

    let allowedKeys = Object.keys(data[floors.value[0]]);
    for (const floor of floors.value) {
        allowedKeys = allowedKeys.filter((el) => Object.keys(data[floor]).includes(el));
    }

    const items = data[floors.value[0]];
    return Object.entries(items).filter(([id]) => allowedKeys.includes(id)).map(([id, value]) => ({
        id,
        label: value.name,
        color: value.color,
    }));
});

const numCorrectnessWarning = computed(() => {
    return floors.value && item.value && data[floors.value[0]][item.value] &&
        floors.value.every((floor) => data[floor][item.value!].otherChests > 0)
});

// set the background
watchEffect(() => {
    if (floors.value.length == 0) currentBackground.value = "dungeons-generic";

    switch (floors.value[floors.value.length - 1]) {
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
    const results: number[][] = [];
    for (const floor of floors.value) {
        const selectorState = selectorStates[floor];
        if (!floor || !item.value || !selectorState.attempts || successes.value == null ||
            successes.value > selectorState.attempts || selectorState.attemptsBeforeRNGMeter > selectorState.attempts) {
            return null;
        } else {
            const itemData = data[floor][item.value];
            if (!itemData) return null;

            const kismetsUsed = selectorState.kismetFeathersUsed;

            if (itemData.fillScore && selectorState.rngMeterUsed) {
                console.time("dungeon probability array");
                const baseChance = itemData.mainChest;
                const extraChance = itemData.otherChests;
                const fillScore = itemData.fillScore;

                let result: number[] = new Array(selectorState.attemptsBeforeRNGMeter).fill(baseChance + extraChance);
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
                results.push(result);
            } else {
                // this is also not perfect, but again it's close enough
                const kismetBonus = kismetsUsed ? (selectorState.attempts - Math.floor(successes.value / 2)) : 0;
                results.push(new Array(selectorState.attempts).fill(itemData.mainChest + itemData.otherChests)
                    .concat(new Array(kismetBonus).fill(itemData.mainChest)));
            }
        }
    }
    return Array.prototype.concat(...results);
});

// keep data in sync
watch(floors, () => {
    item.value = null;
    successes.value = null;
    for (const key of Object.keys(selectorStates)) {
        if (!floors.value.includes(key)) {
            // delete the state if it's deselected
            // (this is a bit inefficient but who cares)
            selectorStates[key] = makeSelectorState();
        }
    }
});

watchEffect(() => {
    if (Object.values(selectorStates).every((el) => el.attempts) && successes.value != null) {
        if (successes.value > attemptsSum.value) {
            successes.value = attemptsSum.value;
        }
    }
});

// recompute when the probabilities change
watchEffect(() => {
    if (probabilityArray.value && successes.value != null &&
        successes.value <= attemptsSum.value) {
        poibinUpdate(probabilityArray.value, successes.value);
    }
});
</script>

<style scoped>
.heading {
    font-weight: bold;
}
</style>
