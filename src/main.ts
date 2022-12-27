import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { preload } from "./preload-images";

preload();
createApp(App).mount("#app");
