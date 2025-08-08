
let str = Array(7).fill().map(x => ["0", "1", "2", "3", "4", "5", "7", "8", "9"][~~(Math.random() * 10)]);
str[0] = str[0] == "0" ? "1" : str[0];
`Zalgo's iq is ${Number(str.join("")).toLocaleString()}`;
