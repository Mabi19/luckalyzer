<template>
    <Panel color="yellow">
        I have not updated this app in a really long time. It will most likely produce inaccurate results (especially with the advent of the foraging update).
    </Panel>

    <Panel>
        <label class="row">
            <span>Mode</span>
            <AppSelect v-model="selected" :options="[
                { id: 'dragons', label: 'Dragons' },
                { id: 'dungeons', label: 'Dungeons' },
                { id: 'experiments', label: 'Experiments' },
                { id: 'mythological', label: 'Mythological Ritual' },
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
    <PickerMythological v-if="selected == 'mythological'"/>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppSelect from "./AppSelect.vue";
import Panel from "./Panel.vue";
import PickerCustom from "./PickerCustom.vue";
import PickerDragons from "./PickerDragons.vue";
import PickerDungeons from "./PickerDungeons.vue";
import PickerExperiments from "./PickerExperiments.vue";
import PickerMythological from "./PickerMythological.vue";
import PickerSlayerBoss from "./PickerSlayerBoss.vue";

const selected = ref<string | null>(null);
</script>
