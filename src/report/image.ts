import { createHash } from "node:crypto";
import QRCode from "qrcode";
import sharp from "sharp";
import { renderImageSvg as renderSharedImageSvg, repoDisplayName } from "./image-svg.ts";
import type { ImageSvgOptions } from "./image-svg.ts";
import type { MaturityReport } from "./types.ts";

const PNG_SIGNATURE_LENGTH = 8;
export const PNG_FINGERPRINT_KEYWORD = "AI-Maturity-Fingerprint";
export const PNG_IMAGE_HASH_KEYWORD = "AI-Maturity-Image-Hash";

export { repoDisplayName };

export interface ImageReportOptions extends Omit<ImageSvgOptions, "qrSvg"> {
  qrTargetUrl?: string;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
    .join(",")}}`;
}

export function reportFingerprint(report: MaturityReport): string {
  const payload = {
    repo: report.repo,
    meta: report.meta,
    level: report.level,
    ami: report.ami,
    dimensions: report.dimensions,
    normalizedMetrics: report.normalizedMetrics,
    rawMetrics: report.rawMetrics,
    files: report.files,
  };
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}

export async function imagePixelHash(png: Buffer): Promise<string> {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const header = Buffer.from(
    JSON.stringify({
      width: info.width,
      height: info.height,
      channels: info.channels,
    }),
    "utf8",
  );
  return createHash("sha256").update(header).update(data).digest("hex");
}

async function qrSvgFor(targetUrl: string | undefined): Promise<string | undefined> {
  if (!targetUrl) return undefined;
  return QRCode.toString(targetUrl, {
    type: "svg",
    margin: 0,
    color: {
      dark: "#182133",
      light: "#ffffff",
    },
  });
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

export function readPngTextChunk(png: Buffer, keyword: string): string | undefined {
  let offset = PNG_SIGNATURE_LENGTH;
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > png.length) return undefined;
    if (type === "tEXt") {
      const data = png.subarray(dataStart, dataEnd);
      const separator = data.indexOf(0);
      if (separator >= 0 && data.subarray(0, separator).toString("latin1") === keyword) {
        return data.subarray(separator + 1).toString("latin1");
      }
    }
    offset = dataEnd + 4;
  }
  return undefined;
}

function withPngTextChunk(png: Buffer, keyword: string, value: string): Buffer {
  const firstChunkLength = png.readUInt32BE(PNG_SIGNATURE_LENGTH);
  const firstChunkEnd = PNG_SIGNATURE_LENGTH + 12 + firstChunkLength;
  const data = Buffer.from(`${keyword}\0${value}`, "latin1");
  return Buffer.concat([
    png.subarray(0, firstChunkEnd),
    pngChunk("tEXt", data),
    png.subarray(firstChunkEnd),
  ]);
}

function withPngTextChunks(png: Buffer, chunks: readonly [string, string][]): Buffer {
  return chunks.reduce(
    (current, [keyword, value]) => withPngTextChunk(current, keyword, value),
    png,
  );
}

export async function renderImageSvg(
  report: MaturityReport,
  opts: ImageReportOptions = {},
): Promise<string> {
  return renderSharedImageSvg(report, {
    lang: opts.lang,
    qrSvg: await qrSvgFor(opts.qrTargetUrl),
    redacted: opts.redacted,
  });
}

export async function renderImagePng(
  report: MaturityReport,
  opts: ImageReportOptions = {},
): Promise<Buffer> {
  const svg = await renderImageSvg(report, opts);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const imageHash = await imagePixelHash(png);
  return withPngTextChunks(png, [
    [PNG_IMAGE_HASH_KEYWORD, imageHash],
    [PNG_FINGERPRINT_KEYWORD, reportFingerprint(report)],
  ]);
}
