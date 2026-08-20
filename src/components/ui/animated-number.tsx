"use client"

import { useEffect, useRef } from "react"
import { useMotionValue, useSpring } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  className?: string
  precision?: number
  prefix?: string
  suffix?: string
}

function formatAnimatedNumber(
  value: number,
  precision: number,
  prefix: string,
  suffix: string,
): string {
  return `${prefix}${value.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })}${suffix}`
}

export function AnimatedNumber({
  value,
  className,
  precision = 0,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(value)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  })
  const previousValue = useRef(value)

  useEffect(() => {
    if (previousValue.current === value) return
    previousValue.current = value
    motionValue.set(value)
  }, [motionValue, value])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatAnimatedNumber(
          latest,
          precision,
          prefix,
          suffix,
        )
      }
    })
  }, [springValue, precision, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {formatAnimatedNumber(value, precision, prefix, suffix)}
    </span>
  )
}
