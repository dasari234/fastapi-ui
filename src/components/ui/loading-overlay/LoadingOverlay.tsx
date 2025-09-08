import React, { ReactNode, CSSProperties } from "react";

type LoadingOverlayProps = {
  visible: boolean;
  overlayColor?: string;
  zIndex?: number;
  blur?: number;
  loader?: ReactNode;
  transitionDuration?: number;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  overlayColor = "rgba(255, 255, 255, 0.6)",
  zIndex = 1000,
  blur = 2,
  loader,
  transitionDuration = 200,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: overlayColor,
    backdropFilter: `blur(${blur}px)`,
    zIndex,
    display: visible ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    transition: `opacity ${transitionDuration}ms ease`,
  };

  return (
    <div style={style}>
      {loader ?? (
        <div
          style={{
            width: 32,
            height: 32,
            border: "4px solid #228be6",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// import { LoadingOverlay } from "./LoadingOverlay";

// function DataTable({ loading }) {
//   return (
//     <div style={{ position: "relative", minHeight: 200 }}>
//       <table>{/* table rows */}</table>
//       <LoadingOverlay visible={loading} />
//     </div>
//   );
// }

// Custom color:
// <LoadingOverlay visible={true} overlayColor="rgba(0, 0, 0, 0.3)" />

// Custom loader:
// <LoadingOverlay
//   visible={true}
//   loader={<YourCustomSpinner />}
// />

// With blur & z-index:
// <LoadingOverlay visible={true} />
