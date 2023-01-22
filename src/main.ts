import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { preload } from "./preload-images";
import { registerAwesomeKeyHandler } from "./awesome-easter-egg";

preload();
registerAwesomeKeyHandler("awesome");
createApp(App).mount("#app");
