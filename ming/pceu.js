
/* 
Basically a rewrite of %t oceu with support for parallel hatches. Grace yourself to my (not as bad) code.
Harass smallming._ if you encounter any bugs / want to extend the functionally of this,
%t oldceu contains the old version of %t oceu before this revamp.

All time will be in ticks.

Types:
recipe: {
    base_eu: 
    base_chance: 
    base_chance_bonus: 
    base_duration: 
    base_recipe_heat: 
    base_coil_heat: 
    oc_type: 
};

*/

const voltage_tiers = [
    { tier: 1, name: "LV", eu_threshold: 32 },
    { tier: 2, name: "MV", eu_threshold: 128 },
    { tier: 3, name: "HV", eu_threshold: 512 },
    { tier: 4, name: "EV", eu_threshold: 2048 },
    { tier: 5, name: "IV", eu_threshold: 8192 },
    { tier: 6, name: "LuV", eu_threshold: 32768 },
    { tier: 7, name: "ZPM", eu_threshold: 131072 },
    { tier: 8, name: "UV", eu_threshold: 524288 },
    { tier: 9, name: "UHV", eu_threshold: 2097152 },
    { tier: 10, name: "UEV", eu_threshold: 8388608 },
    { tier: 11, name: "UIV", eu_threshold: 33554432 },
    { tier: 12, name: "UXV", eu_threshold: 134217728 },
    { tier: 13, name: "OpV", eu_threshold: 536870912 },
    { tier: 14, name: "MAX", eu_threshold: 2147483648 },
];

function get_tier_name(voltage) {
    const tier = voltage_tiers.find((t) => t.tier === voltage);
    return tier ? tier.name : null;
}

function get_eu_t(voltage) {
    return Math.pow(4, voltage - 1) * 32;
}

function get_voltage_tier(eu_cost) {
    for (const tier of voltage_tiers) {
        if (eu_cost <= tier.eu_threshold) {
            return tier.tier;
        }
    }
}

function parse_input(input) {
    input = input.map((value) => (value != "-" ? value : null));

    if (input.length < 2) {
        return;
    }

    if (input[0] === "ebf") {
        oc_type = input[5] ? "ebf parallel" : "ebf";
        return {
            base_eu: Number(input[1]),
            base_duration: Number(input[2]) * 20,
            base_recipe_heat: Number(input[3]),
            base_coil_heat: Number(input[4]),
            base_parallel: Number(input[5] ?? 0),
            amperage: Number(input[6] ?? 1),
            oc_type: oc_type,
        };
    } else {
        oc_type = input[4] ? "parallel" : "regular";

        return {
            base_eu: Number(input[0]),
            base_duration: Number(input[1]) * 20,
            base_chance: Number(input[2] ?? 0),
            base_chance_bonus: Number(input[3] ?? 0),
            base_parallel: Number(input[4] ?? 0),
            amperage: Number(input[5] ?? 2),
            oc_type: oc_type,
        };
    }

    return recipe;
}
function get_downclocks(parallel) {
    if (parallel < 4) return 0;
    if (parallel < 16) return 1;
    if (parallel < 64) return 2;
    if (parallel < 256) return 3;
    return 4; // parallel >= 256
}
function calculate_overclock(recipe, voltage) {
    /*
  ### Regular Overclocking

  The formula for calculating the final EU/t, duration, and chance after regular overclocking is:

  ``` 
  
  final_parallel = min(base_parallel, 4 ^ (overclock_tiers)
  final_eu = base_eu * (4 ^ overclock_tiers) 
  final_duration = baseduration / (2 ^ overclock_tiers) * downclocks
  final_chance = base_chance + (base_chance_bonus * overclock_tiers)
  ```
  where:

  * `base_eu`: The base EU/t of the machine.
  * `base_duration`: The base duration of the machine's cycle.
  * `base_chance`: The base chance of the machine successfully completing a cycle.
  * `base_chance_bonus`: The bonus chance added to the base chance for each overclock tier.
  * `overclock_tiers`: The number of overclock tiers applied.
  * `base_parallel`: the parallel hatch used by the machine.
  * `downclocks`: The amount of downclocks performed.
  
  ### output

  ```js 
  oc_output: {
    eu: 
    tier: 
  time:
    chance: 
    chance_bonus: 
    parallel:
  }
  ````
*/
    const output = {
        parallel: null,
        chance: null,
        chance_bonus: null,
    };

    // Null out the fields we don't use
    base_eu = recipe.base_eu;

    if (recipe.oc_type.includes("parallel")) {
        parallel = Math.min(
            recipe.base_parallel,
            Math.floor((recipe.amperage * get_eu_t(voltage)) / recipe.base_eu)
        );

        overclock_tiers =
            get_voltage_tier(recipe.amperage * get_eu_t(voltage)) -
            get_voltage_tier(base_eu);
        base_eu = recipe.base_eu * parallel;

        output.parallel = parallel;
    }

    overclock_tiers = Math.max(0, voltage - get_voltage_tier(base_eu));

    effective_eu = Math.floor(base_eu * Math.pow(4, overclock_tiers));
    effective_time = Math.floor(
        Math.max(1, recipe.base_duration / Math.pow(2, overclock_tiers))
    );

    output.tier = voltage;
    output.eu = effective_eu;
    output.time = effective_time;
    output.chance = Math.min(
        100,
        recipe.base_chance + recipe.base_chance_bonus * overclock_tiers
    );
    output.chance_bonus = recipe.base_chance_bonus;

    return output;
}

