import { ref, reactive } from "vue";

export interface PoibinWorkUnit {
    type: "poibin";
    probabilities: Float64Array;
    successes: number;
}

type QueuedPoibinWorkUnit = PoibinWorkUnit & { _len: number };

export interface SlayerWorkUnit {
    type: "slayer";
    baseChance: { num: number, den: number };
    magicFind: number;
    rngMeterBosses: number;
    attempts: number;
    successes: number;
}

export type WorkUnit = QueuedPoibinWorkUnit | SlayerWorkUnit;

const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
const workQueue: WorkUnit[] = [];

export const values = reactive({ pmf: -1, cdf: -1 });
export const isWorking = ref(false);

// Whether the work currently being done is 'big', that is whether it should take a long time
// This is used to decide when to show the loading spinner
export const isBigWork = ref(false);

function updateWorkStatus() {
    isWorking.value = workQueue.length > 0;
    isBigWork.value = (() => {
        if (workQueue.length == 0) return false;

        const work = workQueue[0];
        // Slayer work is always long (due to it being a simulation)
        if (work.type == "slayer") {
            return work.successes != 1;
        }
        if (work.type == "poibin") {
            return work._len > 1500;
        }

        return false;
    })();
};

function dispatchWork() {
    const work = workQueue[0];
    if (work.type == "poibin")
        worker.postMessage(work, [work.probabilities.buffer]);
    else worker.postMessage(work);
}

worker.addEventListener("message", (ev) => {
    const { pmf, cdf } = ev.data;
    // this work unit is finished
    workQueue.shift();
    updateWorkStatus();
    // if there is still stuff in the work queue, then what we have here is outdated
    if (workQueue.length == 0) {
        values.pmf = pmf;
        values.cdf = cdf;
    } else {
        // dispatch the next one
        dispatchWork();
    }
});

// Pushes some new work to the end of the queue.
function allocateWork(work: WorkUnit) {
    if (workQueue.length == 0) {
        workQueue.push(work);
        // there is no work to be done, so assign it immediately
        dispatchWork();
        updateWorkStatus();
    } else if (workQueue.length == 1) {
        // there is already something going on, so just push it
        workQueue.push(work);
    } else {
        // there is something waiting, replace it since a newer update is queued
        workQueue[1] = work;
    }
}

export function poibinUpdate(probabilities: number[], successes: number) {
    // Check the inputs (the wasm function does not do that)
    if (!(Array.isArray(probabilities) && probabilities.every(val => typeof val == "number" && val >= 0.0 && val <= 1.0))) {
        console.log(probabilities);
        throw new TypeError("probabilities must be an array of numbers");
    }

    if (probabilities.length == 0) {
        throw new RangeError("probabilities must have at least one element");
    }

    if ((!Number.isInteger(successes)) || successes < 0 || successes > probabilities.length) {
        throw new RangeError("successes must be an integer in the range [0, number of probabilities]")
    }

    allocateWork({ type: "poibin", probabilities: new Float64Array(probabilities), successes, _len: probabilities.length });
}

export interface SlayerOptions {
    probability: { num: number, den: number };
    magicFind: number;
    aatroxPathfinder: boolean;
    aatroxXPBuff: boolean;
    rngMeterBosses: number;
    attempts: number;
    successes: number;
}

export function slayerUpdate(opts: SlayerOptions) {
    let pnum = opts.aatroxPathfinder ? opts.probability.num * 6 : opts.probability.num;
    let pden = opts.aatroxPathfinder ? opts.probability.den * 5 : opts.probability.den;

    // factor in Magic Find
    pnum *= 100 + opts.magicFind;
    pden *= 100;

    const rngMeterBosses = opts.aatroxXPBuff ? Math.ceil(opts.rngMeterBosses * 0.8) : opts.rngMeterBosses;

    if (pnum > pden || pnum / pden <= 0) {
        throw new RangeError("probability must be in the range (0, 1)");
    }

    if ((!Number.isInteger(opts.successes)) || opts.successes < 0 || opts.successes > opts.attempts) {
        throw new RangeError("successes must be an integer in the range [0, number of probabilities]");
    }

    allocateWork({
        type: "slayer",
        baseChance: { num: pnum, den: pden },
        magicFind: opts.magicFind,
        rngMeterBosses,
        attempts: opts.attempts,
        successes: opts.successes,
    });
}
