interface LogoProps {
  height?: number;
}

/**
 * Stylized wordmark representations of third-party store brands.
 * These are not exact reproductions of the official trademarked logos —
 * they're descriptive identifiers using the brand's name + signature color
 * for fair nominative use in a price-comparison context.
 */

export function AmazonLogo({ height = 16 }: LogoProps) {
  return (
    <svg
      height={height}
      viewBox="0 0 92 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <text
        x="0"
        y="19"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="20"
        fontWeight="900"
        fill="#232F3E"
        letterSpacing="-1.4"
      >
        amazon
      </text>
      <path
        d="M 5 22 Q 44 32 84 22"
        stroke="#FF9900"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <polygon points="79,20 89,22 79,27" fill="#FF9900" />
    </svg>
  );
}

export function FlipkartLogo({ height = 16 }: LogoProps) {
  return (
    <svg
      height={height}
      viewBox="0 0 78 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <text
        x="0"
        y="19"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="20"
        fontWeight="800"
        fill="#2874F0"
        letterSpacing="-0.6"
      >
        Flipkart
      </text>
      <path
        d="M 67 4 L 68.5 7 L 71.5 7.5 L 69.3 9.6 L 69.9 12.6 L 67 11.2 L 64.1 12.6 L 64.7 9.6 L 62.5 7.5 L 65.5 7 Z"
        fill="#FFC200"
      />
    </svg>
  );
}

export function getBrandLogo(source: string) {
  const key = source.toLowerCase().trim();
  if (key === "amazon") return AmazonLogo;
  if (key === "flipkart") return FlipkartLogo;
  return null;
}
