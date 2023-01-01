<template>
    <Panel>
        <label class="row">
            <span>Boss</span>
            <AppSelect v-model="slayerType" class="extra-wide" :options="[
                { id: 'zombie', label: 'Atoned Horror (T5)' },
                { id: 'spider', label: 'Tarantula Broodfather (T4)' },
                { id: 'wolf', label: 'Sven Packmaster (T4)' },
                { id: 'enderman', label: 'Voidgloom Seraph (T4)' },
                { id: 'blaze', label: 'Inferno Demonlord (T4)' },
            ]"/>
        </label>
    </Panel>

    <PickerSlayerItem v-if="slayerType" :slayerType="slayerType"/>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Background, currentBackground } from "../Background";
import Panel from "./Panel.vue";
import AppSelect from "./AppSelect.vue";
import PickerSlayerItem from "./PickerSlayerItem.vue";

const slayerType = ref<string | null>(null);

// set the background
watchEffect(() => {
    if (slayerType.value == null) {
        currentBackground.value = "generic-slayer";
    } else {
        currentBackground.value = `${slayerType.value}-slayer` as Background;
    }
});
</script>
