<template>
    <Panel v-if="slayerType">
        <label class="row">
            <span>Item</span>
            <AppSelect v-model="item" class="extra-wide" :options="itemSelectorOptions"/>
        </label>
        <label class="row">
            <span>Aatrox's Pathfinder? <span class="inline-note">(+20% drop chance)</span></span>
            <input type="checkbox" v-model="aatroxPathfinder"/>
        </label>
        <label class="row">
            <span>RNG meter used?</span>
            <input type="checkbox" v-model="rngMeterUsed"/>
        </label>
        <label class="row indent" v-if="rngMeterUsed">
            <span>Aatrox's Slayer XP Buff?</span>
            <input type="checkbox" v-model="aatroxXPBuff"/>
        </label>
        <label class="row">
            <span>Magic Find</span>
            <input type="number" min="0" max="900" v-model="magicFind"/>
        </label>
        <label class="row">
            <span>Bosses slain</span>
            <input type="number" v-model="attempts" min="1"/>
        </label>
        <Panel color="blue" v-if="minLevel">
            Make sure to exclude bosses slain before level {{ minLevel }}!
        </Panel>
        <label class="row">
            <span>Selected item drops</span>
            <span class="inline-note" v-if="rngMeterUsed">(including guaranteed drops from completing the RNG meter)</span>
            <input type="number" v-model="successes" min="1" :max="attempts ?? undefined"/>
        </label>
    </Panel>

    <Results v-if="isValid">
        <Panel color="blue">
            The real world is complicated, so this mode makes a few assumptions:
            <ul>
                <li>All bosses are T{{ slayerType == "zombie" ? "5" : "4" }}</li>
                <li v-if="rngMeterUsed">The RNG meter was revamped before you started killing the boss</li>
                <li>All bosses are killed with the same Aatrox perks active</li>
            </ul>
        </Panel>
    </Results>
</template>

<script setup lang="ts">
import Panel from "./Panel.vue";
import Results from "./Results.vue";
import AppSelect from "./AppSelect.vue";
import untypedData from "../assets/data/slayer.json";
import { ref, computed, watchEffect, watch } from "vue";
import { poibinUpdate, slayerUpdate } from "../calc";

type ProbabilitySpecifier = { num: number, den: number };
const data = untypedData as Record<string, Record<string, { name: string, probability: ProbabilitySpecifier, rngMeterBosses: number, color: string, level?: number }>>;

const item = ref<string | null>(null);
const aatroxPathfinder = ref(false);
const rngMeterUsed = ref(false);
const aatroxXPBuff = ref(false);
const magicFind = ref<number | null>(null);
const attempts = ref<number | null>(null);
const successes = ref<number | null>(null);

const itemSelectorOptions = computed(() => {
    const items = data[props.slayerType];
    return Object.entries(items).map(([id, value]) => ({
        id,
        label: value.name,
        color: value.color,
    }));
});

const props = defineProps<{
    slayerType: string
}>();

const minLevel = computed(() => {
    if (!item.value) return null;
    return data[props.slayerType][item.value]?.level ?? null;
});

// reset everything when the slayer boss changes
watch(() => props.slayerType, () => {
    item.value = null;
    aatroxPathfinder.value = false;
    rngMeterUsed.value = false;
    aatroxXPBuff.value = false;
    magicFind.value = null;
    attempts.value = null;
    successes.value = null;
});

// check for validity
const isValid = computed(() => {
    return item.value && magicFind.value && attempts.value && successes.value &&
    (magicFind.value >= 0 && magicFind.value <= 900) &&
    (successes.value <= attempts.value);
});

// recompute when necessary
watchEffect(() => {
    if (!isValid.value) return;

    const itemData = data[props.slayerType][item.value!];
    if (!itemData) return;

    if (rngMeterUsed.value) {
        slayerUpdate({
            probability: itemData.probability,
            rngMeterBosses: itemData.rngMeterBosses,
            magicFind: magicFind.value!,
            aatroxPathfinder: aatroxPathfinder.value,
            aatroxXPBuff: aatroxXPBuff.value,
            attempts: attempts.value!,
            successes: successes.value!,
        });
    } else {
        const pathfinderBonus = aatroxPathfinder.value ? 1.2 : 1;
        const magicFindBonus = (magicFind.value! + 100) / 100;
        const baseChance = itemData.probability.num / itemData.probability.den;
        const probabilityArray: number[] = new Array(attempts.value!).fill(baseChance * pathfinderBonus * magicFindBonus);
        poibinUpdate(probabilityArray, successes.value!);
    }
});
</script>