"use client"

import React from "react"
import { ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface ProChartContainerProps {
  children: React.ReactNode
  height?: number | string
  className?: string
  title?: string
  description?: string
  gradientId?: string
  gradientColors?: {
    start: string
    end: string
  }
}

export function ProChartContainer({
  children,
  height = 300,
  className,
  title,
  description,
  gradientId = "proGradient",
  gradientColors = {
    start: "var(--primary)",
    end: "transparent",
  },
}: ProChartContainerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      setReady(rect.width > 0 && rect.height > 0)
    }

    measure()
    if (typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => measure())
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={cn("group relative rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-all hover:bg-card/50", className)}>
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <div ref={containerRef} style={{ height }} className="w-full min-h-[1px]">
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            {/* Injecting the gradient into the child components via cloning if needed,
                but usually children (AreaCharts) define their own defs.
                We'll just ensure the responsive container is set up correctly. */}
            <>{children}</>
          </ResponsiveContainer>
        ) : null}
      </div>

      {/* Reusable SVG Definitions for Gradients */}
      <svg className="absolute h-0 w-0">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.3} />
            <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export const chartConfig = {
  tooltip: {
    contentStyle: {
      backgroundColor: "var(--card)",
      border: "1px solid color-mix(in oklab, var(--border) 65%, transparent)",
      borderRadius: "12px",
      fontSize: "12px",
      boxShadow: "var(--pro-shadow)",
      backdropFilter: "var(--pro-glass)",
      padding: "12px",
    },
    itemStyle: {
      color: "var(--foreground)",
      fontWeight: 600,
    },
    labelStyle: {
      color: "var(--muted-foreground)",
      marginBottom: "4px",
    },
  },
  grid: {
    stroke: "color-mix(in oklab, var(--border) 45%, transparent)",
    strokeDasharray: "4 4",
  },
  xAxis: {
    tick: { fill: "var(--muted-foreground)", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  },
  yAxis: {
    tick: { fill: "var(--muted-foreground)", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  },
}
