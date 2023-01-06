<template>
    <Panel>
        <label class="row">
            <span>Mode</span>
            <AppSelect v-model="selected" :options="[
                { id: 'dragons', label: 'Dragons' },
                { id: 'dungeons', label: 'Dungeons' },
                { id: 'experiments', label: 'Experiments' },
                { id: 'slayer', label: 'Slayer' },
                { id: 'custom', label: 'Custom' },
            ]"/>
        </label>
    </Panel>

    <PickerExperiments v-if="selected == 'experiments'"/>
    <PickerCustom v-if="selected == 'custom'"/>
    <PickerDungeons v-if="selected == 'dungeons'"/>
    <PickerSlayerBoss v-if="selected == 'slayer'"/>
    <PickerDragons v-if="selected == 'dragons'"/>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PickerExperiments from "./PickerExperiments.vue";
import PickerCustom from "./PickerCustom.vue";
import PickerDungeons from "./PickerDungeons.vue";
import PickerSlayerBoss from "./PickerSlayerBoss.vue";
import PickerDragons from "./PickerDragons.vue";
import Panel from "./Panel.vue";
import AppSelect from "./AppSelect.vue";

const selected = ref<string | null>(null);
</script>