function calculate_ebf_overclock(recipe, voltage) {
    /*
  ### EBF Overclocking 

  The formula for calculating the final EU/t, duration, and chance after EBF overclocking is:

  ```js
  effective_heat = coil_heat + (overclock_tiers - 2) * 100
  ebf_perfect_overclocks(recipe_heat, effective_heat) = floor((effective_heat - recipe_heat) / 1800)
  ebf_eu_discount(recipe_heat, effective_heat) = 0.95 ^ floor((effective_heat - recipe_heat) / 900)
  overclock_tiers = ceil(log(base_eu * ebf_eu_discount(recipe_heat, coil_heat) / 32) / log(4)) + 1

  final_eu = base_eu * ebf_eu_discount(recipe_heat, effective_heat) * (4 ^ overclock_tiers)
  final_duration = base_duration / (2 ^ overclock_tiers) / (2 ^ min(overclock_tiers, ebf_perfect_overclocks(recipe_heat, effective_heat))) * (2 ^ downclocks)
  final_recipe_heat = recipe_heat + (eu_tier - 2) * 100
  final_coil_heat = coil_heat
  finaL_parallel = min(base_parallel, 4 ^ overclock_tiers)
  ```

  where:
  * `base_eu`: The base EU/t of the EBF.
  * `base_duration`: The base duration of the EBF's cycle.
  * `base_recipe_heat`: The base recipe heat of the EBF.
  * `base_coil_heat`: The base coil heat of the EBF.
  * `base_parallel`: the parallel hatch used by the machine.
  * `downclocks`: The amount of downclocks performed.

  ### output

  ```js 
  oc_output: {
    eu: 
    tier: 
    time:
    chance: 
    chance_bonus: 
    parallel:
  }
  ````
}
*/
    const output = {
        parallel: null,
        chance: null,
        chance_bonus: null,
    };
    // Null out the fields we don't use

    base_eu = recipe.base_eu;
    if (recipe.oc_type.includes("parallel")) {
        parallel = Math.floor(
            recipe.base_parallel,
            Math.floor((recipe.amperage * get_eu_t(voltage)) / recipe.base_eu)
        );
        base_eu = recipe.base_eu * parallel;
        output.parallel = parallel;
    }
    function ebf_eu_discount(recipeHeat, effectiveHeat) {
        return Math.pow(0.95, Math.floor((effectiveHeat - recipeHeat) / 900));
    }

    // We need to consider the voltage tier we are running with coil heat EU discount.
    // if the base coil without no bonus heat allows the recipe to go down a tier, then do it
    eu_tier = get_voltage_tier(
        base_eu *
            ebf_eu_discount(recipe.base_recipe_heat, recipe.base_coil_heat)
    );
    recipe_voltage = get_voltage_tier(get_eu_t(voltage) * recipe.amperage - 1);

    overclock_tiers = recipe_voltage - eu_tier;

    effective_heat = recipe.base_coil_heat + (recipe_voltage - 2) * 100;
    ebf_perfect_overclocks = Math.floor(
        (effective_heat - recipe.base_recipe_heat) / 1800
    );

    effective_eu =
        base_eu *
        ebf_eu_discount(recipe.base_recipe_heat, effective_heat) *
        Math.pow(4, overclock_tiers);

    effective_time =
        recipe.base_duration /
        Math.pow(4, Math.min(overclock_tiers, ebf_perfect_overclocks)) /
        Math.pow(2, Math.max(0, overclock_tiers - ebf_perfect_overclocks));
    //We first spend our ocs on perfect oc, if we have ocs left, then we do regular oc
    output.eu = Math.floor(effective_eu);
    output.time = Math.max(1, Math.floor(effective_time));
    output.tier = voltage;

    return output;
}

