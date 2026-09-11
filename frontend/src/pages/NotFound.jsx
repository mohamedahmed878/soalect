import Button from "../components/Button/Button";
import SEO from "../components/SEO/SEO";

export default function NotFound() {
  return (
    <section className="section container" style={{ textAlign: "center", minHeight: "60vh" }}>
      <SEO title="الصفحة مش موجودة" path="/404" noindex />
      <p className="eyebrow" style={{ justifyContent: "center" }}>404</p>
      <h1 className="section-title" style={{ marginBottom: 16 }}>
        الصفحة مش موجودة
      </h1>
      <p style={{ color: "var(--text-mid)", marginBottom: 28 }}>
        يمكن الرابط غلط أو الصفحة اتشالت. ارجع للرئيسية وكمل تسوق.
      </p>
      <Button to="/">الرجوع للرئيسية</Button>
    </section>
  );
}
