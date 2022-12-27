import { imageURLs } from "./Background";

let preloadedBackgrounds;
// preload the images
// we need to keep these in memory, so they're going in this variable
export const preload = () => {
    preloadedBackgrounds = Object.values(imageURLs).map((url) => {
        const img = new Image();
        img.src = url;
        return img;
    });
}
