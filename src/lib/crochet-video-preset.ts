/**
 * NashrClip AI — Crochet visual style preset (creative specification).
 *
 * This is configuration ONLY, not a video generation or music service.
 * It does not call a model, spend credits, download audio or publish content.
 * Do not display a "video created" state until an actual exported file exists.
 */
export const CROCHET_VIDEO_PRESET = {
  id: "crochet-cinematic-multiangle",
  label: "كروشي واقعي — زوايا متعددة وموسيقى هادئة",
  language: "visual-only",
  format: {
    aspectRatio: "9:16",
    targetDurationSeconds: 18,
    resolutionPreference: "1080x1920",
    intendedPlatforms: ["instagram_reels", "youtube_shorts", "tiktok"],
  },
  subject: {
    craft: "crochet",
    look: "photorealistic, elegant, tactile, handmade",
    recurringSubject: "the same pair of adult hands, yarn, crochet hook and workpiece across every shot",
    continuityRules: [
      "Keep skin, fingers, nail color, crochet hook, yarn color, yarn tension and stitch type consistent.",
      "Do not hallucinate extra fingers, swapped hooks, disappearing thread, impossible stitches or sudden object changes.",
      "Depict physically plausible crochet hand movements and stitch formation.",
      "Avoid visual flicker, deformed hands, jumpy stitches and synthetic-looking material.",
    ],
  },
  shots: [
    { number: 1, framing: "extreme macro", angle: "low 45-degree front angle", subject: "hook catching yarn through a stitch", durationSeconds: 3 },
    { number: 2, framing: "close-up", angle: "top-down", subject: "two hands completing a few realistic stitches", durationSeconds: 3 },
    { number: 3, framing: "medium-close", angle: "side profile", subject: "yarn gliding across fingers and the crochet texture growing", durationSeconds: 3 },
    { number: 4, framing: "close-up", angle: "over-the-shoulder 45-degree angle", subject: "careful assembly and finishing touches", durationSeconds: 4 },
    { number: 5, framing: "product beauty shot", angle: "slow orbit of the final craft", subject: "finished crochet object with beautiful natural lighting", durationSeconds: 5 },
  ],
  visuals: {
    lighting: "soft warm natural window light",
    palette: "warm neutral, harmonious pastels; keep chosen yarn color consistent",
    camera: "shallow depth of field, smooth deliberate movements, stable focus",
    attentionHook: "open on intriguing, detailed handwork or a close-up transformation — never an on-screen headline",
  },
  audio: {
    type: "music-only",
    quietBackgroundMusic: true,
    instrumentalPreference: "soft and gentle, no vocals, slow tempo",
    voiceOver: false,
    dialogue: false,
    ambientSound: false,
    requirements: [
      "Use only music with verified rights for the destination platform and intended use.",
      "Prefer an original composition or user-provided properly licensed music.",
      "If no licensed music is available, do not insert a copyrighted track; leave the preview silent and inform the user.",
      "Never automatically purchase tracks or music credits.",
    ],
  },
  overlays: {
    titleOnVideo: false,
    subtitles: false,
    textLabels: false,
    captionsBurnedIn: false,
    onScreenLogos: false,
    watermarks: false,
    endCard: false,
  },
  approvals: {
    requiresPreview: true,
    explicitHumanApprovalBeforePublishing: true,
    publishingEnabled: false,
  },
  budget: {
    maxAllowedAutomaticPaidSpendEuro: 0,
    noUnapprovedPaidAPIUse: true,
  },
  isImplementedVideoGeneration: false,
  status: "creative-specification-only",
} as const;

export const CROCHET_VIDEO_PROMPT = `Create a photorealistic vertical 9:16 short video of a real person crocheting a beautiful handcrafted item. Show the same two hands, the same yarn, and the same crochet hook across the full film, with physically accurate crochet stitches and natural hand movements. Use varied cinematic camera angles: extreme macro of the hook and stitch, top-down overhead, low 45-degree close-up, side-angle close-up, over-the-shoulder detail, and a graceful final beauty shot of the finished object. Warm natural window light, elegant neutral background, realistic fiber textures, tactile details, shallow depth of field, steady camera motion, believable continuity. Catch the viewer's attention through visual movement and composition, not text. Absolutely no titles, subtitles, labels, watermarks, logos or text on screen. No narration, dialogue or speech. Include only gentle, calm background music if an appropriately licensed music source is available; otherwise keep silent. Do not invent or use copyrighted tracks without permission. No social publishing without explicit human approval.`;
