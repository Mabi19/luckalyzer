<template>
    <div class="select-wrapper">
        <select v-bind="$attrs" :value="modelValue" @change="$emit('update:modelValue', ($event.target as any).value)" :class="[selectedClass]">
            <option value="" disabled>Select an option...</option>
            <template v-for="option in options">
                <optgroup v-if="'name' in option" :label="option.name">
                    <option v-for="suboption in option.options" :value="suboption.id" :class="colorClass(suboption.color)">
                        {{ suboption.label }}
                    </option>
                </optgroup>
                <option v-else :value="option.id" :class="colorClass(option.color)">
                    {{ option.label }}
                </option>
            </template>
        </select>
    </div>
</template>

<script lang="ts">
export default {
    inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

type BaseOption = {
    id: string,
    label: string,
    color?: string,
};

type OptionGroup = {
    name: string,
    options: BaseOption[],
}

type Option = BaseOption | OptionGroup;

function colorClass(color?: string) {
    const className = "t-" + (color ?? props.defaultColor);
    return { [className]: true };
}

const props = withDefaults(defineProps<{
    options: Option[],
    modelValue: string | null
    defaultColor?: string,
}>(), {
    defaultColor: "white"
});

defineEmits<{
    (ev: "update:modelValue", newValue: string): void
}>();

const idColors = computed(() => {
    const mapping: Record<string, string> = {}
    function extract(arr: Option[]) {
        for (const opt of arr) {
            if ("name" in opt) {
                extract(opt.options);
            } else {
                mapping[opt.id] = opt.color ?? props.defaultColor;
            }
        }
    }
    extract(props.options);
    return mapping;
});

const selectedClass = computed(() => {
    return props.modelValue ? ("t-" + idColors.value[props.modelValue]) : "t-white";
})
</script>
