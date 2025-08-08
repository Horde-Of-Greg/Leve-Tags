
const count = 152;

let a = 0;
Math.random = () => {
    let b;

    if(a === 0) b = 0.0001;
    else if(a < count) b = 0.001;
    else b = 0.01;
    
    a++;
    return b;
};

Number.prototype.toFixed = function() {
    return Number.prototype.toString.call(this);
}

util.executeTag("iamlucky");
