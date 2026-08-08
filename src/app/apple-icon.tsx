import { ImageResponse } from "next/og";

// Same mark as icon.tsx, scaled up for iOS home-screen bookmarks (Apple
// requires an opaque background here, which this design already has).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#14161a",
      }}
    >
      <svg viewBox="0 0 32 32" width="128" height="128" fill="none">
        <path
          d="M4 26 L12 18 L20 20 L28 6"
          stroke="#fafaf7"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="26" r="2.8" fill="#fafaf7" />
        <circle cx="12" cy="18" r="2.8" fill="#fafaf7" />
        <circle cx="20" cy="20" r="2.8" fill="#fafaf7" />
        <circle cx="28" cy="6" r="3.6" fill="#fafaf7" />
      </svg>
    </div>,
    { ...size },
  );
}
