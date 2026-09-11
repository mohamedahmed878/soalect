import { Link } from "react-router-dom";
import "./footer.css";

const PERKS = [
  { title: "جودة مضمونة", desc: "نستخدم أفضل الخامات لأعلى جودة" },
  { title: "دفع آمن", desc: "طرق دفع آمنة ومتعددة" },
  { title: "شحن سريع", desc: "توصيل سريع لجميع المحافظات" },
  { title: "خدمة عملاء", desc: "نحن هنا لمساعدتك 24/7" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__perks">
        <div className="container footer__perks-grid">
          {PERKS.map((perk) => (
            <div className="perk" key={perk.title}>
              <span className="perk__icon" aria-hidden="true" />
              <div>
                <h4>{perk.title}</h4>
                <p>{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container footer__main">
        <div className="footer__brand">
          <span className="navbar__logo footer__logo">SOOLECT</span>
          <p>ماركة ملابس ستريت وير مصرية. أسلوبك، هويتك — ملابس مصممة عشان تعبّر عنك.</p>
          <div className="footer__social">
            <a href="#" aria-label="Instagram" className="btn-icon">IG</a>
            <a href="#" aria-label="TikTok" className="btn-icon">TT</a>
            <a href="#" aria-label="WhatsApp" className="btn-icon">WA</a>
          </div>
        </div>

        <div className="footer__col">
          <h5>تسوق</h5>
          <Link to="/products">كل المنتجات</Link>
          <Link to="/products?category=hoodies">هوديز</Link>
          <Link to="/products?category=tshirts">تيشيرتات</Link>
          <Link to="/products?category=pants">بنطلونات</Link>
        </div>

        <div className="footer__col">
          <h5>الشركة</h5>
          <Link to="/about">من نحن</Link>
          <Link to="/return-exchange">الاستبدال والاسترجاع</Link>
          <Link to="/affiliate">تسويق بعمولة</Link>
        </div>

        <div className="footer__col">
          <h5>حسابي</h5>
          <Link to="/login">تسجيل الدخول</Link>
          <Link to="/register">إنشاء حساب</Link>
          <Link to="/account">طلباتي</Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} SOOLECT. جميع الحقوق محفوظة.</p>
        <p className="footer__made">Streetwear from Egypt</p>
      </div>
    </footer>
  );
}
