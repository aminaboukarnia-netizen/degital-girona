// Offline, original idea templates. No API calls, logins, cookies, or paid credits.
// These examples are creative prompts, not automatically researched facts.
export const CATEGORY_KEYS = ["technology", "nature", "stories", "business"] as const;
export const LANGUAGE_KEYS = ["ar", "es"] as const;
export type Category = (typeof CATEGORY_KEYS)[number];
export type Language = (typeof LANGUAGE_KEYS)[number];
export type Idea = {
  id: string;
  category: Category;
  title: string;
  hook: string;
  scenes: readonly [string, string, string];
  caption: string;
};
type Template = Omit<Idea, "id" | "category">;
const DATA: Record<Language, Record<Category, readonly Template[]>> = {
  ar: {
    technology: [
      {title:"نهار مع مساعد ذكي", hook:"تخيل تبدأ نهارك ومساعد ذكي كيساعدك تنظم كلشي!", scenes:["كتب المهام اللي عندك اليوم وخليها واضحة.","رتب الأولويات: حاجة مهمة قبل أي حاجة مستعجلة.","راجع النتيجة بنفسك قبل ما تعتمد عليها."],caption:"الذكاء الاصطناعي أداة للمساعدة، والقرار ديالك انت. #تكنولوجيا #ذكاء_اصطناعي"},
      {title:"3 نصائح باش تحمي حسابك",hook:"ثلاث عادات صغيرة كتعاونك تحمي حساباتك!",scenes:["استعمل كلمات مرور مختلفة وصعيبة التخمين.","فعّل التحقق بخطوتين فالحسابات المهمة.","ما تشاركش رموز الدخول حتى مع الأشخاص اللي كيثقو فيك."],caption:"خلي الأمان الرقمي عادة يومية. #حماية #تقنية"}
    ],
    nature: [
      {title:"رحلة قطرة مطر",hook:"فين كتمشي قطرة المطر منين كتهبط؟",scenes:["القطرة كتهبط فوق الأرض، الشجر أو السطح.","جزء كيتسرب للتربة، وجزء كيمشي فالجداول.","مع الشمس كتتبخر المياه وكتكمل الدورة."],caption:"جولة صغيرة فدورة الماء. #طبيعة #تعلم"},
      {title:"ساعة هدوء وسط الغابة",hook:"شنو تقدر تلاحظ إلا مشيتي للغابة بلا ضجيج؟",scenes:["سمع لحفيف الأوراق وتبدل الريح.","راقب الضوء كيفاش كيدوز بين الأغصان.","حافظ على المكان نقي وما تخليش أثر وراءك."],caption:"الطبيعة كتستاهل الهدوء والاحترام. #طبيعة #استرخاء"}
    ],
    stories: [
      {title:"قصة صندوق صغير",hook:"لقى صندوق قديم… واللي داخلو بدّل نهارو!",scenes:["كان كيمشي فزنقة قديمة ولقى صندوق صغير.","داخل الصندوق لقى رسالة كتقول: دير خير اليوم.","قرر يعاون شخص محتاج، ورجع للدار فرحان."],caption:"قصة قصيرة أصلية على أثر الخير. #قصص #حكايات"},
      {title:"المصباح والنافذة",hook:"كان كل ليلة كيشوف نفس الضوء، حتى قرر يعرف علاش…",scenes:["من بعيد كان ضوء صغير كيبان فنافذة قديمة.","مشى وسول؛ لقى جار كيقرا كل ليلة.","من داك النهار ولات بيناتهم صداقة مع كتاب."],caption:"حكاية خيالية قصيرة من NashrClip. #قصة #خيال"}
    ],
    business: [
      {title:"فكرة فيديو لمحل صغير",hook:"عندك محل وبغيتي الزبناء يعرفوك؟",scenes:["ورّي الواجهة ديال المحل بوضوح.","شرح خدمة واحدة كتقدمها فـ10 ثواني.","سالِي بدعوة مهذبة للزيارة أو الاستفسار."],caption:"من وراء الكواليس: خدمة من المحل. #مشروع_صغير #تسويق"},
      {title:"كيفاش تعرض منتوج بوضوح",hook:"منتوج واحد، وثلاث لقطات بسيطة!",scenes:["ورّي المنتوج من قريب بلا مبالغة.","بين الاستعمال الحقيقي ديالو بطريقة مفهومة.","ذكر الثمن والشروط الصحيحة إذا كنت غادي تبيع."],caption:"التوضيح والثقة أهم من المبالغة. #تجارة #محتوى"}
    ]
  },
  es: {
    technology: [
      {title:"Un día con un asistente digital",hook:"¿Y si organizas tu día con ayuda de la IA?",scenes:["Escribe las tareas que realmente necesitas terminar.","Ordena prioridades antes de abrir más aplicaciones.","Comprueba los resultados antes de tomar decisiones."],caption:"La IA ayuda, pero tú decides. #Tecnología #IA"},
      {title:"Tres hábitos de seguridad digital",hook:"Tres pequeños hábitos para proteger tus cuentas.",scenes:["Usa contraseñas diferentes para cada servicio.","Activa la verificación en dos pasos.","Nunca compartas los códigos de acceso."],caption:"La seguridad empieza por hábitos simples. #Ciberseguridad #Consejos"}
    ],
    nature: [
      {title:"El viaje de una gota",hook:"¿Qué sucede después de que cae una gota de lluvia?",scenes:["La lluvia cae sobre plantas, suelo y edificios.","Una parte se filtra y otra llega a arroyos y ríos.","El calor favorece la evaporación y el ciclo continúa."],caption:"Una historia breve del ciclo del agua. #Naturaleza #Aprender"},
      {title:"Un minuto de bosque",hook:"¿Qué puedes descubrir al caminar sin hacer ruido?",scenes:["Escucha el viento mover las hojas.","Observa la luz entre las ramas.","Respeta el lugar y no dejes basura."],caption:"Un momento para apreciar la naturaleza. #Bosque #Naturaleza"}
    ],
    stories: [
      {title:"La caja pequeña",hook:"Encontró una caja antigua y todo cambió…",scenes:["Al doblar una esquina, vio una caja junto a un árbol.","Dentro había una nota: Haz algo bueno hoy.","Ayudó a un vecino y regresó a casa sonriendo."],caption:"Relato original sobre pequeños actos. #Relatos #Historias"},
      {title:"La luz de la ventana",hook:"Cada noche brillaba una ventana…",scenes:["Desde lejos veía una luz al final de la calle.","Un día descubrió a una vecina que leía allí.","Compartieron un libro y empezó una amistad."],caption:"Una pequeña historia de ficción. #Cuentos #Ficción"}
    ],
    business: [
      {title:"Una idea para tu negocio",hook:"¿Quieres presentar tu negocio en pocos segundos?",scenes:["Enseña la entrada y el nombre del local.","Explica un servicio concreto y real.","Invita a contactar con un mensaje sencillo."],caption:"Conoce nuestro trabajo de cerca. #PequeñoNegocio #Marketing"},
      {title:"Tres planos para un producto",hook:"Un producto, tres tomas que cuentan su historia.",scenes:["Enseña el producto con buena luz.","Demuestra su uso real de forma clara.","Comunica precios y condiciones sin exagerar."],caption:"La claridad construye confianza. #Producto #Comercio"}
    ]
  }
};
export const CATEGORY_LABELS: Record<Language, Record<Category, string>> = {
  ar: { technology:"التكنولوجيا", nature:"الطبيعة", stories:"القصص", business:"المشاريع والمحلات" },
  es: { technology:"Tecnología", nature:"Naturaleza", stories:"Historias", business:"Negocios" }
};
export function listFreeIdeas(category: Category, language: Language): Idea[] {
  return DATA[language][category].map((item, i) => ({
    ...item, id: `${language}-${category}-${i + 1}`, category
  }));
}
export function getFreeStoryboard(category: Category, language: Language, ideaNumber: number) {
  const n = Math.min(Math.max(Math.trunc(ideaNumber || 1), 1), 2);
  const idea = listFreeIdeas(category, language)[n - 1];
  return {
    ...idea, language, durationSeconds: 9, aspectRatio: "9:16",
    scenes: idea.scenes.map((text, index) => ({
      number: index + 1, seconds: 3, text,
      visual: "Original gradient background with text. No copyrighted images."
    })),
    requiresHumanApprovalBeforePublish: true,
    source: "Free offline templates; no external AI was called.",
    publishingEnabled: false
  };
}
