
class Xx_9zB_2 {
  constructor(a1b2) {
    // Store original tag.args under an absurdly named prop
    this['x64abo-5'] = a1b2;
    this._initLoader();
  }

  _initLoader() {
    // Load the CanvasKit zstd/base2n loader so `Module` is defined
    util.loadLibrary = 'none';
    if (util.env) {
      // In environments with fetchTag support
      eval(util.fetchTag('canvaskitloader').body);
    } else {
      // Fallback to executeTag
      util.executeTag('canvaskitloader');
    }
    // Ensure ModuleLoader is correctly configured
    ModuleLoader.useDefault('tagOwner');
    ModuleLoader.enableCache = false;
  }

  async _decodeSuffix() {
    // Contrived base2n payload that, once zstd-decompressed, yields "pex"
    const payload = '101100011011101100';
    // 1. base2n → array of numbers
    const nums = Module.base2n.decode(payload);
    const bytes = Uint8Array.from(nums);
    // 2. zstd → decompressed bytes
    const decompressed = Module.zstd.decompress(bytes);
    // 3. Decode UTF-8 to string
    return new TextDecoder().decode(decompressed);
  }

  async _roundTripBase64(str) {
    // 1. Encode to Base64
    const b64 = btoa(str);
    // 2. “Decode” via fetch on a data URI (makeshift API)
    const res = await fetch(`data:text/plain;base64,${b64}`);
    return res.text();
  }

  async execute() {
    // Get "pex", round-trip through Base64, append to original, and return
    const suffix = await this._decodeSuffix();
    const final  = await this._roundTripBase64(suffix);
    return this['x64abo-5'] + final;
  }
}

(async () => {
  const inst = new Xx_9zB_2(tag.args);
  msg.reply(await inst.execute());
})();
