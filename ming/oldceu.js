
// This is the old version of %t oceu before addtional features are added, used as both an archive and a backup optioon
// if the new %t oceu didn't work, access with %t oldceu.
//
/*
Welcome to spaghetti,
Enjoy the ride, this is essentially a ported python script, adapted for this bot without knowledge of how it works
*/

//tier lookups
const tierlist = [
    "ULV",
    "LV",
    "MV",
    "HV",
    "EV",
    "IV",
    "LuV",
    "ZPM",
    "UV",
    "UHV",
    "UEV",
    "UIV",
];
const tierDict = {
    "N/A": 1,
    ULV: 1,
    LV: 1,
    MV: 2,
    HV: 3,
    EV: 4,
    IV: 5,
    LuV: 6,
    ZPM: 7,
    UV: 8,
    UHV: 9,
    UEV: 10,
    UIV: 11,
};

var baseEU = 0;
var baseDuration = 0;
var baseRecipeHeat = 0;
var baseCoilHeat = 0;
var multiamp = false;
var baseChance = 0;
var baseChanceBonus = 0;
var needsChance = false;
var needsDebug = false;
var ocType = "none";
var a = `abc`;
var debug = "";
if (!tag.args) {
    needsDebug = true;
} else {
    splits = tag.args.split(" ");
    if (splits.length == 2) {
        baseChance = 0;
        baseChanceBonus = 0;
        baseEU = splits[0];
        baseDuration = splits[1];
        needsChance = false;
        ocType = "regular";
    } else if (splits.length == 4) {
        baseChance = splits[2];
        baseChanceBonus = splits[3];
        baseEU = splits[0];
        baseDuration = splits[1];
        needsChance = true;
        ocType = "regular";
    } else if (splits.length == 5) {
        baseEU = splits[0];
        baseDuration = splits[1];
        baseRecipeHeat = splits[2];
        baseCoilHeat = splits[3];
        ocType = splits[4];
        needsChance = false;
    } else if (splits.length == 6) {
        baseEU = splits[0];
        baseDuration = splits[1];
        baseRecipeHeat = splits[2];
        baseCoilHeat = splits[3];
        ocType = splits[4];
        needsChance = false;
        multiamp = Boolean(splits[5]);
    } else {
        needsDebug = true;
    }
}

if (
    baseEU < 0 ||
    baseDuration < 0 ||
    baseChance < 0 ||
    baseChanceBonus < 0 ||
    baseRecipeHeat < 0 ||
    baseCoilHeat < 0
) {
    needsDebug = true;
}

function determine_power_tier(EUCost) {
    if (EUCost > 2097152) return "UHV";
    tier = Math.ceil((Math.log2(EUCost) - 3) / 2);
    if (tier <= 0) return "LV";
    return tierlist[tier];
}

function EbfCalc(baseEu, duration, recipeHeat, coilHeat) {
    // return [{"eu": 100, "time": 100, "tier": "MAX", "tierNumeral": -1}]
    baseEu = Number(baseEu);
    duration = Number(duration) * 20;
    recipeHeat = Number(recipeHeat);
    coilHeat = Number(coilHeat);
    list = [];
    overclocks = 0;
    // heat when run at lowest tier possible(ignores a recipe not able to run until a certain tier thats too fucked)
    // if the base coil no bonus heat allows the recipe to go down a tier, then do it
    // this skips some recursive shit but like your problem if you doing that
    euTier =
        Math.ceil(
            Math.log((baseEu * EbfEuDiscount(recipeHeat, coilHeat)) / 32) /
                Math.log(4)
        ) + 1; // 1 = mv, 2 = hv etc
    effectiveHeat = coilHeat + (euTier - 2) * 100;
    effectiveEu = baseEu * EbfEuDiscount(recipeHeat, effectiveHeat);
    list.push({
        eu: Math.floor(effectiveEu),
        tier: tierlist[euTier],
        tierNumeral: euTier,
        time: duration,
        recipeHeat: -1,
        coilHeat: -1,
        heatBonus: -1,
    });
    // because the eu gets increased before the results, the loop stops when the eu is more than uev not uiv
    //
    while (effectiveEu <= Math.pow(2, 23)) {
        effectiveHeat += 100;
        overclocks += 1;
        effectiveEu =
            baseEu *
            EbfEuDiscount(recipeHeat, effectiveHeat) *
            Math.pow(4, overclocks);
        // incase there is a recipe with very low eu/t such that the 0.95 discount means
        euTier = Math.ceil(Math.log(effectiveEu / 32) / Math.log(4)) + 1;
        // some of these values arent actually used so they are -1
        result = {
            eu: Math.floor(effectiveEu),
            tier: tierlist[euTier],
            tierNumeral: euTier,
            time: Math.max(
                Math.floor(
                    duration /
                        Math.pow(2, overclocks) /
                        Math.pow(
                            2,
                            Math.min(
                                overclocks,
                                EbfPerfectOverclocks(recipeHeat, effectiveHeat)
                            )
                        )
                ),
                1
            ),
            recipeHeat: -1,
            coilHeat: -1,
            heatBonus: -1,
        };
        list.push(result);
    }
    return list;
}

function EbfPerfectOverclocks(recipeHeat, effectiveHeat) {
    return Math.floor((effectiveHeat - recipeHeat) / 1800);
}

function EbfEuDiscount(recipeHeat, effectiveHeat) {
    return Math.pow(0.95, Math.floor((effectiveHeat - recipeHeat) / 900));
}

