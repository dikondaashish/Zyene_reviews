"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  className?: string
  precision?: number
  prefix?: string
  suffix?: string
}

export function AnimatedNumber({
  value,
  className,
  precision = 0,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, value, isInView])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString(undefined, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })}${suffix}`
      }
    })
  }, [springValue, precision, prefix, suffix])

  return (
    <span
      ref={ref}
      className={className}
    >
      {prefix}0{suffix}
    </span>
  )
}
