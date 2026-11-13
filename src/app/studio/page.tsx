"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_KEYS, CATEGORY_LABELS, getFreeStoryboard, listFreeIdeas,
  type Category, type Language
} from "@/lib/free-studio";
import "./studio.css";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function wrapLines(
  ctx: CanvasRenderingContext2D, text: string, maxWidth: number
): string[] {
  const result: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const next = current ? current + " " + word : word;
    if (current && ctx.measureText(next).width > maxWidth) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result.slice(0, 7);
}

function drawFrame(
  ctx: CanvasRenderingContext2D, title: string, message: string,
  index: number, language: Language, elapsedMs: number
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  const colors = [
    ["#0c263c", "#3c275c"], ["#172d48", "#31265a"], ["#2a244c", "#093e4d"]
  ][index];
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // All graphics are generated in-browser: no images, external APIs or charges.
  const angle = elapsedMs / 2100;
  ctx.save();
  ctx.translate(w * .5, h * .33);
  ctx.rotate(angle);
  ctx.strokeStyle = "rgba(188,177,255,.2)";
  ctx.lineWidth = 4;
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 140 + k * 26, 140 + k * 26, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign = "center";
  ctx.direction = language === "ar" ? "rtl" : "ltr";
  ctx.fillStyle = "#bdb5ff";
  ctx.font = "bold 28px Tahoma, Arial, sans-serif";
  ctx.fillText("NashrClip AI  ·  0€", w / 2, 78);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px Tahoma, Arial, sans-serif";
  wrapLines(ctx, title, w - 80).slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, w / 2, 555 + i * 48);
  });
  ctx.font = "bold 30px Tahoma, Arial, sans-serif";
  const lines = wrapLines(ctx, message, w - 78);
  lines.forEach((line, i) => ctx.fillText(line, w / 2, 700 + i * 46));

  ctx.fillStyle = "#b0c7ee";
  ctx.font = "22px Tahoma, Arial, sans-serif";
  ctx.fillText(`${index + 1} / 3`, w / 2, h - 58);
  ctx.fillStyle = "#a89af6";
  ctx.fillRect(60, h - 34, ((index + 1) / 3) * (w - 120), 5);
}

async function createSilentVideo(
  title: string, scenes: readonly string[], language: Language
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 960;
  if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
    throw new Error("هاد المتصفح ما كيدعمش تسجيل الفيديو من Canvas. جرّبي Chrome على PC.");
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر بدء الرسم داخل المتصفح.");
  const mime = [
    "video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp8", "video/webm"
  ].find((type) => MediaRecorder.isTypeSupported(type));
  const stream = canvas.captureStream(20);
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: BlobPart[] = [];

  return await new Promise<string>((resolve, reject) => {
    let timer: number | undefined;
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      if (timer) window.clearInterval(timer);
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("فشل تسجيل الفيديو فالمتصفح."));
    };
    recorder.onstop = () => {
      if (timer) window.clearInterval(timer);
      stream.getTracks().forEach((track) => track.stop());
      if (!chunks.length) {
        reject(new Error("ما تسجل حتى فيديو. جرّبي Chrome."));
        return;
      }
      const type = recorder.mimeType || mime || "video/webm";
      const ext = type.includes("mp4") ? "mp4" : "webm";
      downloadBlob(new Blob(chunks, { type }), `nashrclip-preview.${ext}`);
      resolve(ext.toUpperCase());
    };
    try {
      const start = performance.now();
      drawFrame(ctx, title, scenes[0], 0, language, 0);
      recorder.start(300);
      timer = window.setInterval(() => {
        const elapsed = performance.now() - start;
        const index = Math.min(2, Math.floor(elapsed / 3000));
        drawFrame(ctx, title, scenes[index], index, language, elapsed);
        if (elapsed >= 9000 && recorder.state === "recording") recorder.stop();
      }, 50);
    } catch {
      if (timer) window.clearInterval(timer);
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("المتصفح منع التسجيل. اختاري متصفح Chrome أو Edge حديث."));
    }
  });
}

