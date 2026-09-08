import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { SpeechifyClient, SpeechifyError } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// Cloning requires VERIFIED consent: the speaker records themselves reading a
// phrase Speechify returns, and that recording is kept as the consent record.
// The recording must be the SAME person as the voice sample. So this recipe is
// bring-your-own-audio — there is no sample that ships with valid consent.
const CONSENT_FULL_NAME = process.env.CONSENT_FULL_NAME ?? "Jane Doe";
const dir = import.meta.dirname;
// The voice to clone (10–30s of clean speech) and the consent recording (the
// same person reading the challenge phrase, 5–30s). Same speaker in both.
const samplePath = path.resolve(process.env.SAMPLE_PATH ?? path.join(dir, "../sample.wav"));
const consentPath = path.resolve(
  process.env.CONSENT_RECORDING_PATH ?? path.join(dir, "../consent.wav"),
);
// The challenge is single-use and its phrase is dynamic, so we cache it between
// runs: run once to get the phrase, record it, run again to submit.
const challengeCache = path.join(dir, "../.consent-challenge.json");

interface CachedChallenge {
  id: string;
  phrase: string;
  expires_at: string;
}

function loadChallenge(): CachedChallenge | null {
  if (!fs.existsSync(challengeCache)) return null;
  const c = JSON.parse(fs.readFileSync(challengeCache, "utf8")) as CachedChallenge;
  if (new Date(c.expires_at).getTime() <= Date.now()) return null; // expired → make a fresh one
  return c;
}

async function main() {
  // 1. Get (or reuse) a consent challenge. Its `phrase` is what the speaker
  //    must read aloud; `id` ties the recording to this consent on the create.
  let challenge = loadChallenge();
  if (!challenge) {
    challenge = await client.voices.consentChallenges.create({ full_name: CONSENT_FULL_NAME });
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

  // 3. Clone the voice: the sample + the consent recording + the challenge id.
  let voice;
  try {
    voice = await client.voices.create({
      name: "cookbook-cloned-voice",
      gender: "male",
      sample: fs.createReadStream(samplePath),
      consent_challenge_id: challenge.id,
      consent_recording: fs.createReadStream(consentPath),
    });
  } catch (err) {
    // Voice cloning is gated by plan. A 402 means it isn't included in yours.
    if (err instanceof SpeechifyError && err.statusCode === 402) {
      console.error(
        "\nVoice cloning isn't included in your current Speechify plan.\n" +
          "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing\n",
      );
      process.exit(1);
    }
    throw err;
  }
  fs.rmSync(challengeCache, { force: true }); // challenge is spent
  console.log(`Cloned voice created: ${voice.id} (${voice.display_name}, type=${voice.type})`);

  try {
    // 4. Synthesize speech using the cloned voice — pass its id as voice_id.
    const speech = await client.audio.speech({
      input: "Hello from a voice cloned with the Speechify API.",
      voice_id: voice.id,
      audio_format: "mp3",
      model: "simba-3.0",
    });
    fs.writeFileSync("output.mp3", Buffer.from(speech.audio_data, "base64"));
    console.log("Wrote output.mp3");
  } finally {
    // 5. Clean up so cloned voices don't accumulate on your account.
    //    Remove this to keep the voice and reuse it later via voice.id.
    await client.voices.delete({ voice_id: voice.id });
    console.log(`Deleted cloned voice ${voice.id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
