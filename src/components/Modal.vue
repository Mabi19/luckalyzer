<template>
    <Teleport to="body">
        <div class="darkenator" v-if="show" @click="closeModal">
            <div class="modal t-white" @click.stop>
                <div class="modal-title">
                    <span>{{ title }}</span><button title="Close" class="modal-close" @click="closeModal"><img src="../assets/close.png"/></button>
                </div>
                <div class="modal-content">
                    <slot/>
                </div>
                <div class="modal-footer">
                    <slot name="footer"/>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    title: string,
    show: boolean
}>();

const $emit = defineEmits<{
    (event: "close"): void
}>();

function closeModal() {
    $emit("close");
}

function keyEventHandler(ev: KeyboardEvent) {
    if (props.show && ev.key == "Escape") {
        closeModal();
    }
}

onMounted(() => {
    window.addEventListener("keyup", keyEventHandler);
});

onUnmounted(() => {
    window.removeEventListener("keyup", keyEventHandler);
})
</script>

<style scoped>
.darkenator {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);

    display: grid;
    place-items: center;
}

.modal {
    border-image-source: url("../assets/modal-border-image.png");
    border-image-slice: calc(100% / 3) fill;
    border-image-width: 8px;
    image-rendering: pixelated;
    padding: 12px;

    max-width: 600px;
}

.modal-title {
    margin-bottom: 8px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    font-weight: bold;
    color: var(--gold);
}

.modal-content {
    background-color: #404040;
}

.modal-footer {
    color: var(--gray);
}

.modal-close {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
    display: block;
}

.modal-close img {
    display: block;
    height: 15px;
}
</style>