// https://github.com/vitest-dev/vitest/issues/4043

class ESBuildAndJSDOMCompatibleTextEncoder extends TextEncoder {
  constructor() {
    super();
  }

  encode(input: string) {
    if (typeof input !== "string") {
      throw new TypeError("`input` must be a string");
    }

    const decodedURI = decodeURIComponent(encodeURIComponent(input));
    const arr = new Uint8Array(decodedURI.length);
    const chars = decodedURI.split("");
    for (let i = 0; i < chars.length; i++) {
      arr[i] = decodedURI[i].charCodeAt(0);
    }
    return arr;
  }
}

global.TextEncoder = ESBuildAndJSDOMCompatibleTextEncoder;
