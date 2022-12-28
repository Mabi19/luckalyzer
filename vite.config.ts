import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as fs from "fs";
import child_process from "child_process";

// get the version from package.json
const packageJSON = fs.readFileSync("./package.json", { encoding: "utf8" });
const version: string = JSON.parse(packageJSON).version;

const commitID = child_process.execSync("git log --format=\"%H\" -n 1").toString("utf8").slice(0, 7);

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
        __APP_VERSION__: JSON.stringify(version),
        __BUILD_ID__: JSON.stringify(commitID),
    },
});
