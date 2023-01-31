use wasm_bindgen::prelude::*;
use num_complex::Complex;
use std::{f64::consts::PI, cmp::{Ordering, max}};

#[wasm_bindgen]
pub struct DistributionResult {
    pub pmf: f64,
    pub cdf: f64,
}

// Does not check if inputs are valid.
// Adapted from https://github.com/tsakim/poibin
#[wasm_bindgen]
pub fn poibin(probabilities: Box<[f64]>, successes: u32) -> DistributionResult {
    let trials = probabilities.len();
    let half_trials = trials / 2 + trials % 2;
    let omega = 2.0 * PI / (trials as f64 + 1.0);

    // Populate chis
    let exp_vals = (1..(half_trials + 1))
        .map(|val| (omega * (val as f64) * Complex::i()).exp())
        .collect::<Vec<_>>();

    let xy = exp_vals
        .iter()
        .map(|exp_val| {
            probabilities
                .iter()
                .map(|prob| exp_val * prob + (1.0 - prob))
                .collect::<Vec<_>>()
        })
        .collect::<Vec<Vec<_>>>();

    let argz_sum = xy.iter().map(|vec| {
        vec.iter()
            .map(|val| f64::atan2(val.im, val.re))
            .fold(0.0, |acc, val| acc + val)
    });

    let d_value = xy.iter().map(|vec| {
        vec.iter()
            .map(|val| val.norm().ln())
            .fold(0.0, |acc, val| acc + val)
            .exp()
    });

    let mut chi = vec![Complex { re: 1.0, im: 0.0 }];
    chi.reserve(trials);

    // set first half of chis
    chi.extend(
        d_value
            .zip(argz_sum.map(|val| (val * Complex::i()).exp()))
            .map(|tuple| tuple.0 * tuple.1),
    );

    // set second half of chis
    let chi_second_half = chi[1..(trials - half_trials + 1)]
        .iter()
        .rev()
        .map(|val| val.conj())
        .collect::<Vec<Complex<f64>>>();
    chi.extend(&chi_second_half);

    chi = chi.iter().map(|val| val / (trials as f64 + 1.0)).collect();

    // Perform the Fourier transform
    let mut planner = rustfft::FftPlanner::new();
    let fft = planner.plan_fft_forward(chi.len());
    fft.process(&mut chi);
    // that happens in-place
    let xi = chi;

    // check that they are all real
    if !xi.iter().all(|val| val.im < f64::EPSILON) {
        panic!("some xi value was not real");
    }

    let pmf_list = xi.iter().map(|val| val.re).collect::<Vec<f64>>();
    let pmf = pmf_list[successes as usize];
    let cdf = pmf_list[0..(successes as usize + 1)]
        .iter()
        .fold(0.0, |acc, val| acc + val);

    DistributionResult { pmf, cdf }
}

const FP_ONE: u128 = 18446744073709551616u128;
const TRIALS: u32 = 10_000_000;

#[wasm_bindgen]
pub fn slayer(base_chance_num: u32, base_chance_den: u32, rng_meter_bosses: u32, attempts: u32, successes: u32) -> DistributionResult {
    // This function does math on a special 64-bit fixed-point representation.
    // 0u64 is 0 and 18446744073709551616u128 is 1 (that means that u64 is a range of [0, 1))

    // 128-bit integers are used here in order to not overflow while multiplying by rational numbers
    let drop_chance = FP_ONE * base_chance_num as u128;
    let drop_chance = drop_chance / base_chance_den as u128;

    if drop_chance > 18446744073709551615u128 {
        panic!("Drop chance with Magic Find is over 100%");
    }

    let mut probability_table = Vec::<(u64, u64)>::with_capacity(rng_meter_bosses as usize);
    // To get to the nth attempt, we need to have failed all the previous chances
    let mut position_multiplier = FP_ONE;
    for i in 0..rng_meter_bosses {
        // Increased chance from the RNG meter
        let rng_meter_multiplier = (2 * i + rng_meter_bosses) as u128;

        let new_prob = (drop_chance * rng_meter_multiplier) / rng_meter_bosses as u128;

        // we need to mix the new probability into the position multiplier without it applied
        // (doing so would result in the position multiplier being applied to itself recursively, which is not how maths works)
        position_multiplier *= (new_prob as u64).wrapping_neg() as u128;
        position_multiplier /= FP_ONE;

        let new_prob = max((new_prob * position_multiplier) / FP_ONE, 1);

        // We want these as ranges that we can binary search on, so we need to add to the previous value
        let last_prob = match probability_table.last() {
            Some(n) => n.1,
            None => 0,
        };
        probability_table.push((last_prob, last_prob + new_prob as u64));
    }

    let mut rng = oorandom::Rand64::new(0x18f36702bab0a76d151361520ebb1e99);
    let rng_meter_fill_threshold = probability_table.last().unwrap().1;

    let mut pmf_hits = 0u32;
    let mut cdf_hits = 0u32;

    for _ in 0..TRIALS {
        // simulate a player
        let mut attempts_so_far = 0;
        let mut successes_this_run = 0;
        loop {
            let num = rng.rand_u64();

            if num >= rng_meter_fill_threshold {
                attempts_so_far += rng_meter_bosses;
            } else {
                // binary search to find the corresponding range
                attempts_so_far += probability_table.binary_search_by(|probe| {
                    if num < probe.0 {
                        Ordering::Greater
                    } else if num >= probe.1 {
                        Ordering::Less
                    } else {
                        Ordering::Equal
                    }
                }).unwrap() as u32;
            }
            successes_this_run += 1;

            if attempts_so_far > attempts {
                // last success was past attempt count
                successes_this_run -= 1;
                if successes_this_run <= successes {
                    cdf_hits += 1;
                    if successes_this_run == successes {
                        pmf_hits += 1;
                    }
                }
                break;
            }
        }
    }

    DistributionResult {
        pmf: pmf_hits as f64 / TRIALS as f64,
        cdf: cdf_hits as f64 / TRIALS as f64,
    }
}
