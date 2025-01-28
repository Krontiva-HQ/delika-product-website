import { ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"

interface SliderCardProps {
  title: string
  description: string
  image: string
  currentSlide: number
  totalSlides: number
  onNext: () => void
  onPrev: () => void
}

export function SliderCard({ title, description, image, currentSlide, totalSlides, onNext, onPrev }: SliderCardProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute right-4 bottom-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 w-full max-w-md">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="text-xs font-medium text-white/70">JOURNAL</div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-white/80 text-xs leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onPrev}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Previous slide"
            >
              <ArrowUp className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={onNext}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Next slide"
            >
              <ArrowDown className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-3 justify-center">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className={`h-1 w-1 rounded-full ${i === currentSlide ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

