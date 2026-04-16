"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { cva } from "class-variance-authority"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const MAX_STACK = 5

export interface SpotlightReview {
  id: number | string
  name: string
  avatar: string
  text: string
  rating: number
  reviewedAt?: string | null
  platform?: string | null
  sentiment?: string | null
}

type ThemeColor = "default" | "primary" | "elegant" | "vibrant" | "minimal"

export interface SpotlightLabels {
  hint: string
  prev: string
  next: string
  viewInReviews: string
}

interface AnimatedReviewCardsProps {
  reviews?: SpotlightReview[]
  interactionType?: "drag" | "click"
  animationDuration?: number
  scaleStep?: number
  verticalSpacing?: number
  horizontalSpacing?: number
  autoRotate?: boolean
  rotateInterval?: number
  theme?: ThemeColor
  showBorderBeam?: boolean
  labels?: SpotlightLabels
  classNames?: {
    container?: string
    card?: string
    cardContent?: string
    header?: string
    avatar?: string
    name?: string
    text?: string
    rating?: string
    star?: string
    activeStarColor?: string
    inactiveStarColor?: string
  }
}

const cardVariants = cva(
  "absolute overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:max-w-none",
  {
    variants: {
      theme: {
        default: "border-border bg-background",
        primary: "bg-primary/5 border border-primary/20",
        elegant:
          "border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
        vibrant:
          "border border-fuchsia-400 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white dark:border-fuchsia-700 dark:from-fuchsia-600 dark:to-pink-600",
        minimal: "border border-border bg-muted text-foreground dark:border-border dark:bg-muted dark:text-foreground",
      },
      cursor: {
        drag: "cursor-grab active:cursor-grabbing",
        click: "cursor-pointer",
      },
    },
  }
)

const nameVariants = cva("text-base font-semibold leading-tight", {
  variants: {
    theme: {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      elegant: "text-zinc-900 dark:text-zinc-100",
      vibrant: "text-white",
      minimal: "text-foreground dark:text-foreground",
    },
  },
})

const textVariants = cva("text-start text-sm leading-relaxed text-foreground/90", {
  variants: {
    theme: {
      default: "",
      primary: "text-primary/90",
      elegant: "text-zinc-600 dark:text-zinc-300",
      vibrant: "text-white/95",
      minimal: "text-muted-foreground dark:text-muted-foreground",
    },
  },
})

const starColorVariants = {
  default: {
    active: "text-yellow-400 fill-current",
    inactive: "text-muted stroke-muted-foreground/20",
  },
  primary: {
    active: "text-primary",
    inactive: "text-primary/20",
  },
  elegant: {
    active: "text-zinc-700 dark:text-zinc-300 fill-current",
    inactive: "text-zinc-300 dark:text-zinc-600",
  },
  vibrant: {
    active: "text-white fill-current",
    inactive: "text-white/40",
  },
  minimal: {
    active: "text-foreground dark:text-foreground fill-current",
    inactive: "text-muted-foreground/40 dark:text-muted-foreground/60",
  },
}

function PlatformBadge({ platform, theme }: { platform: string; theme: ThemeColor }) {
  const p = platform.toLowerCase()
  const label =
    p === "google" ? "Google" : p === "yelp" ? "Yelp" : p === "facebook" ? "Facebook" : p === "zyene" ? "Zyene" : platform
  const subtle =
    theme === "vibrant"
      ? "border-white/30 bg-white/10 text-white"
      : "border-border/60 bg-muted/50 text-muted-foreground"
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium px-1.5 py-0 h-5", subtle)}>
      {label}
    </Badge>
  )
}

