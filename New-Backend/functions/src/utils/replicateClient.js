import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export function getModel(envKey, fallback = "owner/model:version") {
  return process.env[envKey] || fallback;
}
