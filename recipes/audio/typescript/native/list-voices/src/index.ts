import "dotenv/config";

// The "native" counterpart to the list-voices recipe: GET /v1/voices over raw
// fetch instead of the @speechify/api SDK. Unlike the SDK's auto-paging Page, the
// REST endpoint hands you one page + a cursor and you loop it yourself.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

// Cap console noise on large catalogs; we still walk every page.
const MAX_PRINT = 25;

interface Voice {
  id: string;
  display_name: string;
  locale: string;
  gender: string;
  type: "shared" | "personal";
  models: { name: string; languages: { locale: string }[] }[];
}
interface VoicesResponse {
  voices: Voice[];
  next_cursor: string | null;
  has_more: boolean;
}

async function main() {
  let total = 0;
  let cursor: string | null = null;

  // Real cursor pagination: keep fetching while `has_more`, feeding `next_cursor`
  // back as `?cursor=`. `limit` maxes at 200; `locale` is a BCP-47 prefix filter.
  do {
    const url = new URL("https://api.speechify.ai/v1/voices");
    url.searchParams.set("locale", "en");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      throw new Error(`GET /v1/voices → ${res.status} ${res.statusText}: ${await res.text()}`);
    }
    const { voices, next_cursor, has_more } = (await res.json()) as VoicesResponse;

    for (const v of voices) {
      total++;
      if (total <= MAX_PRINT) {
        // `type` is "shared" (catalogue) or "personal" (your clones). Each entry in
        // `models` is a model this voice can be synthesized with.
        const models = v.models.map((m) => m.name).join(", ");
        console.log(`${v.id}  ${v.display_name}`);
        console.log(`  ${v.locale}  ${v.gender}  ${v.type}`);
        console.log(`  models: ${models}\n`);
      }
    }

    cursor = has_more ? next_cursor : null;
  } while (cursor);

  if (total > MAX_PRINT) {
    console.log(`... and ${total - MAX_PRINT} more`);
  }
  console.log(`Total voices: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