function calc_oc(
    baseEUPerTick,
    baseRuntimeInSecs,
    baseChancePercent,
    chanceBonusPercent
) {
    debug = debug + " " + baseChancePercent;
    start = {
        eu: baseEUPerTick,
        tier: determine_power_tier(baseEUPerTick),
        tierNumeral: tierDict[determine_power_tier(baseEUPerTick)],
        time: baseRuntimeInSecs * 20,
        chance: baseChancePercent,
        chanceBonus: chanceBonusPercent,
    };
    results = calc_oc_new(start, []);
    //print_oc_results(results)
    return results;
}

function calc_oc_new(start, list) {
    debug = debug + " " + start["chance"];
    overclockValue = 2;
    for (var i = start["tierNumeral"]; i < 10; i++) {
        overclockTiersMissed = start["tierNumeral"];
        overclock = i - overclockTiersMissed;
        result = {
            eu: start["eu"] * Math.pow(4, overclock),
            tier: tierlist[i],
            tierNumeral: i,
            time: Math.floor(
                Math.max(1, start["time"] / Math.pow(overclockValue, overclock))
            ),
            chance: Number(start["chance"]) + start["chanceBonus"] * overclock,
            chanceBonus: start["chanceBonus"],
        };
        list.push(result);
    }
    return list;
}

function assign_if_larger(input, variable) {
    if (String(input).length > variable) {
        variable = String(input).length;
    }
    return variable;
}

function generate_entry(originalString, suffix, seperator, targetLength) {
    originalString = String(originalString);
    if (originalString.length >= targetLength) {
        return originalString + suffix + seperator;
    }
    padding = "";
    paddingNeeded = targetLength - originalString.length;
    for (let i = 0; i < paddingNeeded; i++) {
        padding += " ";
    }
    return originalString + suffix + padding + seperator;
}

function generate_table(results) {
    euLength = 7;
    timeLength = 0;
    tierLength = 3;
    chanceLength = 0;

    results.forEach((r) => {
        euLength = assign_if_larger(r["eu"], euLength);
        timeLength = assign_if_larger(r["time"] / 20, timeLength);
        chanceLength = assign_if_larger(r["chance"], chanceLength);
    });

    seperator = " | ";
    euUnitSuffix = " EU/t";
    timeUnitSuffix = " sec";
    chanceUnitSuffix = " %";

    table = "";
    results.forEach((r) => {
        table += generate_entry(r["eu"], euUnitSuffix, seperator, euLength);
        table += generate_entry(
            r["time"] / 20,
            timeUnitSuffix,
            seperator,
            timeLength
        );
        if (needsChance)
            table += generate_entry(
                r["chance"],
                chanceUnitSuffix,
                seperator,
                chanceLength
            );
        table += generate_entry(r["tier"], "", "", tierLength);
        table += "\n";
    });
    return table;
}

footerText =
    "Applicable for NFu, tiers adjusted for actual machine tier.\n" +
    //+"CEu overclocking always give a flat 2x speed boost, and cost 4x more energy.\n"
    //+"Now supports EBF overclocking:\n"
    "For all options and syntax see %t oceu";
codeSpaceMarker = "```";

if (ocType == "regular") {
    calcs = calc_oc(baseEU, baseDuration, baseChance, baseChanceBonus);
    msg.reply({
        embed: {
            title: `Input: ${baseEU} EU/t for ${baseDuration} sec.`,
            description:
                codeSpaceMarker + generate_table(calcs) + codeSpaceMarker,
            footer: {
                text: footerText,
            },
        },
    });
} else if (ocType == "ebf") {
    calcs = EbfCalc(baseEU, baseDuration, baseRecipeHeat, baseCoilHeat);
    singleAmpMessage =
        "These values assume that you are using a single hatch of that tier. If you are not, see `%t oceu`";
    multiAmpMessage =
        "These values assume that you are using either multiple hatches, or multi-amp hatches. The energy tier given is the energy tier the EBF will effectivly run at.";
    creditsMessage =
        "\nThis rewritten command is made by boomervillager(aka boomervillager#3827), ping him for bad code. A full rewrite of the oceu command will be done by grauly soontm";

    finalMessage = codeSpaceMarker + generate_table(calcs) + codeSpaceMarker;
    //+ "WARNING: the way oc's currently are handeled for EBF's in regards to heat is currently not entirly reliable. A Issue regarding that is been submitted.\n"
    if (multiamp) {
        finalMessage += multiAmpMessage;
    } else {
        finalMessage += singleAmpMessage;
    }
    finalMessage += debug;

    msg.reply({
        embed: {
            title: `Input: ${baseEU} EU/t for ${baseDuration} secs with ${baseCoilHeat}K`,
            description: finalMessage,
            footer: {
                text: footerText + creditsMessage,
            },
        },
    });
} else {
    msg.reply({
        embed: {
            title: "Could not calculate",
            description:
                "Invalid arguments specified, must be:\n" +
                "`%t oceu <EU> <Duration> [Base Chance] [Chance Bonus]` \n\n" +
                "`<>` Signifies arguments needed for basic overclocking \n" +
                "`[]` arguments are needed for usage with chance calculations\n\n" +
                "To calculate for EBF's use:\n" +
                "`%t oceu <EU> <Duration> <Recipe Heat> <Coil Heat> ebf [Multi Amps]`\n" +
                "~~`[Multi Amps]` is the argument needed to get around current wierdness:~~\n" +
                "~~Set this to `true` if you are using multiple (or multi-amp) hatches, otherwise this can be omitted~~\n" +
                "This can be ignored for GTCEu 2.6.0+, which is in NomiCEu 1.6+",
        },
    });
}

