// Production integration will be implemented in a later phase.
// Do not place secrets in frontend.
// Backend AI Gateway will proxy Gemini / OpenAI / Claude calls server-side.
// Frontend must never call provider APIs directly or hold raw API keys.
export const aiGatewayPlaceholder = () => {
  throw new Error("AI Gateway not implemented in Phase 1 (mock mode).");
};
