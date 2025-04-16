const sgHours = 5500,
      fac = sgHours * 3600000;

(() => {
    if(typeof tag.args !== "undefined") {
        const t = new Date().getTime(),
              t1 = new Date(tag.args).getTime();

        if(isNaN(t1)) {
            return "⚠️ Invalid date.";
        }

        if(t >= t1) {
            return `ℹ️ ${((t - t1) / fac).toFixed(2)} Stargates have passed since ${tag.args}.`;
        }

        return `ℹ️ ${tag.args} is ${((t1 - t) / fac).toFixed(2)} Stargates from now.`;
    }

    return `ℹ️ ${((new Date().getTime() - 980985600000) / fac).toFixed(2)} Stargates have passed since 01-01-2001.`;
})();

