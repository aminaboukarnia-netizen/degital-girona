import { PROJECT } from "@/lib/project";

export default function Home() {
  return (
    <main className="shell">
      <header className="header">
        <div className="brand"><div className="brandIcon">N</div><div><b>NashrClip <span>AI</span></b><small>استوديو الفيديو الذكي</small></div></div>
        <div className="version">نسخة تجريبية {PROJECT.version}</div>
      </header>
      <section className="hero">
        <div className="eyebrow">● {PROJECT.phase}</div>
        <h1>من الفكرة للفيديو،<br /><em>وبموافقتك قبل النشر.</em></h1>
        <p>هذه النسخة الأولى للتحقق من النشر والاتصال فقط. لم نفعّل بعد توليد الفيديوهات، قواعد البيانات أو ربط منصات التواصل الاجتماعي.</p>
        <div className="actions">
          <a className="primary" href="/api/health" target="_blank" rel="noreferrer">فحص API الصحة <span>↗</span></a>
          <a className="secondary" href="#steps">شوف خطة التشغيل ↓</a>
        </div>
      </section>
      <section className="section">
        <div className="sectionHead"><h2>حالة المكونات</h2><span>الحالة الفعلية حسب المرحلة الأولى</span></div>
        <div className="cards">{PROJECT.checks.map((x) => (
          <article key={x.label} className="card"><span className={x.status === 'ready' ? 'dot good' : 'dot muted'} />
            <h3>{x.label}</h3><p>{x.status === 'ready' ? 'ملف الكود موجود — اختبره بعد النشر' : 'غير مفعّل بعد'}</p>
          </article>
        ))}</div>
      </section>
      <section className="section" id="steps">
        <div className="sectionHead"><h2>كيف سيعمل المشروع</h2><span>المراحل القادمة — ليست نشطة الآن</span></div>
        <div className="steps">{PROJECT.process.map((x,i)=><div className="step" key={x}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></div>)}</div>
      </section>
      <section className="notice"><strong>الحماية أولاً</strong><p>خادم MCP الحالي يعرض معلومات عامة فقط. لا ينشئ فيديوهات، لا يستعمل مفاتيح API، ولا يستطيع نشر أي شيء. إضافة أدوات مؤثرة أو مدفوعة ستحتاج مصادقة آمنة وموافقتك الصريحة.</p></section>
      <footer>© 2026 NashrClip AI · لا توجد عمليات نشر تلقائي في هذه النسخة</footer>
    </main>
  );
}
