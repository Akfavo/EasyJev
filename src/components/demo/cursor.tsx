interface DemoCursorProps {
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  isClicking?: boolean;
  visible?: boolean;
}

export function DemoCursor({ x, y, isClicking = false, visible = true }: DemoCursorProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none z-30 transition-transform duration-75"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-2px, -2px) scale(${isClicking ? 0.88 : 1})`,
      }}
      aria-hidden="true"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
      >
        <path
          d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z"
          fill="#181419"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {isClicking && (
        <span
          className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-brand-500 animate-ping opacity-75"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
