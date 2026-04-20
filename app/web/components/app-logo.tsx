import { cn } from "@/lib/utils"

export function AppLogo({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <svg
        viewBox="0 0 96 96"
        className={cn(compact ? "h-10 w-10" : "h-18 w-18")}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M28 25C33 18 41 14 49 14C62 14 73 24 75 37"
          stroke="#2FB1C2"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M72 27L78 37L89 31"
          stroke="#2FB1C2"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M68 71C63 78 55 82 47 82C34 82 23 72 21 59"
          stroke="#FF8B2C"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M24 69L18 59L7 65"
          stroke="#FF8B2C"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="text-5xl font-semibold tracking-tight text-[#121a2b]">
          Trocai
        </span>
      )}
    </div>
  )
}
