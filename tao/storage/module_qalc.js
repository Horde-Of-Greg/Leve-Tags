"use strict";

module.exports = function qalc(expression) {
  const plotWidth = 1280,
    plotHeight = 720,
    fontName = "Roboto",
    fontSize = 25,
    voltages = [
      "ULV",
      "LV",
      "MV",
      "HV",
      "EV",
      "IV",
      "LuV",
      "ZPM",
      "UV",
      "UHV",
      "UEV",
      "UIV",
      "UMV",
      "UXV",
      "MAX",
    ],
    customUnits = ["rf", "eu", "tick", ...voltages],
    urls = {
      QalculatorInit: "https://files.catbox.moe/5wc7jh.js",
      QalculatorWasm: "https://files.catbox.moe/8zo7eo.wasm",
      UnitDefinitions: "https://files.catbox.moe/7424p9.xml",
      GnuplotInit: "https://files.catbox.moe/jln0df.js",
      GnuplotWasm: "https://files.catbox.moe/xmkrch.wasm",
      RobotoRegular: "https://files.catbox.moe/fmh6l7.ttf",
    },
    tags = {
      QalculatorInit: /^ck_qalc_init\d+$/,
      QalculatorWasm: /^ck_qalc_wasm\d+$/,
      UnitDefinitions: "ck_qalc_units",
      GnuplotInit: /^ck_gnuplot_init\d+$/,
      GnuplotWasm: /^ck_gnuplot_wasm\d+$/,
      RobotoRegular: /^ck_font_roboto\d+$/,
    },
    intervalRegex = /interval\((.+?),.+?\)/g;
  let input = "",
    font;

  const main = () => {
    // Use the passed expression as input
    input = typeof expression === "string" ? expression : String(expression);
    if (input.length < 1) {
      throw new Error(":warning: No expression provided.");
    }

    // Loader initialization and patches
    initLoader();
    Patches.apply("polyfillPromise", "polyfillTextEncoderDecoder");
    if ("tag" === loadSource) {
      loadBase2nDecoder();
      loadZstdDecompressor();
    }

    Benchmark.startTiming("load_qalculator");
    const QalcInit = ModuleLoader.loadModule(
      urls.QalculatorInit,
      tags.QalculatorInit,
      {
        scope: {
          performance: { now: (_) => Benchmark.getCurrentTime() },
          runGnuplot: { global: true, value: plotAndReply },
        },
      }
    );
    let Qalc,
      wasm = ModuleLoader.getModuleCode(
        urls.QalculatorWasm,
        tags.QalculatorWasm,
        FileDataTypes.binary,
        { encoded: true }
      );
    if ("tag" === loadSource) wasm = ZstdDecompressor.decompress(wasm);
    QalcInit({ wasmBinary: wasm })
      .then((qc) => (Qalc = qc))
      .catch((err) => console.error("err:", err));
    console.replyWithLogs("warn");
    Patches.patchGlobalContext({ Qalc: Qalc });
    Benchmark.stopTiming("load_qalculator");

    // Optionally load additional libraries if needed
    if ("tag" === loadSource) {
      loadLibrary("resvg");
      font = ModuleLoader.getModuleCode(
        urls.RobotoRegular,
        tags.RobotoRegular,
        FileDataTypes.binary,
        { encoded: true }
      );
    }

    Benchmark.startTiming("init_qalculator");
    const FS = Qalc.FS,
      calc = new Qalc.Calculator();
    if (customUnits.some((unit) => input.includes(unit))) {
      Benchmark.startTiming("load_units");
      const units = ModuleLoader.getModuleCode(
        urls.UnitDefinitions,
        tags.UnitDefinitions,
        FileDataTypes.text
      );
      FS.writeFile("units.xml", units);
      calc.loadDefinitions("units.xml");
      Benchmark.stopTiming("load_units");
    }
    Patches.patchGlobalContext({ calc: calc });
    Benchmark.stopTiming("init_qalculator");

    function fixOutput(out) {
      return out.replace(intervalRegex, (_, g1) => g1);
    }

    // Perform the calculation and return the result after processing
    return fixOutput(calc.calculateAndPrint(input, 3000));
  };

  // These functions are kept for potential use in plotting (not used in simple expression calculation)
  function initLoader() {
    util.loadLibrary = "none";
    if (util.env) {
      eval(util.fetchTag("canvaskitloader").body);
    } else {
      util.executeTag("canvaskitloader");
    }
    ModuleLoader.useDefault("tagOwner");
    ModuleLoader.enableCache = false;
  }

  function plotAndReply(...data) {
    loadGnuplot();
    const svg = runGnuplot(...data);
    console.replyWithLogs("warn");
    loadLibrary("resvg");
    const pngBytes = renderSvg(svg);
    // In this modification we do not output a file; the plotting function is retained for completeness.
    return pngBytes;
  }

  function loadGnuplot() {
    Benchmark.startTiming("load_gnuplot");
    const GnuplotInit = ModuleLoader.loadModule(
      urls.GnuplotInit,
      tags.GnuplotInit,
      { scope: { performance: { now: Benchmark.getCurrentTime } } }
    );
    let Gnuplot,
      wasm = ModuleLoader.getModuleCode(
        urls.GnuplotWasm,
        tags.GnuplotWasm,
        FileDataTypes.binary,
        { encoded: true }
      );
    if ("tag" === loadSource) wasm = ZstdDecompressor.decompress(wasm);
    GnuplotInit({
      wasmBinary: wasm,
      noInitialRun: true,
      print: (text) => console.log(text),
      printErr: (text) => console.error(text),
    })
      .then((gp) => (Gnuplot = gp))
      .catch((err) => console.error("err:", err));
    console.replyWithLogs("warn");
    Patches.patchGlobalContext({ Gnuplot: Gnuplot });
    Benchmark.stopTiming("load_gnuplot");
  }

  function runGnuplot(data_files, commands, _extra_commandline, _persist) {
    const FS = Gnuplot.FS,
      files = Object.keys(data_files);
    for (const [file, data] of Object.entries(data_files)) {
      FS.writeFile(file, data);
    }
    const cmds = commands.replace("set terminal pop", getTerminalString());
    FS.writeFile("/commands", cmds);
    Gnuplot.callMain(["/commands"]);
    const output = FS.readFile("/output", { encoding: "utf8" });
    for (const file of ["/commands", "/output", ...files]) FS.unlink(file);
    return output;
  }

  function getTerminalString() {
    return `set terminal svg size ${plotWidth},${plotHeight} font "${fontName},${fontSize}"\nset output '/output'`;
  }

  function renderSvg(svg) {
    svg = svg.replace(
      /(<\/desc>)/,
      '$1\n<rect width="100%" height="100%" fill="white" />'
    );
    return new Resvg(svg, { font: { fontBuffers: [font] } }).render().asPng();
  }

  try {
    return main();
  } catch (err) {
    // In case of an error, return the error message.
    return err.message;
  }
};
