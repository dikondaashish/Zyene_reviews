"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  LucideIcon, 
  MessageSquare, 
  Star, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  Link2, 
  ListChecks, 
  BedDouble 
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
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm cursor-pointer",
        "pro-hover", // Added official UI Pro hover utility
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            isPositive ? "bg-green-500/10 text-green-600" : 
            isNegative ? "bg-red-500/10 text-red-600" : 
            "bg-muted text-muted-foreground"
          )}>
            <span className="flex items-center">
              {isPositive ? "+" : ""}{trend}%
            </span>
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            className="text-3xl font-bold tracking-tight text-foreground"
          />
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {description}
            {trendLabel && <span className="ml-1 opacity-70 italic">{trendLabel}</span>}
          </p>
        )}
      </div>
      
      {/* Decorative border beam */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}
