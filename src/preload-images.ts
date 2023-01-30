import { imageURLs } from "./Background";
const startingBackground = imageURLs.generic;

// technically, the images are cached,
// but store them just in case
const images = [];

// preload the images
// this allows for instant background switching
// at the expense of longer load times
export const preload = () => {
    // only load the other ones when the starting one loads
    // (so they won't slow down the starting one)
    const startingImage = new Image();
    startingImage.src = startingBackground;
    startingImage.addEventListener("load", () => {
        images.push(startingImage);
        // we've already loaded the starting image
        Object.values(imageURLs).filter((url) => url != startingBackground).forEach((url) => {
            const image = new Image();
            image.src = url;
            // we need to store them somewhere
            images.push(image);
        });
    })
}
