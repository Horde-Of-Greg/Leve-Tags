util.executeTag("isbased_butkriii");

let messages = {
  evil: "You found EVIL KRILL !!!! MUAHAHAHAHAHAHA !!!!! https://i.imghippo.com/files/OEU3B1721926088.png",
  waltuh:
    "TIME TO COOK! https://cdn.discordapp.com/attachments/1266376637876928696/1270499069621567498/BDBHdsm.png?ex=66b3ebf6&is=66b29a76&hm=c81e3c8dabf420d27b61cd5c16c847ea2bb8b5e1ce136ca13b4ba648f26d8a8e&",
  pleading:
    "SPARE ME PLEASE!!! https://cdn.discordapp.com/attachments/1266376637876928696/1270501745478471771/8BfaAvq.png?ex=66b3ee74&is=66b29cf4&hm=ee85efc172fdb5f70642d3233ab98df7056394706f7364407e21ecb9c9a8422c&",
  microsoft:
    "MICROSOFT I LOVE MICROFOOT https://cdn.discordapp.com/attachments/1266376637876928696/1270504509910552650/HULBw1B.png?ex=66b3f107&is=66b29f87&hm=d117d10f5fab71055840f957c0e64223f86ccd5927b5101c1cc60377be7b5762&",
  lgbt: "LGBT krill? https://cdn.discordapp.com/attachments/1266376637876928696/1270512174879608912/DaFP1fu.png?ex=66b3f82b&is=66b2a6ab&hm=cf2ea5631bd861d9f6832f8a27b395993ebfc0a32f655ff7c0f48eb10bf7937c&",
  chroma:
    "THIS IS THE RAREST CHROMA MAX KRILL!!!!!!!!!!! https://cdn.discordapp.com/attachments/1266376637876928696/1270526775524462613/D6X05qm.png?ex=66b405c4&is=66b2b444&hm=3b197ccda19d0b4af71a7ecc5cb6a8699442d2ef5fe634ba4558cd69ad0c8cc5&",
};

function chancedSend(key, chance) {
  if (Math.random() < chance) {
    msg.reply(messages[key]);
  }
}

// Funny sends
chancedSend("chroma", 0.00001); // Effective chance: 0.001%
chancedSend("lgbt", 0.02); // Effective chance: ≈2.00%
chancedSend("evil", 0.07); // Effective chance: ≈6.86%
chancedSend("pleading", 0.13); // Effective chance: ≈11.85%
chancedSend("waltuh", 0.145); // Effective chance: ≈11.50%
chancedSend("microsoft", 0.16); // Effective chance: ≈10.85%

// If all else fails, send a basic blue krill
// Effective chance: ≈56.95%
msg.reply(
  "https://cdn.discordapp.com/attachments/1253828565128970300/1254564988685647922/XX8AAAAASUVORK5CYII.png?ex=66a37b71&is=66a229f1&hm=2ed65dc5515f4a34587f3eaca3900d8c99bc88b7a8acaf3d265632edef7f10fc&"
);