export default function FreeStudio() {
  const [language, setLanguage] = useState<Language>("ar");
  const [category, setCategory] = useState<Category>("technology");
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const ideas = useMemo(() => listFreeIdeas(category, language), [category, language]);
  const active = ideas[Math.min(selected, ideas.length - 1)];
  const storyboard = getFreeStoryboard(category, language, selected + 1);

  function selectCategory(next: Category) { setCategory(next); setSelected(0); setMessage(""); }
  function selectLanguage(next: Language) { setLanguage(next); setSelected(0); setMessage(""); }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(
        [active.title, active.hook, ...active.scenes, active.caption].join("\n\n")
      );
      setMessage("تنسخ النص بنجاح.");
    } catch {
      setMessage("ما قدرش المتصفح ينسخ النص. استعملي ملف JSON.");
    }
  }

  async function savePreview() {
    if (busy) return;
    setBusy(true);
    setMessage("كيترسم فيديو تجريبي صامت داخل المتصفح، بلا أي API أو رصيد.");
    try {
      const format = await createSilentVideo(active.title, active.scenes, language);
      setMessage(`تصدّر الفيديو بصيغة ${format}. هادي تجربة بالنصوص فقط، ماشي فيديو AI احترافي.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "وقع مشكل فالتصدير.");
    } finally { setBusy(false); }
  }

  return (
    <main className="studio">
      <header className="studio-head">
        <a className="studio-logo" href="/">NashrClip <span>AI</span></a>
        <span className="studio-tag">تجارب مجانية · 0€</span>
      </header>
      <section className="studio-hero">
        <h1>استوديو الأفكار والفيديوهات التجريبية</h1>
        <p>اختاري نوع المحتوى، وخدي فكرة وسيناريو بثلاث لقطات، وخرّجي فيديو قصير بالنصوص. الخدمة كلها محلية فالمتصفح: بلا مفاتيح API وبلا مصاريف توليد.</p>
        <p className="studio-status">● نموذج أولي مجاني — الفيديوهات التجريبية صامتة، والنشر التلقائي معطّل.</p>
      </section>
      <section className="studio-panel">
        <div className="studio-controls">
          <label className="studio-label">لغة المحتوى
            <select className="studio-select" value={language} onChange={(e) => selectLanguage(e.target.value as Language)}>
              <option value="ar">العربية / الدارجة</option><option value="es">Español</option>
            </select>
          </label>
          <label className="studio-label">نوع المحتوى
            <select className="studio-select" value={category} onChange={(e) => selectCategory(e.target.value as Category)}>
              {CATEGORY_KEYS.map((key) => <option key={key} value={key}>{CATEGORY_LABELS[language][key]}</option>)}
            </select>
          </label>
        </div>
        <div className="studio-list">
          {ideas.map((idea, index) => (
            <button type="button" key={idea.id}
              className={`studio-idea ${index === selected ? "selected" : ""}`}
              onClick={() => { setSelected(index); setMessage(""); }}>
              <strong>{idea.title}</strong><small>{idea.hook}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="studio-panel">
        <h2>{active.title}</h2><p className="studio-note">{active.hook}</p>
        <div className="studio-scenes">
          {storyboard.scenes.map((scene) => (
            <article className="studio-scene" key={scene.number}>
              <b>0{scene.number} · {scene.seconds}s</b><p>{scene.text}</p>
            </article>
          ))}
        </div>
        <h3>الوصف والهاشتاغات</h3>
        <p className="studio-caption">{active.caption}</p>
        <div className="studio-actions">
          <button className="studio-btn primary" type="button" disabled={busy} onClick={savePreview}>
            {busy ? "جاري تصدير 9 ثوانٍ…" : "صايب فيديو تجريبي مجاني"}
          </button>
          <button className="studio-btn" type="button" onClick={() => {
            downloadBlob(new Blob([JSON.stringify(storyboard, null, 2)], {type:"application/json"}), `${active.id}-plan.json`);
            setMessage("تحفظ مخطط الفيديو على الجهاز.");
          }}>حمّل مخطط JSON</button>
          <button className="studio-btn" type="button" onClick={copyText}>نسخ السيناريو</button>
        </div>
        {message && <p className="studio-message" role="status">{message}</p>}
        <div className="studio-warning"><strong>مهم:</strong> الأفكار الموجودة حالياً مكتوبة مسبقاً وماشي مولدة بذكاء اصطناعي خارجي. الفيديو اللي كيتحمّل تجربة بصرية صامتة بالنصوص والخلفيات، ماشي فيديو فيه صور ومشاهد حقيقية. ما كاين لا تخزين سحابي، لا ربط Instagram، لا نشر آلي، ولا استهلاك كريدت Kie.ai. أي نشر مستقبلي غادي يحتاج موافقة صريحة منك.</div>
      </section>
      <footer className="studio-foot"><a href="/">الرجوع للصفحة الرئيسية</a> · NashrClip AI — نسخة مجانية للتجربة الشخصية غير التجارية</footer>
    </main>
  );
}
