// Streaming line count for a single file.
//
// Counts editor-visible lines: `wc -l` for files ending in `\n`, one more
// than `wc -l` otherwise.

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export async function countLines(filePath: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let count = 0;
    let opened = false;
    const stream = createReadStream(filePath, { encoding: "utf8" });
    const rl = createInterface({ input: stream, crlfDelay: Number.POSITIVE_INFINITY });

    stream.on("open", () => {
      opened = true;
    });
    rl.on("line", () => {
      count += 1;
    });
    rl.on("close", () => resolve(count));
    rl.on("error", (err) => {
      if (!opened) reject(err);
      else resolve(0);
    });
    stream.on("error", (err) => {
      if (!opened) reject(err);
      else reject(err);
    });
  });
}
