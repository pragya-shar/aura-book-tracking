
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Bookmark } from "lucide-react"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-yellow-500" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="relative block h-6 w-5 bg-transparent border-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
      <Bookmark className="h-6 w-5 fill-yellow-500 text-yellow-500 hover:fill-yellow-400 hover:text-yellow-400 transition-colors" />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
