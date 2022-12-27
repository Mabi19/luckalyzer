<template>
    <Panel>
        <label class="row">
            <span>Boss</span>
            <SelectWrapper>
                <select v-model="slayerType" class="extra-wide">
                    <option :value="null" disabled>Select an option...</option>
                    <option value="zombie">Atoned Horror (T5)</option>
                    <option value="spider">Tarantula Broodfather (T4)</option>
                    <option value="wolf">Sven Packmaster (T4)</option>
                    <option value="enderman">Voidgloom Seraph (T4)</option>
                    <option value="blaze">Inferno Demonlord (T4)</option>
                </select>
            </SelectWrapper>
        </label>
    </Panel>

    <PickerSlayerItem v-if="slayerType" :slayerType="slayerType"/>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Background, currentBackground } from "../Background";
import Panel from "./Panel.vue";
import SelectWrapper from "./SelectWrapper.vue";
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
