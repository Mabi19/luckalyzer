<template>
    <div class="wrapper" role="listbox">
        <div v-for="group in options" class="column" :style="{ '--rows': generateRowDefinition(group.options) }">
            <div class="heading">{{ group.name }}</div>
            <template v-for="option in group.options">
                <div v-if="'id' in option" class="option-wrapper">
                    <input type="checkbox" class="checkbox" :id="makeID(option)" :value="option.id" v-model="selected"/>
                    <label class="option" :for="makeID(option)">
                        {{ option.label }}
                    </label>
                </div>
                <div v-else class="padding"></div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PaddedOptionGroup, BaseOption } from "../SelectBox";

const props = defineProps<{
    options: (PaddedOptionGroup)[],
    modelValue: string[],
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', vals: string[]): void
}>();

const selected = computed({
    get() {
        return props.modelValue;
    },
    set(newValue) {
        newValue.sort();
        emit("update:modelValue", newValue);
    }
});

watch(selected, () => {
    console.log("selected change!", selected.value);
});

function generateRowDefinition(options: (BaseOption | { empty: number })[]) {
    return "1fr " + options.map((el) => {
        return ('empty' in el ? el.empty : 1) + "fr";
    }).join(" ");
}

const randomIDPart = Math.floor(Math.random() * 16777216).toString(16).padStart(4, "0");
function makeID(option: BaseOption) {
    return `${randomIDPart}-${option.id}`;
}

function test(msg: string) {
    console.log(msg);
}
</script>

<style scoped>
.wrapper {
    display: inline-flex;
    width: fit-content;
    flex-flow: row wrap;
    gap: 12px;

    background-color: var(--input-background);
    border: 2px solid var(--input-border);
    padding: 0 4px;
}

.column {
    display: grid;
    grid-template-rows: var(--rows);
    height: fit-content;
}

/* .option {
    text-align: center;
    margin: 0;
    display: block;
    width: 100%;
}

.checkbox:checked + .option {
    background-color: #afafaf;
}

.checkbox {
    appearance: none;
    margin: 0;
    position: absolute;
    left: -99999px;
} */

.checkbox {
    background-color: #4f4f4f !important;
}

.option-wrapper {
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
    justify-content: center;
    align-items: center;
}

.heading {
    font-weight: bold;
}
</style>