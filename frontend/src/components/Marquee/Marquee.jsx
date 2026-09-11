const DEFAULT_ITEMS = [
  "SOOLECT",
  "أسلوبك. هويتك.",
  "شحن لكل محافظات مصر",
  "STREETWEAR EGYPT",
  "جودة تصنع الفرق",
];

export default function Marquee({ items = DEFAULT_ITEMS }) {
  const loop = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {loop.map((item, i) => (
          <span className="marquee__item" key={i}>
            {item}
            <span className="marquee__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
