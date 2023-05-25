<template>
    <label class="row">
        <span>Kismet Feathers used?</span>
        <input type="checkbox" v-model="modelValue.kismetFeathersUsed"/>
    </label>
    <div class="inline-note" v-if="!rngMeterApplicable">The RNG meter does not apply for this option</div>
    <label class="row" v-show="rngMeterApplicable">
        <span>RNG meter used?</span>
        <input type="checkbox" v-model="modelValue.rngMeterUsed"/>
    </label>
    <label class="row indent" v-show="rngMeterApplicable && modelValue.rngMeterUsed && advancedMode">
        <span>Runs before RNG meter update</span>
        <input type="number" v-model="modelValue.attemptsBeforeRNGMeter" min="0" :max="modelValue.attempts ?? 0"/>
    </label>
    <label class="row">
        <span>Total runs</span>
        <input type="number" v-model="modelValue.attempts" :min="Math.max(modelValue.attemptsBeforeRNGMeter, 1)"/>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DungeonsItemData } from "../DungeonsItemData";

const props = defineProps<{
    // this will be mutated by this component;
    // since this object is shared with the parent, the data
    // will update up there too
    // however, this is passed in with v-model, so the object updating
    // is what is expected
    modelValue: {
        kismetFeathersUsed: boolean,
        rngMeterUsed: boolean,
        attemptsBeforeRNGMeter: number,
        attempts: number | null,
    },
    itemData?: DungeonsItemData,
    advancedMode: boolean
}>();

// Not actually used due to object being updated directly
const emit = defineEmits<{
    (event: "update:itemData", itemData: typeof props.modelValue): void
}>();

const rngMeterApplicable = computed(() => {
    return props.itemData && props.itemData.fillScore != null;
});

</script>