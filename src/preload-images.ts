import { imageURLs } from "./Background";

// preload the images
// this allows for instant background switching
// at the expense of longer load times
export const preload = () => {
    Object.values(imageURLs).forEach((url) => {
        const preloadTag = document.createElement("link");
        preloadTag.rel = "preload";
        preloadTag.as = "image";
        preloadTag.href = url;
        document.head.appendChild(preloadTag);
    });
}
