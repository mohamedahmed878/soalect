import { Link } from "react-router-dom";
import Reveal from "../../components/Reveal/Reveal";
import SwingTag from "../../components/SwingTag/SwingTag";
import SEO from "../../components/SEO/SEO";
import "./about.css";

const VALUES = [
  { title: "الجودة أولًا", desc: "قماش ثقيل، خياطة محكمة، وتفاصيل اتراجعت أكتر من مرة قبل ما توصلك." },
  { title: "هوية واضحة", desc: "كل قطعة بتحمل توقيع SOOLECT من التصميم للطباعة — مش مجرد لوجو." },
  { title: "قريبين منك", desc: "بنسمع فيدباك عملائنا فعليًا، وده بيشكل كل دروب جديد." },
];

export default function About() {
  return (
    <>
      <SEO
        title="من نحن"
        description="تعرف على قصة SOOLECT — ماركة ستريت وير مصرية بتركز على الجودة والتفاصيل الحقيقية."
        path="/about"
      />
      <section className="section container about-hero">
        <Reveal>
          <SwingTag>SOOLECT STORY</SwingTag>
          <h1 className="about-hero__title">مش مجرد براند ملابس.</h1>
          <p className="about-hero__desc">
            SOOLECT بدأت من فكرة بسيطة: الملابس اللي بتلبسها لازم تحكي حاجة عنك.
            مش بس تريند بنلحقه — إحنا بنركز على القماش، القصة، والتفاصيل اللي
            فعلًا بتفرق. كل دروب بنطلعه بيمر بمراحل تصميم وتجربة حقيقية قبل
            ما يوصلك.
          </p>
        </Reveal>
      </section>

      <section className="section container about-values">
        <Reveal>
          <h2 className="section-title" style={{ marginBottom: 32 }}>ليه SOOLECT؟</h2>
        </Reveal>
        <div className="about-values__grid">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08} className="value-card">
              <span className="value-card__num">0{i + 1}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container about-contact">
        <Reveal>
          <h2 className="section-title" style={{ marginBottom: 14 }}>تواصل معانا</h2>
          <p className="about-contact__desc">
            عندك سؤال عن طلبك أو مقاس معين؟ راسلنا على الواتساب وهنرد عليك بأقرب وقت.
          </p>
          <a
            href="https://wa.me/201200757959"
            target="_blank"
            rel="noopener noreferrer"
            className="about-contact__whatsapp"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3Z" />
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.2-.4-4.5-1.3l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
            </svg>
            <span>واتساب: 01200757959</span>
          </a>
        </Reveal>
      </section>

      <section className="about-cta">
        <div className="container about-cta__inner">
          <Reveal>
            <h2>جاهز تجرب SOOLECT؟</h2>
            <p>تصفح أحدث التشكيلة دلوقتي.</p>
            <Link to="/products" className="btn btn-primary">تسوق الآن</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
