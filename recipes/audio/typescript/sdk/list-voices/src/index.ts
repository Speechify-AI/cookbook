import "dotenv/config";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// Cap console noise on large catalogs; the pager still walks every page.
const MAX_PRINT = 25;

async function main() {
  // `locale` is a BCP-47 prefix filter ("en" matches en-US, en-GB, ...). Drop it
  // to list everything the key can see: the shared catalogue + your workspace clones.
  const page = await client.voices.list({ locale: "en" });

  // The returned Page is async-iterable and auto-pages: `for await` fetches each
  // subsequent page transparently, so you never touch a cursor. To page manually
  // instead, loop with `page.hasNextPage()` / `page = await page.getNextPage()`
  // (server caps `limit` at 200; pass an opt-in `cursor` to resume mid-catalogue).
  let total = 0;
  for await (const v of page) {
    total++;
    if (total <= MAX_PRINT) {
      // `type` is "shared" (Speechify's catalogue) or "personal" (your clones).
      // Each entry in `models` is a model the voice can be synthesized with.
      const models = v.models.map((m) => m.name).join(", ");
      console.log(`${v.id}  ${v.display_name}`);
      console.log(`  ${v.locale}  ${v.gender}  ${v.type}`);
      console.log(`  models: ${models}\n`);
    }
  }

  if (total > MAX_PRINT) {
    console.log(`... and ${total - MAX_PRINT} more`);
  }
  console.log(`Total voices: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
