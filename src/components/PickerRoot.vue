<template>
    <Panel>
        <label class="row">
            <span>Mode</span>
            <SelectWrapper>
                <select v-model="selected">
                    <option :value="null" disabled>Select an option...</option>
                    <option value="dungeons">Dungeons</option>
                    <option value="experiments">Experiments</option>
                    <option value="slayer">Slayer</option>
                    <option value="custom">Custom</option>
                </select>
            </SelectWrapper>
        </label>
    </Panel>

    <PickerExperiments v-if="selected == 'experiments'"/>
    <PickerCustom v-if="selected == 'custom'"/>
    <PickerDungeons v-if="selected == 'dungeons'"/>
    <PickerSlayerBoss v-if="selected == 'slayer'"/>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PickerExperiments from "./PickerExperiments.vue";
import PickerCustom from "./PickerCustom.vue";
import PickerDungeons from "./PickerDungeons.vue";
import PickerSlayerBoss from "./PickerSlayerBoss.vue";
import Panel from "./Panel.vue";
import SelectWrapper from "./SelectWrapper.vue";

const selected = ref<string | null>(null);
</script>