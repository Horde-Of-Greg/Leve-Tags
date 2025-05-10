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
    perfect_oc:
    oc_type: 
};

*/

const voltage_tiers = [
  { tier: 0, name: "ULV", eu_threshold: 8 },
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

function get_voltage_from_name(name) {
  const voltage = voltage_tiers.find((t) => t.name === name);
  return voltage ? voltage.tier : null;
}

function get_eu_t(voltage) {
  return Math.pow(4, voltage - 1) * 32;
}

function find_flag(flags, flag) {
  const data = flags.filter((value) => value.startsWith(flag));
  if (!data) {
    return;
  }
  return data[0];
}

function parse_flag(flags, flag) {
  const flag_data = find_flag(flags, flag);
  if (!flag_data) {
    return;
  }

  // skip the : between the flag and the value
  return flag_data.substring(flag.length + 1);
}

function get_voltage_tier(eu_cost, ce) {
  for (const tier of voltage_tiers) {
    if (eu_cost <= tier.eu_threshold) {
      if (!ce && tier.tier == 0) {
        return 1;
      }
      return tier.tier;
    }
  }
}

function parse_duration(input) {
  // You can explicitly specify for ticks by suffixing the time with "t"
  if (input.endsWith("t")) {
    return Math.floor(parseInt(input));
  } else {
    return Math.floor(parseFloat(input) * 20);
  }
}

function get_ratios(numbers) {
  const min_number = Math.min(...numbers);
  const scaled = numbers.map((num) => num / min_number);
  const ratios = scaled.map((num) => parseFloat(num.toFixed(2)));

  return ratios;
}

function parse_input(input) {
  flags = input.filter((value) => value != "-" && value.startsWith("--"));
  input = input
    .filter((value) => !value.startsWith("--"))
    .map((value) => (value != "-" ? value : null));

  if (input.length < 2) {
    return;
  }

  const eu_mod_flag = parse_flag(flags, "--eu");
  const time_mod_flag = parse_flag(flags, "--time");
  if (input[0] === "ebf") {
    oc_type = input[5] ? "ebf parallel" : "ebf";

    return {
      base_eu: eu_mod_flag
        ? Math.floor(parseInt(input[1]) * parseFloat(eu_mod_flag))
        : Math.floor(parseInt(input[1])),
      base_duration: time_mod_flag
        ? Math.floor(parse_duration(input[2]) * parseFloat(time_mod_flag))
        : Mathf.floor(parse_duration(input[2])),
      base_recipe_heat: parseInt(input[3]),
      base_coil_heat: parseInt(input[4]),
      base_parallel: parseInt(input[5] ?? 0),
      amperage: parseInt(input[6] ?? 1),
      flags: flags,
      oc_type: oc_type,
    };
  } else {
    oc_type = input[4] ? "parallel" : "regular";

    return {
      base_eu: eu_mod_flag
        ? Math.floor(parseInt(input[0]) * parseFloat(eu_mod_flag))
        : Math.floor(parseInt(input[0])),
      base_duration: time_mod_flag
        ? parse_duration(input[1]) * parseFloat(time_mod_flag)
        : parse_duration(input[1]),
      base_chance: parseFloat(input[2] ?? 0),
      base_chance_bonus: parseFloat(input[3] ?? 0),
      base_parallel: parseInt(input[4] ?? 0),
      amperage: parseInt(input[5] ?? 1),
      flags: flags,
      oc_type: oc_type,
    };
  }
}
function get_downclocks(parallel) {
  if (parallel < 4) return 0;
  if (parallel < 16) return 1;
  if (parallel < 64) return 2;
  if (parallel < 256) return 3;
  return 4; // parallel >= 256
}
function calculate_overclock(recipe, voltage) {
  const output = {
    parallel: null,
    chance: null,
    chance_bonus: null,
  };
  // Null out the fields we don't use

  let base_eu = recipe.base_eu;
  const is_ce = recipe.flags.includes("--ce");

  if (recipe.oc_type.includes("parallel")) {
    parallel = Math.min(
      recipe.base_parallel,
      Math.floor((recipe.amperage * get_eu_t(voltage)) / recipe.base_eu),
    );
    base_eu = recipe.base_eu * parallel;
    // We first parallel by modifying `parallel` and `base_eu` before we oc
    output.parallel = parallel;
  }

  let overclock_tiers = Math.max(0, voltage - get_voltage_tier(base_eu, is_ce));

  let effective_eu = Math.floor(base_eu * Math.pow(4, overclock_tiers));
  let effective_time = recipe.base_duration;

  if (is_ce) {
    if (base_eu >= 16) {
      effective_eu = base_eu;
      let overclock_count = 0;
      while (
        Math.floor(effective_time / 2.8) > 1 &&
        overclock_count < overclock_tiers
      ) {
        effective_time = Math.ceil(effective_time / 2.8);
        effective_eu = effective_eu * 4;

        overclock_count += 1;
      }
    } else {
      effective_time = Math.floor(
        Math.max(1, recipe.base_duration / Math.pow(2, overclock_tiers)),
      );
    }
  } else if (recipe.flags.includes("--lcr")) {
    effective_time = Math.floor(
      Math.max(1, recipe.base_duration / Math.pow(4, overclock_tiers)),
    );
  } else {
    effective_time = Math.floor(
      Math.max(1, recipe.base_duration / Math.pow(2, overclock_tiers)),
    );
  }

  if (recipe.flags.includes("--config")) {
    effective_time = Math.floor(effective_time * 0.9);
  }

  output.tier = voltage;
  output.eu = effective_eu;
  output.time = effective_time;
  output.chance = recipe.flags.includes("--ce")
    ? Math.min(100, recipe.base_chance * Math.pow(2, overclock_tiers))
    : Math.min(
        100,
        recipe.base_chance + recipe.base_chance_bonus * overclock_tiers,
      );
  output.chance_bonus = recipe.base_chance_bonus;

  return output;
}

function calculate_ebf_overclock(recipe, voltage) {
  const output = {
    parallel: null,
    chance: null,
    chance_bonus: null,
  };
  // Null out the fields we don't use

  // EBF behaviour in CE is identical to single blocks
  if (recipe.flags.includes("--ce")) {
    return calculate_overclock(recipe, voltage);
  }

  base_eu = recipe.base_eu;

  if (recipe.oc_type.includes("parallel")) {
    parallel = Math.floor(
      recipe.base_parallel,
      Math.floor((recipe.amperage * get_eu_t(voltage)) / recipe.base_eu),
    );
    base_eu = recipe.base_eu * parallel;
    //Same thing as regular oc

    output.parallel = parallel;
  }

  function ebf_eu_discount(recipeHeat, effectiveHeat) {
    return Math.pow(0.95, Math.floor((effectiveHeat - recipeHeat) / 900));
    // Apply a 95% discount every 900K in coil temp
  }

  eu_tier = get_voltage_tier(
    base_eu * ebf_eu_discount(recipe.base_recipe_heat, recipe.base_coil_heat),
    false,
  );

  recipe_voltage = get_voltage_tier(
    get_eu_t(voltage) * recipe.amperage - 1,
    false,
  );
  overclock_tiers = recipe_voltage - eu_tier;

  effective_heat = recipe.base_coil_heat + (recipe_voltage - 2) * 100;
  ebf_perfect_overclocks = Math.floor(
    (effective_heat - recipe.base_recipe_heat) / 1800,
  );

  eu_tier = get_voltage_tier(
    base_eu * ebf_eu_discount(recipe.base_recipe_heat, effective_heat),
    false,
  );
  // Recalculate the voltage tier we are running considering the coil heat increase from oc

  effective_eu =
    base_eu *
    ebf_eu_discount(recipe.base_recipe_heat, effective_heat) *
    Math.pow(4, overclock_tiers);

  effective_time =
    recipe.base_duration /
    Math.pow(4, Math.min(overclock_tiers, ebf_perfect_overclocks)) /
    Math.pow(2, Math.max(0, overclock_tiers - ebf_perfect_overclocks));
  //We first spend our ocs on perfect oc, if we have ocs left, then we do regular oc

  if (recipe.flags.includes("--config")) {
    effective_time = Math.floor(effective_time * 0.9);
  }

  output.eu = Math.floor(effective_eu);
  output.time = Math.max(1, Math.floor(effective_time));
  output.tier = voltage;

  return output;
}

function generate_table(outputs, flags) {
  // Initialize lengths for each column
  let eu_length = 3,
    time_length = 0,
    tier_length = 3,
    parallel_length = 1,
    chance_length = 0,
    rates_length = 6;

  const needs_chance = outputs[0].chance,
    needs_parallel = outputs[0].parallel,
    rates_flag = parse_flag(flags, "--rates");

  // Calculate maximum lengths for each column for padding
  outputs.forEach((row) => {
    eu_length = Math.max(row.eu.toString().length, eu_length);
    time_length = Math.max((row.time / 20).toString().length, time_length);
    if (needs_chance) {
      chance_length = Math.max(row.chance.toString().length, chance_length);
    }
    if (needs_parallel) {
      parallel_length = Math.max(
        row.parallel.toString().length,
        parallel_length,
      );
    }

    row.amount = 1;
    if (rates_flag) {
      const amount = rates_flag ? parseInt(rates_flag, 10) : 1;
      row.amount = amount;

      let rate = (1 / (row.time / 20)) * amount;
      if (needs_parallel) {
        rate = rate * row.parallel;
      }

      if (rate < 0.01) {
        row.rates = (rate * 60).toFixed(2).toString() + "/min";
      } else {
        row.rates = rate.toFixed(2).toString() + "/s";
      }
      rates_length = Math.max(row.rates.toString().length, rates_length);
    }
  });

  // Define unit suffixes and separator
  const separator = " | ";

  let table = outputs
    .map((row) => {
      let entry = generate_entry(row.eu, " EU/t", separator, eu_length);
      if (row.time >= 20) {
        entry += generate_entry(row.time / 20, "s", separator, time_length);
      } else {
        entry += generate_entry(row.time, "t", separator, time_length);
      }
      // Use ticks if time < 1s

      if (needs_chance) {
        entry += generate_entry(row.chance, " %", separator, chance_length);
      }
      if (needs_parallel) {
        entry += generate_entry(row.parallel, "x", separator, parallel_length);
      }
      if (rates_flag) {
        entry += generate_entry(row.rates, "", separator, rates_length);
      }

      // UHV in CEu == MAX in CE
      if (flags.includes("--ce") && row.tier == 9) {
        entry += generate_entry("MAX", "", "", tier_length);
      } else {
        entry += generate_entry(get_tier_name(row.tier), "", "", tier_length);
      }

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

function run_recipe(input, options) {
  const recipe = parse_input(input);
  if (!recipe) {
    return;
  }

  if (options.pre_flags) {
    recipe.flags = recipe.flags.concat(options.pre_flags);
  }

  eu_tier = get_voltage_tier(recipe.base_eu, recipe.flags.includes("--ce"));
  const output = [];
  const voltage_flag = parse_flag(recipe.flags, "--filter");
  let voltage = -1;

  if (voltage_flag) {
    voltage = get_voltage_from_name(voltage_flag);
    if (!voltage) {
      msg.reply({
        embed: {
          title: "Could not calculate",
          description: `\`${voltage}\` is not a vaild voltage, --filter:<voltage> must a vaild voltage`,
          footer: {
            text: "If this doesn't work, use %t oldceu",
          },
        },
      });
    }
  }

  switch (recipe.oc_type) {
    case "regular":
    case "parallel":
      if (voltage != -1) {
        output.push(calculate_overclock(recipe, voltage));
        break;
      }

      if (recipe.flags.includes("--extra") && !recipe.flags.includes("--ce")) {
        for (index = eu_tier; index <= 14; index++) {
          output.push(calculate_overclock(recipe, index));
        }
      } else {
        for (index = eu_tier; index <= 9; index++) {
          output.push(calculate_overclock(recipe, index));
        }
      }
      break;

    case "ebf":
    case "ebf parallel":
      if (voltage != -1) {
        output.push(calculate_ebf_overclock(recipe, voltage));
        break;
      }

      if (recipe.flags.includes("--extra") && !recipe.flags.includes("--ce")) {
        for (index = eu_tier; index <= 14; index++) {
          output.push(calculate_ebf_overclock(recipe, index));
        }
      } else {
        for (index = eu_tier; index <= 9; index++) {
          output.push(calculate_ebf_overclock(recipe, index));
        }
      }
      break;
  }

  let footer = recipe.flags.includes("--ce")
    ? "Applicable for Nomifactory,\n" +
      "tiers adjusted for actual machine tier,\n" +
      "for all options and syntax see %t oceu.\n"
    : "Applicable for NFu,\n" +
      "tiers adjusted for actual machine tier,\n" +
      "for all options and syntax see %t oceu.\n";
  if (recipe.oc_type.includes("parallel")) {
    footer +=
      "For parallelization, it assumed you are running 1A of said tier, \n" +
      "Manually specify how much amperage you are running if this differs. \n";
  }

  return [recipe, output, footer];
}

((_) => {
  if (!tag.args) {
    return;
  }

  const input = tag.args.split(" ");
  // Matches: `--bulk`, `everything until \n (preflags)`, `everything else`
  const bulk_flag = tag.args.match(/--bulk([\s\S]*?)(?=\n|$)([\s\S]*)/);

  if (bulk_flag) {
    const pre_flags = bulk_flag[1] ? bulk_flag[1].split(" ") : "";
    const data = bulk_flag[2];
    const recipes = data.split("\n").filter((element) => element);

    let msg_output = "";
    const production_rates = [];
    recipes.forEach((element) => {
      if (element) {
        const arr = run_recipe(element.split(" "), { pre_flags: pre_flags });
        const recipe = arr[0],
          output = arr[1];

        msg_output += `Input: ${recipe.base_eu} EU/t for ${recipe.base_duration / 20}s\n`;
        msg_output += generate_table(output, recipe.flags);
        msg_output += "\n\n";

        if (output.length === 1) {
          let amount = (1 / (output[0].time / 20)) * output[0].amount;
          if (output[0].parallel) {
            amount = amount * output[0].parallel;
          }
          production_rates.push(amount);
        }
      }
    });
    if (production_rates.length === recipes.length) {
      // total production rates = slowest of all machines
      const production_speed = Math.min(...production_rates);
      if (production_speed < 0.01) {
        msg_output += `Proudction Speed: ${(production_speed * 60).toFixed(
          2,
        )}/min\n`;
        msg_output += `Bottleneck: Recipe ${
          production_rates.indexOf(production_speed) + 1
        }`;
      } else {
        msg_output += `Proudction Speed: ${production_speed.toFixed(2)}/s\n`;
        msg_output += `Bottleneck: Recipe ${production_rates.indexOf(production_speed) + 1}\n`;
      }

      const ratios = get_ratios(production_rates);
      msg_output += `Ratio: ${ratios.join(":")}\n`;
    }

    msg.reply({
      embed: {
        title: `Bulk Recipe Result`,
        description: `\`\`\`${msg_output}\`\`\``,
        footer: {
          text: pre_flags.includes("--ce")
            ? "Applicable for Nomifactory,\n" +
              "tiers adjusted for actual machine tier,\n" +
              "for all options and syntax see %t oceu.\n"
            : "Applicable for NFu,\n" +
              "tiers adjusted for actual machine tier,\n" +
              "for all options and syntax see %t oceu.\n",
        },
      },
    });

    return;
  }

  let [recipe, output, footer] = run_recipe(input, {});

  msg.reply({
    embed: {
      title: `Input: ${recipe.base_eu} EU/t for ${recipe.base_duration / 20}s`,
      description: `\`\`\`${generate_table(output, recipe.flags)}\`\`\``,
      footer: {
        text: footer,
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
      "`%t oceu ebf <EU> <Duration> <Recipe Heat> <Coil Heat> {Parallel} {Amperage}`\n" +
      "\n" +
      "Flags:\n" +
      "`--lcr`: make the recipe use perfect overclock (4x speed)\n" +
      "`--rates[:<amount>]`: shows the rate of production (amount/s)\n" +
      "`--config`: applies a flat 0.9x speed boost from config maint. hatch\n" +
      "`--bulk`: running multiple recipes at once, seperate each recipe by newline\n" +
      "`--filter:<voltage>`: only show recipe by that voltage, combine with `--bulk` for production goodness\n" +
      "`--extra`: shows extra tiers from UEV to MAX\n" +
      "`--time:<multipler>`: multiplies recipe time by <multipler>\n" +
      "`--eu:<multipler>`: multiplies recipe EU cost by <multipler>\n" +
      "`--ce`: simulates CE behaviour, may break things\n",
    footer: {
      text: "Check %t oceu_example, If this doesn't work, use %t oldceu",
    },
  },
});

// const tag = `4 20 --ce`;
//
// const input = tag.split(" ");
//
// // Matches: `--bulk`, `everything until \n (preflags)`, `everything else`
// const bulk_flag = tag.match(/--bulk([\s\S]*?)(?=\n|$)([\s\S]*)/);
//
// if (bulk_flag) {
//   const pre_flags = bulk_flag[1] ? bulk_flag[1].split(" ") : "";
//   const data = bulk_flag[2];
//   const recipes = data.split("\n").filter((element) => element);
//
//   let msg_output = "";
//   const production_rates = [];
//   recipes.forEach((element) => {
//     if (element) {
//       const arr = run_recipe(element.split(" "), { pre_flags: pre_flags });
//       const recipe = arr[0],
//         output = arr[1];
//
//       if (pre_flags.length > 0) {
//         recipe.flags = recipe.flags.concat(pre_flags);
//       }
//
//       msg_output += `Input: ${recipe.base_eu} EU/t for ${recipe.base_duration / 20}s\n`;
//       msg_output += generate_table(output, recipe.flags);
//       msg_output += "\n\n";
//
//       if (output.length === 1) {
//         let amount = (1 / (output[0].time / 20)) * output[0].amount;
//         if (output[0].parallel) {
//           amount = amount * output[0].parallel;
//         }
//         production_rates.push(amount);
//       }
//     }
//   });
//   if (production_rates.length === recipes.length) {
//     // total production rates = slowest of all machines
//     const production_speed = Math.min(...production_rates);
//     if (production_speed < 0.01) {
//       msg_output += `Proudction Speed: ${(production_speed * 60).toFixed(
//         2,
//       )}/min\n`;
//       msg_output += `Bottleneck: Recipe ${
//         production_rates.indexOf(production_speed) + 1
//       }`;
//     } else {
//       msg_output += `Proudction Speed: ${production_speed.toFixed(2)}/s\n`;
//       msg_output += `Bottleneck: Recipe ${production_rates.indexOf(production_speed) + 1}\n`;
//     }
//
//     const ratios = get_ratios(production_rates);
//     msg_output += `Ratio: ${ratios.join(":")}\n`;
//   }
//   console.log(msg_output);
// } else {
//   let [recipe, output, footer] = run_recipe(input, {});
//   console.log(generate_table(output, recipe.flags));
// }
