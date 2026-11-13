export const PROJECT = {
  name: "NashrClip AI",
  version: "0.1.0",
  phase: "المرحلة 1 — الهيكل التقني",
  current: "هيكل أولي. التوليد والنشر غير مفعلين بعد.",
  checks: [
    { label: "واجهة عربية", status: "ready" },
    { label: "API الصحة", status: "ready" },
    { label: "MCP للقراءة والفحص", status: "ready" },
    { label: "Turso", status: "pending" },
    { label: "توليد الصور والفيديو", status: "pending" },
    { label: "دمج الفيديوهات", status: "pending" },
    { label: "مراجعة بشرية قبل النشر", status: "pending" },
    { label: "Instagram / TikTok / YouTube", status: "pending" }
  ] as const,
  process: [
    "اختيار فكرة مناسبة للفيديو",
    "صياغة السيناريو واللقطات",
    "توليد الفيديو والصور عند تفعيل API",
    "تجميع المقاطع وتخزين النسخة النهائية",
    "معاينة الفيديو والحصول على موافقتك الصريحة",
    "نشر المحتوى على الحسابات المرخصة فقط"
  ]
} as const;
