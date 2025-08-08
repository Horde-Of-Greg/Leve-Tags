
function isPrime(i) {
    if (i == 2) return true;
    for (let j = 2; j < Math.pow(i, 0.5) + 1; ++j) {
        if (i % j === 0) return false;
    }
    return true;
}

function prime(n) {
    let result = [];
    for (let i = 2; i < Math.pow(n, 0.5); i++) {
        if (n % i == 0 && isPrime(i)) result.push(i);
        if (n % i == 0 && isPrime(n/i)) result.push(n/i);

    }
    return result.sort((a,b)=>a-b);
}

if (!tag.args){msg.reply("Usage: %t isprime <number>")};
const num = parseInt(tag.args);
if (isPrime(num)){msg.reply(`${num} is prime.`)} 
else {msg.reply(`${num} is not prime! Prime factors of ${num}: ${prime(num)}.`)};
