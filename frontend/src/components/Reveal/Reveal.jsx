import { useReveal } from "../../hooks/useReveal";

/**
 * <Reveal delay={0.1}>...</Reveal>
 * Fades + slides children up once they enter the viewport.
 */
export default function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}