function generate_table(outputs) {
    // Initialize lengths for each column
    let eu_length = 7,
        time_length = 0,
        tier_length = 3,
        parallel_length = 1,
        chance_length = 0;
    const needs_chance = outputs[0].chance,
        needs_parallel = outputs[0].parallel;

    // Calculate maximum lengths for each column for padding
    outputs.forEach((row) => {
        eu_length = Math.max(row.eu.toString().length, eu_length);
        time_length = Math.max((row.time / 20).toString().length, time_length);
        if (needs_chance) {
            chance_length = Math.max(
                row.chance.toString().length,
                chance_length
            );
        }
        if (needs_parallel) {
            parallel_length = Math.max(
                row.parallel.toString().length,
                parallel_length
            );
        }
    });

    // Define unit suffixes and separator
    const separator = " | ";

    let table = outputs
        .map((row) => {
            let entry = generate_entry(row.eu, " EU/t", separator, eu_length);
            if (row.time >= 20) {
                entry += generate_entry(
                    row.time / 20,
                    "s",
                    separator,
                    time_length
                );
            } else {
                entry += generate_entry(row.time, "t", separator, time_length);
            }

            if (needs_chance) {
                entry += generate_entry(
                    row.chance,
                    " %",
                    separator,
                    chance_length
                );
            }
            if (needs_parallel) {
                entry += generate_entry(
                    row.parallel,
                    "x",
                    separator,
                    parallel_length
                );
            }
            entry += generate_entry(
                get_tier_name(row.tier),
                "",
                "",
                tier_length
            );
            return entry;
        })
        .join("\n");

    return table;
}

// Helper function to format each entry
function generate_entry(value, unit_suffix, separator, length) {
    value = value.toString();
    if (value.length >= length) {
        return `${value}${unit_suffix}${separator}`;
    }
    const padding_needed = length - value.length;
    return `${value}${unit_suffix}${" ".repeat(padding_needed)}${separator}`;
}

((_) => {
    if (!tag.args) {
        return;
    }
    const input = tag.args.split(" ");
    const recipe = parse_input(input);
    if (!recipe) {
        return;
    }

    eu_tier = get_voltage_tier(recipe.base_eu);
    output = [];
    switch (recipe.oc_type) {
        case "regular":
        case "parallel":
            for (index = eu_tier; index < 10; index++) {
                output.push(calculate_overclock(recipe, index));
            }
            break;
        case "ebf":
        case "ebf parallel":
            for (index = eu_tier; index < 10; index++) {
                output.push(calculate_ebf_overclock(recipe, index));
            }
            break;
    }
    if (
        recipe.base_eu < 0 ||
        recipe.base_duration < 0 ||
        recipe.base_chance < 0 ||
        recipe.base_chance_bonus < 0 ||
        recipe.base_recipe_heat < 0 ||
        recipe.base_coil_heat < 0 ||
        recipe.base_parallel < 0
    ) {
        return;
    }
    msg.reply({
        embed: {
            title: `Input: ${recipe.base_eu} EU/t for ${recipe.base_duration / 20} sec.`,
            description: `\`\`\`${generate_table(output)}\`\`\``,
            footer: {
                text:
                    "Applicable for NFu, tiers adjusted for actual machine tier,\n" +
                    "For parallelization, it assumed you are running 1A of said tier, \n" +
                    "Manually specify how much amperage you are running if this differs. \n" +
                    "for all options and syntax see %t oceu.",
            },
        },
    });
})();

msg.reply({
    embed: {
        title: "Could not calculate",
        description:
            "Invalid arguments specified, must be:\n" +
            "`%t oceu <EU> <Duration> [Base Chance] [Chance Bonus] {Parallel} {Amperage}`\n" +
            "\n" +
            "`<>` Signifies arguments needed for basic overclocking\n" +
            "`[]` arguments are needed for usage with chance calculations\n" +
            "`{}` arguments are needed for parallel calculations\n" +
            "Use `-` to skip arguments \n" +
            "\n" +
            "To calculate for EBF's use:\n" +
            "`%t oceu ebf <EU> <Duration> <Recipe Heat> <Coil Heat> {Parallel} {Amperage}`",
    },
});

// Local Testing, IGNORE
// oceu = function (input) {
//     const recipe = parse_input(input.split(" "));
//
//     if (!recipe) {
//         return;
//     }
//
//     eu_tier = get_voltage_tier(recipe.base_eu);
//     output = [];
//
//     switch (recipe.oc_type) {
//         case "regular":
//         case "parallel":
//             for (index = eu_tier; index < 10; index++) {
//                 output.push(calculate_overclock(recipe, index));
//             }
//             break;
//         case "ebf":
//         case "ebf parallel":
//             for (index = eu_tier; index < 10; index++) {
//                 output.push(calculate_ebf_overclock(recipe, index));
//             }
//             break;
//     }
//
//     if (
//         recipe.base_eu < 0 ||
//         recipe.base_duration < 0 ||
//         recipe.base_chance < 0 ||
//         recipe.base_chance_bonus < 0 ||
//         recipe.base_recipe_heat < 0 ||
//         recipe.base_coil_heat < 0 ||
//         recipe.base_parallel < 0
//     ) {
//         return;
//     }
//
//     console.log(generate_table(output) + "\n");
// };
//
// test_data = ["2 20", "480 600 - - 64"];
//
// for (const input of test_data) {
//     oceu(input);
// }

