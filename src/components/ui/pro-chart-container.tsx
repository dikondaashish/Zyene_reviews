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
  return (
    <div className={cn("group relative rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-all hover:bg-card/50", className)}>
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* Injecting the gradient into the child components via cloning if needed, 
              but usually children (AreaCharts) define their own defs. 
              We'll just ensure the responsive container is set up correctly. */}
          <>{children}</>
        </ResponsiveContainer>
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
      backgroundColor: "oklch(var(--card))",
      border: "1px solid oklch(var(--border) / 0.1)",
      borderRadius: "12px",
      fontSize: "12px",
      boxShadow: "var(--pro-shadow)",
      backdropFilter: "var(--pro-glass)",
      padding: "12px",
    },
    itemStyle: {
      color: "oklch(var(--foreground))",
      fontWeight: 600,
    },
    labelStyle: {
      color: "oklch(var(--muted-foreground))",
      marginBottom: "4px",
    },
  },
  grid: {
    stroke: "oklch(var(--border) / 0.05)",
    strokeDasharray: "4 4",
  },
  xAxis: {
    tick: { fill: "oklch(var(--muted-foreground))", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  },
  yAxis: {
    tick: { fill: "oklch(var(--muted-foreground))", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  },
}
