import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

// The "native" counterpart to the voice-cloning recipe: same lifecycle (create →
// use → delete), but calling the REST API directly with fetch + multipart form-data
// instead of the @speechify/api SDK.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const BASE = "https://api.speechify.ai";

// Bundled sample: ~26s of NASA ISS spacewalk audio (public domain).
const samplePath = path.resolve(import.meta.dirname, "../fixtures/spacewalk.wav");

interface CreatedVoice {
  id: string;
  display_name: string;
  type: string;
}
interface SpeechResponse {
  audio_data: string;
  audio_format: string;
  billable_characters_count: number;
}

async function main() {
  // 1. Clone a voice from an audio sample (10–30s of clean speech works well).
  //    POST /v1/voices is multipart/form-data — let fetch set the boundary by
  //    passing a FormData instance directly (do NOT set Content-Type manually).
  //    `consent` is REQUIRED: a JSON string attesting you have the speaker's
  //    permission to clone their voice.
  const form = new FormData();
  form.append("name", "cookbook-cloned-voice");
  form.append("gender", "male");
  form.append("consent", JSON.stringify({ fullName: "Jane Doe", email: "jane@example.com" }));
  // Wrap the file bytes in a Blob with the original filename for the multipart part.
  const sampleBytes = fs.readFileSync(samplePath);
  form.append("sample", new Blob([sampleBytes], { type: "audio/wav" }), "spacewalk.wav");

  const createRes = await fetch(`${BASE}/v1/voices`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!createRes.ok) {
    // Voice cloning is gated by plan. A 402 means it isn't included in yours.
    if (createRes.status === 402) {
      console.error(
        "\nVoice cloning isn't included in your current Speechify plan.\n" +
          "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing\n",
      );
      process.exit(1);
    }
    throw new Error(
      `POST /v1/voices → ${createRes.status} ${createRes.statusText}: ${await createRes.text()}`,
    );
  }

  const voice = (await createRes.json()) as CreatedVoice;
  console.log(`Cloned voice created: ${voice.id} (${voice.display_name}, type=${voice.type})`);

  try {
    // 2. Synthesize speech using the cloned voice — pass its id as voice_id.
    const speechRes = await fetch(`${BASE}/v1/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: "Hello from a voice cloned with the Speechify API.",
        voice_id: voice.id,
        audio_format: "mp3",
        model: "simba-3.0",
      }),
    });
    if (!speechRes.ok) {
      throw new Error(
        `POST /v1/audio/speech → ${speechRes.status} ${speechRes.statusText}: ${await speechRes.text()}`,
      );
    }
    const speech = (await speechRes.json()) as SpeechResponse;
    fs.writeFileSync("output.mp3", Buffer.from(speech.audio_data, "base64"));
    console.log("Wrote output.mp3");
  } finally {
    // 3. Clean up so cloned voices don't accumulate on your account.
    //    Remove this to keep the voice and reuse it later via voice.id.
    const delRes = await fetch(`${BASE}/v1/voices/${encodeURIComponent(voice.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!delRes.ok) {
      console.error(
        `DELETE /v1/voices/${voice.id} → ${delRes.status} ${delRes.statusText}: ${await delRes.text()}`,
      );
    } else {
      console.log(`Deleted cloned voice ${voice.id}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
