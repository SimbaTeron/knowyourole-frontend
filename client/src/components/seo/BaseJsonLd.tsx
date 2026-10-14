import { baseJsonLd } from "@/lib/seo";

export function BaseJsonLd() {
  return (
    <script
      id="kyr-base-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(baseJsonLd()).replace(/</g, "\\u003c"),
      }}
    />
  );
}
