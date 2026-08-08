import { ImageResponse } from "next/og";

// Same "trend line + points" mark used in the sidebar brand lockup
// (~/components/app-sidebar.tsx) and the landing page nav (~/app/page.tsx),
// just rasterized on its own solid tile since favicons can't rely on the
// page background for contrast.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#14161a",
        borderRadius: 7,
      }}
    >
      <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
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
