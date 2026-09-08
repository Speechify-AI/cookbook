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
// The verified-consent flow ships on this API version — pin it explicitly.
const VERSION = "2026-09-13";
const authHeaders = { Authorization: `Bearer ${token}`, "Speechify-Version": VERSION };

// Cloning requires VERIFIED consent: the speaker records themselves reading a
// phrase the API returns, and that recording is kept as the consent record. It
// must be the SAME person as the voice sample, so this recipe is
// bring-your-own-audio — there is no sample that ships with valid consent.
const dir = import.meta.dirname;
const CONSENT_FULL_NAME = process.env.CONSENT_FULL_NAME ?? "Jane Doe";
const samplePath = path.resolve(process.env.SAMPLE_PATH ?? path.join(dir, "../sample.wav"));
const consentPath = path.resolve(
  process.env.CONSENT_RECORDING_PATH ?? path.join(dir, "../consent.wav"),
);
// The challenge is single-use and its phrase is dynamic, so we cache it between
// runs: run once to get the phrase, record it, run again to submit.
const challengeCache = path.join(dir, "../.consent-challenge.json");

interface Challenge {
  id: string;
  phrase: string;
  expires_at: string;
}
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

function loadChallenge(): Challenge | null {
  if (!fs.existsSync(challengeCache)) return null;
  const c = JSON.parse(fs.readFileSync(challengeCache, "utf8")) as Challenge;
  if (new Date(c.expires_at).getTime() <= Date.now()) return null; // expired → make a fresh one
  return c;
}

async function main() {
  // 1. Get (or reuse) a consent challenge. Its `phrase` is what the speaker must
  //    read aloud; `id` ties the recording to this consent on the create.
  let challenge = loadChallenge();
  if (!challenge) {
    const res = await fetch(`${BASE}/v1/voices/consent-challenges`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: CONSENT_FULL_NAME }),
    });
    if (!res.ok) {
      throw new Error(
        `POST /v1/voices/consent-challenges → ${res.status} ${res.statusText}: ${await res.text()}`,
      );
    }
    challenge = (await res.json()) as Challenge;
    fs.writeFileSync(challengeCache, JSON.stringify(challenge, null, 2));
  }

  // 2. Make sure we have both recordings before spending the (single-use) challenge.
  const missing = [
    fs.existsSync(samplePath)
      ? null
      : `  sample:  ${samplePath}  (${CONSENT_FULL_NAME}'s voice, 10–30s of clean speech)`,
    fs.existsSync(consentPath)
      ? null
      : `  consent: ${consentPath}  (the SAME person reading the phrase below)`,
  ].filter(Boolean);
  if (missing.length > 0) {
    console.log(
      `\nConsent required. Have ${CONSENT_FULL_NAME} record themselves reading this phrase, exactly as written:\n\n` +
        `  "${challenge.phrase}"\n\n` +
        `Then provide these files and re-run (paths override via SAMPLE_PATH / CONSENT_RECORDING_PATH):\n` +
        missing.join("\n") +
        `\n\nChallenge expires ${challenge.expires_at}.\n`,
    );
    process.exit(1);
  }

  // 3. Clone the voice. POST /v1/voices is multipart/form-data — let fetch set the
  //    boundary by passing a FormData instance directly (do NOT set Content-Type).
  const form = new FormData();
  form.append("name", "cookbook-cloned-voice");
  form.append("gender", "male");
  form.append("consent_challenge_id", challenge.id);
  form.append("sample", new Blob([fs.readFileSync(samplePath)]), path.basename(samplePath));
  form.append(
    "consent_recording",
    new Blob([fs.readFileSync(consentPath)]),
    path.basename(consentPath),
  );

  const createRes = await fetch(`${BASE}/v1/voices`, {
    method: "POST",
    headers: authHeaders,
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
  fs.rmSync(challengeCache, { force: true }); // challenge is spent

  const voice = (await createRes.json()) as CreatedVoice;
  console.log(`Cloned voice created: ${voice.id} (${voice.display_name}, type=${voice.type})`);

  try {
    // 4. Synthesize speech using the cloned voice — pass its id as voice_id.
    const speechRes = await fetch(`${BASE}/v1/audio/speech`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
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
    // 5. Clean up so cloned voices don't accumulate on your account.
    //    Remove this to keep the voice and reuse it later via voice.id.
    const delRes = await fetch(`${BASE}/v1/voices/${encodeURIComponent(voice.id)}`, {
      method: "DELETE",
      headers: authHeaders,
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
