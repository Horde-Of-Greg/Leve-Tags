
// Basically a rewrite of %t oceu with support for parallel hatches. Grace yourself to my (not as bad) code.
// Harass smallming._ if you encounter any bugs / want to extend the functionally of this,
// %t oldceu contains the old version of %t oceu before this revamp.
//
// All time will be in ticks, all chances will be in %.
//
// Check https://github.com/Horde-Of-Greg/oceu for everything.
//
// TYPES:
// recipe = {
//   base_eu:
//   base_duration:
//   base_chance:
//   base_chance_bonus:
//   base_parallel:
//   amperage: //Amps for parallel
//   flags:,
//   oc_type: "regular" || "parallel" || "ebf" || "ebf parallel",
// };
//
// output = [
//   {
//     parallel:
//     chance:
//     chance_bonus:
//     tier: //1 = LV, increase per tier
//     eu:
//     time:
//   },
// }
//

function import_code() {
  return [
    http.request("https://horde-of-greg.github.io/oceu/scripts/gen_table.js")
      .data,
    http.request("https://horde-of-greg.github.io/oceu/scripts/oceu.js").data,
    http.request("https://horde-of-greg.github.io/oceu/scripts/parsing.js")
      .data,
    http.request("https://horde-of-greg.github.io/oceu/scripts/report.js").data,
    http.request("https://horde-of-greg.github.io/oceu/scripts/util.js").data,
  ]
    .join("\n\n")
    .replace(/import[\s\S]*?;/g, "")
    .replace(/export/g, "");
}

function main() {
  if (!tag.args) {
    msg.reply({
      embed: {
        title: "Overclocking Calculator",
        description:
          "**Usage:**\n" +
          "`%t oceu <EU> <Duration> [Base Chance] [Chance Bonus] [Parallel] [Amperage]`\n" +
          "`%t oceu ebf <EU> <Duration> <Recipe Heat> <Coil Heat> [Parallel] [Amperage]`\n" +
          "`<>` marks required arguments, `[]` marks optional arguments\n" +
          "Use `-` to skip arguments\n" +
          "\n" +
          "For example, `%t oceu 120 20` overclocks a 120EU/t, 20s recipe. " +
          "`%t oceu ebf 1920 60.30 3600 5200` overclocks a 1920EU/t, 60.3s 3600K EBF recipe with the temp. of 5200K.\n" +
          "\n" +
          "`%t oceu --help` for more options.",
        footer: {
          text: "Check Out %t oceu_examples and %t oceu_web, If this doesn't work, use %t oldceu\n"
        },
      },
    });
    return;
  }

  if (tag.args === "--help") {
    msg.reply({
      embed: {
        title: "Overclocking Calculator",
        description:
          "**Usage:**\n" +
          "`%t oceu <EU> <Duration> [Base Chance] [Chance Bonus] [Parallel] [Amperage]`\n" +
          "`%t oceu ebf <EU> <Duration> <Recipe Heat> <Coil Heat> [Parallel] [Amperage]`\n" +
          "`<>` marks required arguments, `[]` marks optional arguments\n" +
          "Use `-` to skip arguments\n" +
          "\n" +
          "**Options:**\n" +
          "`--lcr`: make the recipe use perfect overclock (4x speed)\n" +
          "`--rates`: shows the rate of production (amount/s)\n" +
          "`--input:[amount]`: Input amount (Items or L or fluids) of the recipe\n" +
          "`--input:[amount]`: Ouput amount (Items or L of fluids) of the recipe\n" +
          "`--config`: applies a 0.9x boost from config maint. hatch\n" +
          "`--bulk`: running multiple recipes at once, seperate each recipe by newline\n" +
          "`--filter:<voltage>`: only show recipe by that voltage, combine with `--bulk` for production goodness\n" +
          "`--extra`: shows extra tiers from UEV to MAX\n" +
          "`--ce`: simulates GTCE behaviour, may break things\n" +
          "`--macerator`: (CE only) Adjust chanced outputs with CE macerator\n" +
          "`--tick`: always show ticks for time\n" +
          "\n\n",
        footer: {
          text: "Check out %t oceu_examples and %t oceu_web, If this doesn't work, use %t oldceu\n"
        },
      },
    });

    return;
  }

  if (Math.random() > 0.99){
    msg.reply("OC deez nuts\n-# run this again");
  }

  eval(import_code());

  // Matches: `--bulk`, `everything until \n (preflags)`, `everything else`
  const bulk_flag = tag.args.match(/--bulk([\s\S]*?)(?=\n|$)([\s\S]*)/);

  if (bulk_flag) {
    const pre_flags = bulk_flag[1] ? bulk_flag[1].split(" ") : [];
    let data = bulk_flag[2];
    data = data.split("\n").filter((element) => element);

    const recipes = data.map((element) => {
      return parse_input(element);
    });

    let [_result, outputs, flags] = generate_report(recipes);
    let results = _result
      .map((result, index) => {
        return `Recipe ${index + 1}: ${recipes[index].base_eu} EU/t for ${recipes[index].base_duration / 20}s\n` + generate_table(result, flags[index].concat(pre_flags));
      })
      .join("\n\n");
    results += "\n\n";
    results += `Production Speed: ${outputs.production_speed}\n`;
    results += `Bottleneck: ${outputs.bottleneck}\n`;
    results += `Ratios: ${outputs.ratios}\n`;

    return msg.reply(results);
  }

  try {
    let recipe = parse_input(tag.args);
    let [_recipe, output] = run_recipe(recipe);
    let table = generate_table(output, recipe.flags);

    msg.reply({
      embed: {
        title: `Input: ${recipe.base_eu} EU/t for ${recipe.base_duration / 20}s`,
        description: `\`\`\`${table}\`\`\``,
        footer: {
          text: recipe.flags.includes("--ce")
            ? "Applicable for GTCE,\n" +
            "tiers adjusted for actual machine tier,\n" +
            "Use a 4A CEF and a MAX energy hatch for MAX\n" +
            "for all options and syntax see %t oceu.\n"
            : "Applicable for NFu,\n" +
            "tiers adjusted for actual machine tier,\n" +
            "for all options and syntax see %t oceu.\n",
        },
      },
    });
  } catch (error) {
    return msg.reply({
      embed: {
        title: "Could not calculate",
        description: `${error}, please check %t oceu --help. \n`,
        footer: {
          text: "Check %t oceu_examples, If this doesn't work, use %t oldceu",
        },
      },
    });
  }
}

main();
