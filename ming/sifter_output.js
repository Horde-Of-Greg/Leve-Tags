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
function get_voltage_from_name(name) {
  const voltage = voltage_tiers.find((t) => t.name === name);
  return voltage ? voltage.tier : null;
}

if (!tag.args) { msg.reply("Usage: %t sifter_output <voltage> <exquisite base chance> <flawless base chance> <regular item base chance> <purified dust base chance> <exquisite + tier chance> <flawless + tier chance> <regular item + tier chance> <purified dust + tier chance> [dust/gem]") };
const args = tag.args.split(" ");
const voltage = get_voltage_from_name(args[0]),
  exquisite_chance = parseFloat(args[1]) / 100,
  flawless_chance = parseFloat(args[2]) / 100,
  item_chance = parseFloat(args[3]) / 100,
  dust_chance = parseFloat(args[4]) / 100,
  exquisite_plus_chance = parseFloat(args[5]) / 100,
  flawless_plus_chance = parseFloat(args[6]) / 100,
  item_plus_chance = parseFloat(args[7]) / 100,
  dust_plus_chance = parseFloat(args[8]) / 100;
const gem = args[9] === "gem";
const oc_count = voltage - 1;
const item_count = (Math.min(1, exquisite_chance + exquisite_plus_chance * oc_count)) * 4 +
  (Math.min(1, flawless_chance + flawless_plus_chance * oc_count)) * 2 +
  (Math.min(1, item_chance + item_plus_chance * oc_count)) +
  (gem ? 0 : (Math.min(1, dust_chance + dust_plus_chance * oc_count)));
msg.reply(`${Number((item_count).toFixed(2))} item per purified ore.`);
