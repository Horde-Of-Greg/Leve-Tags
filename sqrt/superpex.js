
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
alphabet.flatMap(a => alphabet.filter(b => b !== a).map(b => a + b)).map(c => c + "ex").join(" ");
