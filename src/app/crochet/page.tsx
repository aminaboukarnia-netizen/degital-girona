"use client";

import { useState } from "react";
import { CROCHET_VIDEO_PRESET } from "@/lib/crochet-video-preset";
import "./crochet.css";

const SHOT_NAMES = [
  "01 · ماكرو: السنارة والغرزة",
  "02 · من الفوق: اليدين والخيط",
  "03 · من الجانب: تفاصيل الشغل",
  "04 · زاوية 45°: اللمسات الأخيرة",
  "05 · القطعة واجدة: النتيجة النهائية",
] as const;

type Prepared = { bitmap?: ImageBitmap; video?: HTMLVideoElement; url?: string };
type ProgressFn = (value: number) => void;

function saveFile(blob: Blob, extension: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "nashrclip-crochet-preview." + extension;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
}

async function prepareMedia(file: File): Promise<Prepared> {
  if (file.type.startsWith("image/")) {
    return { bitmap: await createImageBitmap(file) };
  }
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = "auto";
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("ما قدرناش نقراو واحد الفيديو. استعملي MP4 أو WebM."));
      video.src = url;
      video.load();
    });
    return { video, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function paintShot(
  ctx: CanvasRenderingContext2D,
  media: Prepared,
  index: number,
  localProgress: number
) {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  ctx.fillStyle = "#161b2f";
  ctx.fillRect(0, 0, cw, ch);

  const source = media.bitmap ?? media.video;
  const sourceWidth = media.bitmap?.width ?? media.video?.videoWidth ?? 0;
  const sourceHeight = media.bitmap?.height ?? media.video?.videoHeight ?? 0;
  if (!source || !sourceWidth || !sourceHeight) return;
  if (media.video && media.video.readyState < 2) return;

  // Still photos use gentle motion; actual videos get a small crop variation
  // while retaining real hand movement. This does NOT create new camera angles.
  const videoCropByScene = [1.1, 1.07, 1.13, 1.09, 1.04];
  const zoom = media.bitmap ? 1.06 + 0.05 * localProgress : videoCropByScene[index] ?? 1.08;
  const scale = Math.max(cw / sourceWidth, ch / sourceHeight) * zoom;
  const dw = sourceWidth * scale;
  const dh = sourceHeight * scale;
  const drift = (localProgress - 0.5) * (media.bitmap ? 18 : 8) * (index % 2 === 0 ? 1 : -1);
  ctx.drawImage(source, (cw - dw) / 2 + drift, (ch - dh) / 2, dw, dh);
  // Intentionally draw NO text, titles, logo, captions, subtitles or watermark.
}

async function renderCrochet(
  files: (File | null)[],
  music: File | null,
  progress: ProgressFn
): Promise<string> {
  const sourceFiles = files.filter((f): f is File => Boolean(f));
  if (sourceFiles.length < 1) throw new Error("اختاري على الأقل صورة أو فيديو واحد من الحاسوب.");

  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 960;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context || typeof MediaRecorder === "undefined" || !canvas.captureStream) {
    throw new Error("المتصفح ما كيدعمش التصدير. استعملي Chrome أو Edge على PC.");
  }

  const prepared: Prepared[] = [];
  const stream = canvas.captureStream(24);
  let audioContext: AudioContext | undefined;
  let audioSource: AudioBufferSourceNode | undefined;
  let recorder: MediaRecorder | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;
  const chunks: BlobPart[] = [];
  let done = false;
  const cleanup = async () => {
    if (interval) clearInterval(interval);
    try { audioSource?.stop(); } catch { /* already stopped */ }
    for (const item of prepared) {
      item.bitmap?.close();
      if (item.video) { item.video.pause(); item.video.src = ""; }
      if (item.url) URL.revokeObjectURL(item.url);
    }
    stream.getTracks().forEach((track) => track.stop());
    if (audioContext) await audioContext.close().catch(() => undefined);
  };

  try {
    for (const file of sourceFiles) prepared.push(await prepareMedia(file));
    let captureStream: MediaStream = stream;
    if (music) {
      audioContext = new AudioContext();
      await audioContext.resume();
      const decoded = await audioContext.decodeAudioData(await music.arrayBuffer());
      const mix = audioContext.createMediaStreamDestination();
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = decoded;
      audioSource.loop = true;
      const gain = audioContext.createGain();
      gain.gain.value = 0.22; // Gentle background volume, not speech.
      audioSource.connect(gain).connect(mix);
      captureStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...mix.stream.getAudioTracks()
      ]);
    }

    const formats = music ? [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ] : [
      "video/mp4;codecs=avc1.42E01E",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    const mimeType = formats.find((m) => MediaRecorder.isTypeSupported(m));
    recorder = new MediaRecorder(captureStream,
      mimeType ? { mimeType, videoBitsPerSecond: 2_500_000 } : { videoBitsPerSecond: 2_500_000 }
    );

    const durationMs = CROCHET_VIDEO_PRESET.shots.reduce(
      (sum, shot) => sum + shot.durationSeconds * 1000, 0
    );
    // Use the user's own files, in order; if fewer than five, cycle them.
    const mediaForShot = files.map((f) => f ? sourceFiles.indexOf(f) : -1);
    const sequence = mediaForShot.map((slot, i) => prepared[slot < 0 ? i % prepared.length : slot]);

    // When only one input video is provided, DON'T restart it from zero
    // at every cut. Sample the beginning, middle, and actual finish.
    const singleVideo = sourceFiles.length === 1 && prepared[0].video
      ? prepared[0].video : null;
    const sampleStart = (shot: number): number => {
      if (!singleVideo) return 0;
      const duration = Number.isFinite(singleVideo.duration) ? singleVideo.duration : 0;
      const shotSeconds = CROCHET_VIDEO_PRESET.shots[shot].durationSeconds;
      const latestStart = Math.max(0, duration - shotSeconds - 0.12);
      return Math.min(latestStart, shot === 4
        ? Math.max(0, duration - shotSeconds - 0.12)
        : duration * (shot / 5));
    };
    return await new Promise<string>((resolve, reject) => {
      let scene = -1;
      const startedAt = performance.now();
      const fail = (error: Error) => {
        if (done) return;
        done = true;
        if (recorder?.state === "recording") recorder.stop();
        void cleanup().then(() => reject(error));
      };
      recorder!.ondataavailable = (event: BlobEvent) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder!.onerror = () => fail(new Error("فشل التسجيل. جرّبي Chrome."));
      recorder!.onstop = () => {
        if (done) return;
        done = true;
        const type = recorder!.mimeType || mimeType || "video/webm";
        const extension = type.includes("mp4") ? "mp4" : "webm";
        const output = new Blob(chunks, { type });
        void cleanup().then(() => {
          if (!output.size) reject(new Error("التسجيل خرج فارغ، عاودي التجربة."));
          else {
            saveFile(output, extension);
            resolve(extension.toUpperCase());
          }
        });
      };
      try {
        paintShot(context, sequence[0], 0, 0);
        recorder!.start(250);
        audioSource?.start();
        interval = setInterval(() => {
          try {
            const elapsed = Math.min(performance.now() - startedAt, durationMs);
            let remaining = elapsed;
            let nextScene = 0;
            for (let i = 0; i < CROCHET_VIDEO_PRESET.shots.length; i++) {
              const ms = CROCHET_VIDEO_PRESET.shots[i].durationSeconds * 1000;
              if (remaining < ms || i === CROCHET_VIDEO_PRESET.shots.length - 1) {
                nextScene = i; break;
              }
              remaining -= ms;
            }
            if (scene !== nextScene) {
              if (scene >= 0) sequence[scene].video?.pause();
              scene = nextScene;
              const current = sequence[scene].video;
              if (current) {
                // With one clip, pick a DIFFERENT time range for every scene.
                // With multiple clips, each scene begins from its own source start.
                current.currentTime = singleVideo === current ? sampleStart(scene) : 0;
                void current.play().catch(() => undefined);
              }
            }
            const shotMs = CROCHET_VIDEO_PRESET.shots[scene].durationSeconds * 1000;
            paintShot(context, sequence[scene], scene, Math.min(1, remaining / shotMs));
            progress(Math.min(100, Math.round(elapsed / durationMs * 100)));
            if (elapsed >= durationMs && recorder?.state === "recording") recorder.stop();
          } catch {
            fail(new Error("وقع مشكل أثناء المونتاج المحلي."));
          }
        }, 45);
      } catch {
        fail(new Error("ما قدرناش نبداو تسجيل الفيديو فهاد المتصفح."));
      }
    });
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export default function CrochetStudio() {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [music, setMusic] = useState<File | null>(null);
  const [licensed, setLicensed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  function chooseFile(index: number, file: File | null) {
    if (file && (!["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(file.type)
      || file.size > 60_000_000)) {
      setMessage("اختاري صور JPG/PNG/WebP أو فيديو MP4/WebM أقل من 60MB.");
      return;
    }
    setFiles((previous) => previous.map((old, i) => i === index ? file : old));
    setMessage("");
  }

  async function exportVideo() {
    if (busy) return;
    if (music && !licensed) {
      setMessage("خاصك تأكدي أن عندك الحق تستعملي هاد الموسيقى قبل التصدير.");
      return;
    }
    setBusy(true);
    setProgress(0);
    setMessage("كنجمّعو اللقطات داخل المتصفح ديالك. الصور والموسيقى ما كيتبعثوش للسيرفر.");
    try {
      const extension = await renderCrochet(files, music, setProgress);
      setMessage("تصدّرات النسخة التجريبية بصيغة " + extension +
        ". بلا كتابة ولا تعليق صوتي. راجعي الفيديو قبل أي استعمال.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل تصدير الفيديو.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="crochet-page" dir="rtl">
      <header className="crochet-header">
        <a href="/">NashrClip <span>AI</span></a>
        <a href="/studio">استوديو الأفكار</a>
      </header>
      <section className="crochet-hero">
        <div className="crochet-pill">🧶 Crochet Studio · تجربة مجانية 0€</div>
        <h1>الكروشي من زوايا مختلفة<br/><em>بلا كتابة، غير الصورة والموسيقى</em></h1>
        <p>جمعي 5 صور أو فيديوهات قصيرة واقعية من زوايا مختلفة. نديرو ليها مونتاج عمودي 18 ثانية،
          مع موسيقى هادئة من ملف عندك ومسموح باستعماله. بلا API ولا مصاريف توليد.</p>
      </section>
      <section className="crochet-panel">
        <div className="crochet-heading"><h2>1. لقطات الكروشي</h2><span>تقدري تجربي حتى بملف واحد؛ الزوايا الحقيقية المتعددة تحتاج تصوير أصلي من أكثر من زاوية</span></div>
        <div className="crochet-grid">
          {SHOT_NAMES.map((name, index) => (
            <label className="crochet-shot" key={name}>
              <b>{name}</b>
              <span>{CROCHET_VIDEO_PRESET.shots[index].durationSeconds} ثواني</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                disabled={busy} onChange={(event) => chooseFile(index, event.target.files?.[0] ?? null)} />
              <small>{files[index]?.name ?? "مازال ما اخترتي حتى ملف"}</small>
            </label>
          ))}
        </div>
        <p className="crochet-hint">إلا كان عندك فيديو أصلي ديال اليدين وهي كتخدم، استعمليه باش تبان الحركة حقيقية.
          إلا عطيتينا فيديو واحد، البرنامج غادي يختار مراحل مختلفة منه (البداية، الوسط والنهاية) بدل تكرار نفس البداية، مع اختلاف بسيط فالتقريب. ما غاديش يخلق زوايا تصوير حقيقية جديدة. الصور الثابتة غادي تتحرك غير بتقريب وتحريك الكاميرا (Pan/Zoom)، ماشي توليد حركة الكروشي بالذكاء الاصطناعي.</p>
      </section>
      <section className="crochet-panel">
        <h2>2. موسيقى هادئة اختيارية</h2>
        <label className="crochet-music">اختاري ملف MP3 أو WAV مرخّص من PC
          <input type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/ogg"
            disabled={busy} onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              if (file && file.size > 20_000_000) {
                setMessage("الموسيقى كبيرة بزاف. اختاري ملف أقل من 20MB."); return;
              }
              setMusic(file);
              setLicensed(false);
              setMessage("");
            }} />
        </label>
        {music && <label className="crochet-confirm">
          <input type="checkbox" checked={licensed} onChange={(event) => setLicensed(event.target.checked)} />
          كنأكد أن عندي الحق القانوني نستعمل هاد الموسيقى فالفيديو والمنصات اللي غادي ننشر فيها.
        </label>}
        <p className="crochet-hint">إلا ما اخترتيش موسيقى، الفيديو غادي يخرج صامت. ما كنحمّلوش موسيقى محمية بحقوق النشر بلا ترخيص.</p>
      </section>
      <section className="crochet-panel">
        <h2>3. تصدير معاينة الفيديو</h2>
        <p>18 ثانية · عمودي 9:16 · حتى 5 لقطات (كتعاود اللقطة الوحيدة إلا ما كايناش غيرها) · بلا نصوص ولا شعارات ولا تعليق صوتي · بلا نشر آلي.</p>
        <button className="crochet-export" type="button" disabled={busy || files.filter(Boolean).length < 1}
          onClick={exportVideo}>{busy ? "جاري تجهيز الفيديو…" : "صايب فيديو كروشي تجريبي مجاني"}</button>
        {busy && <progress className="crochet-progress" value={progress} max={100} />}
        {message && <p className="crochet-result" role="status">{message}</p>}
      </section>
      <aside className="crochet-safety"><b>باش نبقاو واضحين:</b> هاد الصفحة كتدير مونتاج محلي من صورك أو فيديوهاتك.
        ما كتولّدش فيديو فوتورياليستي جديد ولا زوايا حقيقية مختلفة من ملف واحد بوحدها، وما كتخلص حتى خدمة. الصور والموسيقى ما كتترفعش للسيرفر.
        نشر المحتوى على Instagram أو TikTok أو YouTube مازال معطّل، وخصو موافقتك الصريحة.
      </aside>
      <footer className="crochet-footer">NashrClip AI — معاينة شخصية مجانية وغير تجارية</footer>
    </main>
  );
}
