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
    <label class="row" v-show="rngMeterApplicable && modelValue.rngMeterUsed">
        <span>Runs before RNG meter update</span>
        <input type="number" v-model="modelValue.attemptsBeforeRNGMeter" min="0"/>
    </label>
    <label class="row">
        <span>Total runs</span>
        <input type="number" v-model="modelValue.attempts" :min="Math.max(modelValue.attemptsBeforeRNGMeter, 1)"/>
    </label>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { DungeonsItemData } from "../DungeonsItemData";

const props = defineProps<{
    modelValue: {
        kismetFeathersUsed: boolean,
        rngMeterUsed: boolean,
        attemptsBeforeRNGMeter: number,
        attempts: number | null,
    },
    itemData?: DungeonsItemData
}>();

const emit = defineEmits<{
    (event: "update:itemData", itemData: typeof props.modelValue): void
}>();

const rngMeterApplicable = computed(() => {
    return props.itemData && props.itemData.fillScore != null;
});

</script>