import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as fs from "fs";

// get the version from package.json
const packageJSON = fs.readFileSync("./package.json", { encoding: "utf-8" });
const version: string = JSON.parse(packageJSON).version;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],
    worker: {
        format: "iife", // this is needed for Firefox
    },
    base: "/luckalyzer/",
    define: {
        __APP_VERSION__: JSON.stringify(version)
    }
});
