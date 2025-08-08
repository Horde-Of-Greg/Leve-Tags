
let str = tag.args,
     arr = [tag.args];

if(typeof str === "undefined") {
    "%t rotate (string)";
} else {
    for(let i = 0; i < str.length; i++) {
        str = str.slice(1) + str[0];
        arr.push(str);
    }

    arr.join(", ");
}
