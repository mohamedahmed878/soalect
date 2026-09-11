import Reveal from "../../components/Reveal/Reveal";
import SwingTag from "../../components/SwingTag/SwingTag";
import SEO from "../../components/SEO/SEO";
import "./returnExchange.css";

const STEPS = [
  { title: "تواصل معانا", desc: "ابعتلنا رقم الطلب وسبب الاستبدال أو الاسترجاع عن طريق واتساب أو الإيميل خلال 14 يوم من الاستلام." },
  { title: "تجهيز القطعة", desc: "المنتج لازم يكون في حالته الأصلية، ماتلبسش، ومعاه التيكيت الأصلي." },
  { title: "استلام المنتج", desc: "هنبعتلك مندوب يستلم القطعة من عندك أو تقدر تسلمها في نقطة استلام قريبة منك." },
  { title: "الاستبدال أو الاسترجاع", desc: "بعد فحص القطعة، هنكمل الاستبدال بمقاس/لون تاني أو نرجعلك فلوسك خلال 5-7 أيام عمل." },
];

const FAQ = [
  { q: "هل الشحن مجاني في حالة الاستبدال؟", a: "أول عملية استبدال مجانية بسبب مقاس أو لون. أي استبدال إضافي بيتحمل العميل مصاريف الشحن." },
  { q: "إمتى مش هينفع أسترجع المنتج؟", a: "لو المنتج اتلبس، اتغسل، أو اتشال منه التيكيت الأصلي، أو لو مر أكتر من 14 يوم على الاستلام." },
  { q: "هل ممكن أسترجع فلوسي بدل الاستبدال؟", a: "أيوه، تقدر تختار استرجاع كامل المبلغ بدل الاستبدال بمنتج تاني." },
];

export default function ReturnExchange() {
  return (
    <>
      <SEO
        title="الاستبدال والاسترجاع"
        description="سياسة الاستبدال والاسترجاع في SOOLECT — استبدال أو استرجاع خلال 14 يوم من الاستلام."
        path="/return-exchange"
      />
      <section className="section container">
        <Reveal>
          <SwingTag>سياسة الاستبدال</SwingTag>
          <h1 className="return-title">الاستبدال والاسترجاع</h1>
          <p className="return-desc">
            عايزينك تكون مبسوط بكل قطعة من SOOLECT. لو المقاس مش مظبوط أو غيرت رأيك،
            تقدر تستبدل أو تسترجع خلال 14 يوم من تاريخ الاستلام.
          </p>
        </Reveal>
      </section>

      <section className="section container return-steps">
        <Reveal>
          <h2 className="section-title" style={{ marginBottom: 32 }}>خطوات الاستبدال</h2>
        </Reveal>
        <div className="return-steps__grid">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.07} className="return-step">
              <span className="return-step__num">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container return-faq">
        <Reveal>
          <h2 className="section-title" style={{ marginBottom: 24 }}>أسئلة شائعة</h2>
        </Reveal>
        <div className="return-faq__list">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.06} className="faq-item">
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