function SentimentPill({ sentiment, theme }: { sentiment: string; theme: ThemeColor }) {
  const s = sentiment.toLowerCase()
  const colors =
    s === "positive"
      ? theme === "vibrant"
        ? "bg-emerald-500/30 text-emerald-50"
        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : s === "negative"
        ? theme === "vibrant"
          ? "bg-red-500/30 text-red-50"
          : "bg-red-500/15 text-red-700 dark:text-red-400"
        : s === "mixed"
          ? theme === "vibrant"
            ? "bg-amber-500/30 text-amber-50"
            : "bg-amber-500/15 text-amber-800 dark:text-amber-400"
          : theme === "vibrant"
            ? "bg-white/20 text-white"
            : "bg-muted text-muted-foreground"
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", colors)}>
      {sentiment}
    </span>
  )
}

export const AnimatedReviewCards = ({
  reviews: initialReviewsProp = [],
  interactionType = "drag",
  animationDuration = 0.3,
  scaleStep = 0.05,
  verticalSpacing = 10,
  horizontalSpacing = 20,
  autoRotate = true,
  rotateInterval = 8000,
  theme = "default",
  classNames,
  labels,
}: AnimatedReviewCardsProps) => {
  const reduceMotion = useReducedMotion()
  const effectiveDuration = reduceMotion ? 0 : animationDuration
  const effectiveAutoRotate = autoRotate && !reduceMotion

  const starColors = starColorVariants[theme]
  const [reviews, setReviews] = useState<SpotlightReview[]>(() =>
    initialReviewsProp.slice(0, MAX_STACK)
  )
  const [isInteracting, setIsInteracting] = useState(false)
  const [hoverPause, setHoverPause] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)

  const stableOrderRef = useRef<string[]>([])

  useEffect(() => {
    const next = initialReviewsProp.slice(0, MAX_STACK)
    setReviews(next)
    const ids = next.map((r) => String(r.id))
    if (ids.join("|") !== stableOrderRef.current.join("|")) {
      stableOrderRef.current = ids
    }
  }, [initialReviewsProp])

  const pauseRotation = hoverPause || focusWithin || isInteracting

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return

    const mql = window.matchMedia("(max-width: 640px)")
    const update = () => setIsMobile(mql.matches)

    update()
    mql.addEventListener?.("change", update)
    return () => {
      mql.removeEventListener?.("change", update)
    }
  }, [])

  const rotateForward = useCallback(() => {
    setReviews((prev) => {
      if (prev.length < 2) return prev
      const next = [...prev]
      const [first] = next.splice(0, 1)
      next.push(first)
      return next
    })
  }, [])

  const rotateBackward = useCallback(() => {
    setReviews((prev) => {
      if (prev.length < 2) return prev
      const next = [...prev]
      const last = next.pop()!
      next.unshift(last)
      return next
    })
  }, [])

  const handleInteraction = (index: number) => {
    setReviews((prevReviews) => {
      if (index < 0 || index >= prevReviews.length) return prevReviews
      const newReviews = [...prevReviews]
      const [removed] = newReviews.splice(index, 1)
      newReviews.push(removed)
      return newReviews
    })
  }

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (effectiveAutoRotate && !pauseRotation && reviews.length > 1) {
      intervalId = setInterval(() => {
        rotateForward()
      }, rotateInterval)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [effectiveAutoRotate, rotateInterval, pauseRotation, reviews.length, rotateForward])

  const activeDotIndex =
    reviews[0] && stableOrderRef.current.length > 0
      ? stableOrderRef.current.findIndex((id) => id === String(reviews[0].id))
      : 0

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      rotateForward()
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      rotateBackward()
    }
  }

  return (
    <div
      className={cn(
        "not-prose relative flex w-full flex-col items-center",
        classNames?.container
      )}
    >
      <div
        className="relative flex h-[400px] w-full items-center justify-center md:h-[350px]"
        onMouseEnter={() => setHoverPause(true)}
        onMouseLeave={() => setHoverPause(false)}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={() => setFocusWithin(false)}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Review spotlight"
        aria-live="polite"
      >
        <AnimatePresence>
          {reviews.map((review, index) => (
            <motion.div
              key={String(review.id)}
              initial={reduceMotion ? false : { scale: 0.88, y: 80, opacity: 0 }}
              animate={{
                scale: 1 + index * scaleStep,
                y: index * -verticalSpacing,
                x: !isMobile ? index * horizontalSpacing * (index % 2 === 0 ? 1 : -1) : 0,
                opacity: 1 - index * 0.18,
                zIndex: reviews.length - index,
              }}
              exit={reduceMotion ? undefined : { scale: 0.88, y: 80, opacity: 0 }}
              transition={{ duration: effectiveDuration }}
              drag={interactionType === "drag" && !reduceMotion ? "y" : false}
              dragConstraints={interactionType === "drag" && !reduceMotion ? { top: 0, bottom: 0 } : undefined}
              onDragStart={() => setIsInteracting(true)}
              onDragEnd={() => {
                setIsInteracting(false)
                if (interactionType === "drag") handleInteraction(index)
              }}
              onClick={() => {
                if (interactionType === "click") {
                  setIsInteracting(true)
                  handleInteraction(index)
                  setTimeout(() => setIsInteracting(false), 300)
                }
              }}
              title={interactionType === "drag" ? "Drag to see the next review" : "Click for next review"}
              className={cn(
                cardVariants({
                  theme,
                  cursor: interactionType,
                  className: classNames?.card,
                }),
                "h-[min(300px,70vh)] w-[calc(100vw-2rem)] max-w-[300px] sm:w-[350px] sm:max-w-none md:h-[250px] md:w-[min(100%,550px)]"
              )}
            >
              <div
                className={cn(
                  "flex h-full min-h-0 flex-col p-5 md:p-6",
                  classNames?.cardContent
                )}
              >
                <div className={cn("mb-3 flex min-h-0 items-start gap-3", classNames?.header)}>
                  <Avatar className={cn("h-10 w-10 shrink-0", classNames?.avatar)}>
                    {review?.avatar ? (
                      <AvatarImage
                        src={review.avatar}
                        alt={review.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <AvatarFallback>{review?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={nameVariants({ theme, className: cn("truncate", classNames?.name) })}>
                        {review?.name}
                      </h2>
                      {index === 0 && review.sentiment ? (
                        <SentimentPill sentiment={review.sentiment} theme={theme} />
                      ) : null}
                    </div>
                    {index === 0 && (review.reviewedAt || review.platform) ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {review.reviewedAt ? (
                          <time dateTime={review.reviewedAt}>
                            {formatDistanceToNow(new Date(review.reviewedAt), { addSuffix: true })}
                          </time>
                        ) : null}
                        {review.platform ? (
                          <PlatformBadge platform={review.platform} theme={theme} />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <p
                  className={cn(
                    "min-h-0 flex-1 overflow-hidden text-sm leading-relaxed",
                    index === 0 ? "line-clamp-6" : "line-clamp-3",
                    textVariants({ theme, className: classNames?.text })
                  )}
                >
                  {review?.text}
                </p>

                <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-border/40 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={cn("flex items-center gap-0.5", classNames?.rating)}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4 md:h-5 md:w-5",
                            i < (review?.rating ?? 0)
                              ? classNames?.activeStarColor || starColors.active
                              : classNames?.inactiveStarColor || starColors.inactive,
                            classNames?.star
                          )}
                        />
                      ))}
                    </div>
                    {index === 0 && labels ? (
                      <Link
                        href="/reviews"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {labels.viewInReviews}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reviews.length > 1 && labels ? (
        <div className="mt-4 flex w-full max-w-md flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              aria-label={labels.prev}
              onClick={() => rotateBackward()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1.5 px-2" role="tablist" aria-label="Review position">
              {stableOrderRef.current.map((id, i) => (
                <span
                  key={id}
                  role="presentation"
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === activeDotIndex ? "bg-primary" : "bg-muted-foreground/25"
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              aria-label={labels.next}
              onClick={() => rotateForward()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground max-w-md px-2">{labels.hint}</p>
        </div>
      ) : labels ? (
        <p className="mt-3 text-center text-xs text-muted-foreground max-w-md px-2">{labels.hint}</p>
      ) : null}
    </div>
  )
}
