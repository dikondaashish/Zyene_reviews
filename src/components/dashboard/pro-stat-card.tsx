"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  MessageSquare, 
  Star, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  Link2, 
  ListChecks, 
  BedDouble,
  TrendingDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ui/animated-number"

interface ProStatCardProps {
  title: string
  value: number
  iconName: "reviews" | "rating" | "response" | "pending" | "qa" | "links" | "completeness" | "lodging" | "alert"
  description?: string
  trend?: number
  trendLabel?: string
  prefix?: string
  suffix?: string
  precision?: number
  className?: string
  delay?: number
}

const ICON_MAP = {
  reviews: MessageSquare,
  rating: Star,
  response: BarChart3,
  pending: Clock,
  qa: HelpCircle,
  links: Link2,
  completeness: ListChecks,
  lodging: BedDouble,
  alert: AlertTriangle,
}

/** Fractional star (0–1 fill) for ratings like 4.7 */
function RatingStarSlot({ fill }: { fill: number }) {
  const f = Math.max(0, Math.min(1, fill))
  return (
    <span className="relative inline-block h-4 w-4 shrink-0">
      <Star
        className="pointer-events-none absolute inset-0 h-4 w-4 fill-muted text-muted-foreground/45"
        aria-hidden
      />
      <span
        className="absolute left-0 top-0 h-full overflow-hidden"
        style={{ width: `${f * 100}%` }}
      >
        <Star className="pointer-events-none h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" aria-hidden />
      </span>
    </span>
  )
}

function TrendUpGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      className="inline h-4 w-4 ml-1"
      aria-hidden="true"
    >
      <path
        d="M16.5 5L9.5 12.56L6.83333 8.24L1.5 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 5H16.5V8.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProStatCard({
  title,
  value,
  iconName,
  description,
  trend,
  trendLabel,
  prefix = "",
  suffix = "",
  precision = 0,
  className,
  delay = 0,
}: ProStatCardProps) {
  const Icon = ICON_MAP[iconName] || MessageSquare
  const hasTrend = typeof trend === "number"
  const isPositive = hasTrend && trend > 0
  const isNegative = hasTrend && trend < 0
  const showRatingStars = iconName === "rating" && Number.isFinite(value) && value > 0
  const ratingClamped = showRatingStars ? Math.max(0, Math.min(5, value)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 md:p-6 min-h-[180px]",
        "transition-all duration-200 hover:border-primary/30 hover:shadow-sm",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        {hasTrend && (
          <div className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isPositive ? "bg-green-500/10 text-green-600" : 
            isNegative ? "bg-red-500/10 text-red-600" : 
            "bg-muted text-muted-foreground"
          )}>
            <span className="flex items-center">
              {isPositive ? "+" : ""}{trend}%
              {isPositive ? (
                <TrendUpGlyph />
              ) : isNegative ? (
                <TrendingDown className="ml-1 h-4 w-4" />
              ) : null}
            </span>
          </div>
        )}
      </div>

      <div className="relative mt-4 space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-1">
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            className="text-4xl font-bold tracking-tight text-foreground"
          />
          {showRatingStars && (
            <div
              className="ml-2 flex items-center gap-0.5 pb-1"
              aria-label={`${ratingClamped.toFixed(1)} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((i) => {
                const fill = Math.min(1, Math.max(0, ratingClamped - (i - 1)))
                return <RatingStarSlot key={i} fill={fill} />
              })}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 min-h-8">
            {description}
            {trendLabel && <span className="ml-1 opacity-80">{trendLabel}</span>}
          </p>
        )}
      </div>
      
      {/* Decorative border beam */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}
