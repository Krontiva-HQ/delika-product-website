import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "default" | "orange" | "white"
  text?: string
  fullScreen?: boolean
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4"
}

const colorClasses = {
  default: "border-gray-500 border-t-transparent",
  orange: "border-orange-500 border-t-transparent",
  white: "border-white border-t-transparent"
}

export function LoadingSpinner({
  size = "md",
  color = "default",
  text,
  fullScreen = false,
  className
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn(
      "flex flex-col items-center gap-4",
      className
    )}>
      <div className={cn(
        "rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color]
      )} />
      {text && (
        <p className={cn(
          "font-medium",
          color === "white" ? "text-white" : "text-gray-600"
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
} 