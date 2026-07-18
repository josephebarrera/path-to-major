export function AlignmentRing({
  score,
  size = 56,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${score}% aligned`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-border/70"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-[stroke-dashoffset] duration-700 ease-out ${
            score >= 80
              ? "stroke-emerald-500 dark:stroke-emerald-400"
              : score >= 55
                ? "stroke-amber-500 dark:stroke-amber-400"
                : "stroke-rose-500 dark:stroke-rose-400"
          }`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-semibold">
        {score}%
      </div>
    </div>
  );
}
