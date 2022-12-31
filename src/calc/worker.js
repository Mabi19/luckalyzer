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
    if (data.successes == 1) {
        // This special case allows for an easier calculation:
        // P(X >= x) = 1 - P(none)
        if (data.attempts >= data.rngMeterBosses) {
            // We don't know the PMF and CDF, so these are arbitrarily-chosen values
            // that give 100% P(X >= x)
            return { pmf: 0, cdf: 0 };
        }

        let current = 1;
        const dropChance = (data.baseChance.num / data.baseChance.den);
        for (let i = 0; i < data.attempts; i++) {
            const rngMeterBonus = 1 + 2 * i / data.rngMeterBosses;
            current *= 1 - dropChance * rngMeterBonus;
        }

        // We don't know the PMF and CDF, but setting the CDF to current
        // and PMF to zero will give 1 - current for P(X >= x)
        //! Note: this means that an inverse results mode ("X% of people have luck worse than or equal to yours")
        //! can't work with this special case
        //! (this is the one of the reasons it's not implemented)
        return { pmf: 0, cdf: current };
    }

    console.time("slayer-exec");
    const result = slayer(data.baseChance.num, data.baseChance.den, data.rngMeterBosses, data.attempts, data.successes);
    console.timeEnd("slayer-exec");
    const pmf = result.pmf;
    const cdf = result.cdf;
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
