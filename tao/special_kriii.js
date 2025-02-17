let whitelists = {
  baby: ["858048708377182218"], //Svamp
  cat: ["280486590780932096"], //Gregmeister
  cheese: ["517023348513964043"], //BoulesDeFromages
  cringe: ["1093328343337795725"], //Centz
  god: ["476161490815287306"], //MkcTao
  megaCringe: ["969613859625242624"], //Nate
  nothingToSee: ["201370981921456128"], //Exa
  scary: ["227245431891951635"], //Rusted
  proHacker: [
    "688439290035830810", //Mireole
    "1192128065275449414", //SmallMing
    "280486590780932096", //Gregmeister
  ],
  superBased: [
    "476161490815287306", //MkcTao
    "688439290035830810", //Mireole
    "280486590780932096", //Gregmeister
    "539917854770987018", //ofavor
  ],
};

let messages = {
  baby: "googoogaga https://cdn.discordapp.com/attachments/1266376637876928696/1287415624875900979/Savmp_issue.png?ex=66f176bb&is=66f0253b&hm=b3d9c3ccb522867306ef94c8a2d7968ccf42184182805aeeb2f90f0bf1b177ea&",
  cat: "Meow! https://cdn.discordapp.com/attachments/1268613021123608682/1276671733549760642/Zorb_krill.png?ex=66ca60b4&is=66c90f34&hm=ccaa7d77d29303035eca0cd962eb01004cdfc0d33be921f1d97a067bb96023c5&",
  cheese: "What? Cheese balls https://i.imghippo.com/files/ArJQl1723250929.png",
  cringe:
    "WE LOVE YOU CENTZ!!!! https://media.discordapp.net/attachments/1266376637876928696/1270521929043808416/5TJmyoO.png?ex=66b40141&is=66b2afc1&hm=a018964f15889eebaabf276033f2570fa9348c6b915e6d95ae770eeea15d91e4&=&format=webp&quality=lossless&width=1038&height=934",
  god: "Clearly rigged lol this is NOT a 0.0001% event https://cdn.discordapp.com/attachments/1266376637876928696/1270526775524462613/D6X05qm.png?ex=66b405c4&is=66b2b444&hm=3b197ccda19d0b4af71a7ecc5cb6a8699442d2ef5fe634ba4558cd69ad0c8cc5&",
  megaCringe:
    "Krill under construction still, come back later https://cdn.discordapp.com/attachments/1266376637876928696/1270524511950864424/0Cb6HkD.png?ex=66b403a8&is=66b2b228&hm=1a711f8d653f39f637acbcaab1cfaf542e472c3fcd304c791c4b13f5bb51d9da&",
  nothingToSee:
    "Just a normal tag and not a troll tag at all I swear https://imgur.com/f5AFIkJ",
  scary:
    "OOOOO Scary! https://media.discordapp.net/attachments/1266376637876928696/1276666074754056243/Rusted_krill.png?ex=66ca5b6f&is=66c909ef&hm=03f26c8ad2475df7b052cade50474b3cb6fff4ae8d230cf4ce6586bf0a624163&=&format=webp&quality=lossless",
  proHacker:
    "haker https://cdn.discordapp.com/attachments/1266376637876928696/1287417195722444800/Devissue.png?ex=66f17832&is=66f026b2&hm=2d4b6749b54184704abcbe3cbc54ee32d45d751934fe884749830f6b0e3dae4d&",
  superBased:
    " Gold krill? Could this be rigged? https://media.discordapp.net/attachments/1266376637876928696/1270529310150754445/qDw1ilw.png?ex=66b7fca0&is=66b6ab20&hm=1d64de3d0e800a2aee8dd932e09b8f6f744bfcae98da98c7e1cc59679b669741&=&format=webp&quality=lossless&width=1056&height=950",
};

function chancedSend(key, chance) {
  if (whitelists.get(key).includes(msg.author.id) && Math.random() < chance) {
    msg.reply(messages.get(key));
  }
}

// Super sends
chancedSend("god", 0.05);
chancedSend("superBased", 0.25);

// Custom sends - Group
chancedSend("proHacker", 0.4);

// Custom sends - Individual
chancedSend("cat", 0.75);
chancedSend("scary", 0.75);
chancedSend("baby", 0.75);
chancedSend("cheese", 0.75);
chancedSend("cringe", 0.75);
chancedSend("megaCringe", 0.75);
chancedSend("nothingToSee", 0.99);
