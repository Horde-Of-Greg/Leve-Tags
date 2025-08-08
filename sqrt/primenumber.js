
let r = http.request("https://gist.githubusercontent.com/UhahaUhaha/066ce500ae24f83178fd5682b852beb0/raw/cc6632c21276c905007c7fe6810050169bac1988/text.txt");
let primes = r.data.split(" ");
let number = primes[Math.floor(Math.random() * primes.length)];
msg.reply({embed: {title: `Your ${tag.name.split("").join(" ")} is:`, description: number}});
