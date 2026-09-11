// Minimal line-art garment icons used to represent products visually
// without relying on external photography. Swap these for real product
// photography later by editing ProductImage.jsx.

export function TeeIcon(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <path
        d="M70 30 L40 50 L25 78 L45 92 L58 82 L58 175 L142 175 L142 82 L155 92 L175 78 L160 50 L130 30 C130 30 122 44 100 44 C78 44 70 30 70 30 Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HoodieIcon(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <path
        d="M100 24 C76 24 62 40 60 54 L34 62 L20 96 L42 106 L52 92 L52 178 L88 178 L88 150 L112 150 L112 178 L148 178 L148 92 L158 106 L180 96 L166 62 L140 54 C138 40 124 24 100 24 Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M82 56 C82 68 90 76 100 76 C110 76 118 68 118 56" stroke="currentColor" strokeWidth="4.5" />
      <circle cx="100" cy="118" r="5" fill="currentColor" />
    </svg>
  );
}

export function PantsIcon(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <path
        d="M56 26 L144 26 L150 100 L166 176 L134 176 L112 100 L108 176 L76 176 L64 100 L48 176 L18 176 L34 100 Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M56 26 L60 60 L140 60 L144 26" stroke="currentColor" strokeWidth="4.5" />
      <rect x="60" y="82" width="20" height="26" rx="3" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}

export function CapIcon(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" {...props}>
      <path
        d="M40 108 C40 74 66 50 100 50 C134 50 160 74 160 108"
        stroke="currentColor"
        strokeWidth="4.5"
      />
      <path d="M34 108 L166 108 C166 122 154 128 140 128 L60 128 C46 128 34 122 34 108 Z" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M140 122 C158 122 178 118 184 106" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="100" cy="52" r="5" fill="currentColor" />
    </svg>
  );
}

export const ICONS_BY_CATEGORY = {
  tshirts: TeeIcon,
  hoodies: HoodieIcon,
  pants: PantsIcon,
  accessories: CapIcon,
};
