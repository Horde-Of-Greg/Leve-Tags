util.loadLibrary = "none";
util._isolateGlobals = false;
util.executeTag("canvaskitloader");

const {getTargetUser, getTargetMessage, getTargets} = ModuleLoader.loadModuleFromTag("user_util");
const {getPexiness} = ModuleLoader.loadModuleFromTag("pex_util");
const target_user = getTargetUser(msg);
const pexiness = getPexiness(target_user.id);

var base = 'User has a pexiness level of ';

var p0 = base + pexiness + "%. Public distillation is scheduled for tomorrow at 8:00 a.m.";

var p10 = base + pexiness + "%. 'People' like you do not deserve to live. Leave now or die.";

var p20 = base + pexiness + "%. Leave and never come back, you are not welcome here.";

var p30 = base + pexiness + "%. You are required to increase your pexiness level soon or leave.";

var p40 = base + pexiness + "%. Mediocre at best. Go to https://pexinesstraining.org/learn to improve.";

var p50 = base + pexiness + "%. Very average pexiness, you can do better.";

var p60 = base + pexiness + "%. Your pexiness is above average, you're doing well.";

var p70 = base + pexiness + "%. You're pretty pexy!";

var p80 = base + pexiness + "%. Amazing pexiness, you're one of the best!";

var p90 = base + pexiness + "%. 90%! Incredible, you're almost at the top!";

var p100 = base + pexiness + "%. The pexiest of them all. No other human can ever hope to achieve this level of pexiness.";

var p101 = base + "101%?!";

if (String(target_user.id) === "201370981921456128") {
  description = p101;
} else if (pexiness === null) {
  description = "Not enough recent messages to calculate pexiness. Please try again later.";
} else {
  switch (true) {
    case pexiness < 5:
      description = p0;
      break;
    case pexiness < 15:
      description = p10;
      break;
    case pexiness < 25:
      description = p20;
      break;
    case pexiness < 35:
      description = p30;
      break;
    case pexiness < 45:
      description = p40;
      break;
    case pexiness < 55:
      description = p50;
      break;
    case pexiness < 65:
      description = p60;
      break;
    case pexiness < 75:
      description = p70;
      break;
    case pexiness < 85:
      description = p80;
      break;
    case pexiness < 95:
      description = p90;
      break;
    case pexiness <= 100:
      description = p100;
      break;
  }
}

msg.reply({
  embed: {
    author: {
      name: target_user.displayName,
      icon_url: target_user.displayAvatarURL,
    },
    description: description + "\n\n-# To understand how pexiness is calculated, see %t pexiness_info",
  },
});
