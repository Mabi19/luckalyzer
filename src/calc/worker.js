import init, { poibin, slayer } from "../../calc-impl/pkg";

// Since we're using web mode, we have to initialise the WASM
init();

function executePoibin(probabilities, successes) {
    console.time("poibin-exec");
    const result = poibin(probabilities, successes);
    console.timeEnd("poibin-exec");
    const pmf = result.pmf;
    const cdf = result.cdf;
    result.free();
    return { pmf, cdf };
}

function executeSlayer(data) {
    console.log(data);
    console.time("slayer-exec");
    const result = slayer(data.baseChance.num, data.baseChance.den, data.rngMeterBosses, data.attempts, data.successes);
    console.timeEnd("slayer-exec");
    const pmf = result.pmf;
    const cdf = result.cdf;
    console.log(pmf, cdf);
    result.free();
    return { pmf, cdf };
}

addEventListener("message", (e) => {
    if (e.data.type == "poibin") {
        const { probabilities, successes } = e.data;
        postMessage(executePoibin(probabilities, successes));
    } else if (e.data.type == "slayer") {
        postMessage(executeSlayer(e.data));
    } else {
        console.error("Unknown work type", e.type);
    }
});
