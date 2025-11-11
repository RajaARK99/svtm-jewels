import { Buffer, File } from "node:buffer";

if (typeof globalThis.File === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: Node.js File type is incompatible with browser File type
  globalThis.File = File as any;
}

if (typeof globalThis.Buffer === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: Buffer polyfill for edge runtime compatibility
  globalThis.Buffer = Buffer as any;
}
