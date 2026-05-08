import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#051b35",
          borderRadius: 7,
          border: "2px solid rgba(255,184,28,0.75)",
        }}
      >
        <div
          style={{
            width: 19,
            height: 19,
            borderRadius: 5,
            border: "2px solid rgba(255,184,28,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffb81c",
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          PS
        </div>
      </div>
    ),
    { ...size }
  );
}
