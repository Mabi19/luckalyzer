import { ref } from "vue";
import GenericBg from "./assets/backgrounds/generic-b.webp";
import DragonsBg from "./assets/backgrounds/dragons.webp";
import DungeonsGenericBg from "./assets/backgrounds/dungeons-generic.webp";
import DungeonsF1Bg from "./assets/backgrounds/dungeons-f1.webp";
import DungeonsF2Bg from "./assets/backgrounds/dungeons-f2.webp";
import DungeonsF3Bg from "./assets/backgrounds/dungeons-f3.webp";
import DungeonsF4Bg from "./assets/backgrounds/dungeons-f4.webp";
import DungeonsF5Bg from "./assets/backgrounds/dungeons-f5.webp";
import DungeonsF6Bg from "./assets/backgrounds/dungeons-f6.webp";
import DungeonsF7Bg from "./assets/backgrounds/dungeons-f7.webp";
import DungeonsM7Bg from "./assets/backgrounds/dungeons-m7.webp";
import ExperimentsBg from "./assets/backgrounds/experiments.webp";
import GenericSlayerBg from "./assets/backgrounds/generic-slayer.webp";
import ZombieSlayerBg from "./assets/backgrounds/zombie-slayer.webp";
import SpiderSlayerBg from "./assets/backgrounds/spider-slayer.webp";
import WolfSlayerBg from "./assets/backgrounds/wolf-slayer.webp";
import EndermanSlayerBg from "./assets/backgrounds/enderman-slayer.webp";
import BlazeSlayerBg from "./assets/backgrounds/blaze-slayer.webp";

export type Background =
    "generic" |
    "dragons" |
    "experiments" |
    "dungeons-generic" |
    "dungeons-f1" |
    "dungeons-f2" |
    "dungeons-f3" |
    "dungeons-f4" |
    "dungeons-f5" |
    "dungeons-f6" |
    "dungeons-f7" |
    "dungeons-m7" |
    "generic-slayer" |
    "zombie-slayer" |
    "spider-slayer" |
    "wolf-slayer" |
    "enderman-slayer" |
    "blaze-slayer";

export const imageURLs: Record<Background, string> = {
    "generic": GenericBg,
    "dragons": DragonsBg,
    "dungeons-generic": DungeonsGenericBg,
    "dungeons-f1": DungeonsF1Bg,
    "dungeons-f2": DungeonsF2Bg,
    "dungeons-f3": DungeonsF3Bg,
    "dungeons-f4": DungeonsF4Bg,
    "dungeons-f5": DungeonsF5Bg,
    "dungeons-f6": DungeonsF6Bg,
    "dungeons-f7": DungeonsF7Bg,
    "dungeons-m7": DungeonsM7Bg,
    "experiments": ExperimentsBg,
    "generic-slayer": GenericSlayerBg,
    "zombie-slayer": ZombieSlayerBg,
    "spider-slayer": SpiderSlayerBg,
    "wolf-slayer": WolfSlayerBg,
    "enderman-slayer": EndermanSlayerBg,
    "blaze-slayer": BlazeSlayerBg,
}

export const currentBackground = ref<Background>("generic");
