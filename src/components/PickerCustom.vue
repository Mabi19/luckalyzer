<template>
    <Panel>
        <div class="heading t-gold">Probabilities</div>
        <div ref="probabilitiesContainer">
            <label v-for="input in inputs" class="row full-width">
                <input type="text" inputmode="decimal" pattern="^(0|0\.[0-9]+|1)$" v-model="input.probability">
                <span>&#215;</span>
                <input type="number" v-model="input.count" min="1" placeholder="Count"/>
                <button class="delete" @click="deleteProbability(input.id)"><img src="../assets/delete.png" alt="Delete"/></button>
            </label>
        </div>
        <!-- placeholder inputs: click on them to add new ones -->
        <label class="row full-width">
            <input type="text" placeholder="Probability" @focusin="addProbability(0)"/>
            <span>&#215;</span>
            <input type="text" placeholder="Count" @focusin="addProbability(2)"/>
            <!-- this is a hack, but I also do not care -->
            <div class="delete hidden"><img src="../assets/delete.png"/></div>
        </label>

        <hr/>

        <label class="row">
            <span>Successes</span>
            <input type="number" v-model="successes" min="0"/>
        </label>
    </Panel>
    <Panel v-if="isValid">
        <div class="calculating gray shadow" v-if="isWorking && isBigWork">Calculating...</div>
        <div><span class="t-aqua">P</span>(<span class="t-yellow">X</span> &lt; <span class="t-yellow">x</span>): {{ values.cdf - values.pmf }}</div>
        <div><span class="t-aqua">P</span>(<span class="t-yellow">X</span> &leq; <span class="t-yellow">x</span>): {{ values.cdf }}</div>
        <div><span class="t-aqua">P</span>(<span class="t-yellow">X</span> &equals; <span class="t-yellow">x</span>): {{ values.pmf }}</div>
        <div><span class="t-aqua">P</span>(<span class="t-yellow">X</span> &geq; <span class="t-yellow">x</span>): {{ 1 - values.cdf + values.pmf }}</div>
        <div><span class="t-aqua">P</span>(<span class="t-yellow">X</span> &gt; <span class="t-yellow">x</span>): {{ 1 - values.cdf }}</div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from "./Panel.vue";
import { ref, nextTick, computed, watchEffect } from "vue";
import { poibinUpdate, isWorking, values, isBigWork } from "../calc";
import { Background, currentBackground } from "../Background";

// set the background
currentBackground.value = "generic";

const inputs = ref<{ probability: string, count: number, id: number }[]>([]);
const successes = ref(0);
const probabilitiesContainer = ref<HTMLDivElement | null>(null);

const isValid = computed(() => {
    return typeof successes.value == "number" &&
    successes.value >= 0 &&
    Number.isInteger(successes.value) &&
    inputs.value.length &&
    inputs.value.every((el) =>
        el.probability.match(/^(0|0\.[0-9]+|1)$/) &&
        typeof el.count == "number" &&
        el.count > 0 &&
        Number.isInteger(el.count)
    );
});

const probabilities = computed(() => {
    if (!isValid.value) return null;

    return Array.prototype.concat(
        ...inputs.value.map((inputPair) => new Array<number>(inputPair.count).fill(parseFloat(inputPair.probability)))
    ) as number[];
});

// trigger updates
watchEffect(() => {
    if (probabilities.value && probabilities.value.length && typeof successes.value == "number") {
        poibinUpdate(probabilities.value, successes.value);
    }
});

// constrain successes
const successesMax = computed(() =>
    inputs.value.map((inputPair) => Number.isInteger(inputPair.count) ? inputPair.count : 0)
        .reduce((acc, count) => acc + count)
);

let nextID = 0;

function addProbability(focusIndex: number) {
    inputs.value.push({ probability: "0.5", count: 1, id: nextID });
    nextID++;
    nextTick(() => {
        (probabilitiesContainer.value?.lastElementChild?.childNodes[focusIndex] as HTMLInputElement).focus();
    });
}

function deleteProbability(id: number) {
    // this is not optimal (we know there's always only one) but whatever
    inputs.value = inputs.value.filter((el) => el.id != id);
}
</script>

<style scoped>
.full-width {
    width: 100%;
    display: flex;
    align-items: center;
}

.full-width input {
    flex-grow: 1;
}

.delete {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

.delete.hidden {
    visibility: hidden;
}

.delete img {
    width: 24px;
    image-rendering: pixelated;
    display: block;
}

.heading {
    font-weight: bold;
}
</style>