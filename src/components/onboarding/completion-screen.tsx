"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface CompletionScreenProps {
  firstName: string;
  email: string;
  googleConnected: boolean;
  requestSent: boolean;
  onComplete: () => void;
}

export function OnboardingCompletionScreen({
  firstName,
  email,
  googleConnected,
  requestSent,
  onComplete,
}: CompletionScreenProps) {
  const [showButton, setShowButton] = useState(false);
  const [autoRedirectStarted, setAutoRedirectStarted] = useState(false);

  // Auto-redirect after 3 seconds or when user clicks
  useEffect(() => {
    if (!autoRedirectStarted) {
      const timer = setTimeout(() => {
        setAutoRedirectStarted(true);
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [autoRedirectStarted, onComplete]);

  // Show button after all checkmarks animate in
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500); // 3 checkmarks * 300ms + 600ms buffer

    return () => clearTimeout(timer);
  }, []);

  const statusItems = [
    {
      label: "Business profile created",
      condition: true,
    },
    {
      label: "Notifications configured",
      condition: true,
    },
    {
      label: "Google Business Profile syncing — reviews appear within 1–2 hours",
      condition: googleConnected,
    },
    {
      label: "First review request delivered",
      condition: requestSent,
    },
  ].filter((item) => item.condition);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
          className="flex justify-center"
        >
          <div className="relative w-24 h-24">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Circle background */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="#ECFDF5"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />

              {/* Checkmark */}
              <motion.path
                d="M 30 50 L 45 65 L 70 35"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            You're all set, {firstName}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your Zyene Reviews dashboard is ready.
          </p>
        </motion.div>

        {/* Status List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-3"
        >
          {statusItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.6 + index * 0.3,
                ease: "easeOut",
              }}
              className="flex items-start gap-3 text-left bg-green-50 p-3 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.7 + index * 0.3,
                  type: "spring",
                  stiffness: 150,
                }}
              >
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              </motion.div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Tip Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> You'll get an email confirmation at{" "}
            <span className="font-medium">{email}</span> when your first review
            syncs.
          </p>
        </motion.div>

        {/* Button */}
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              onClick={() => {
                setAutoRedirectStarted(true);
                onComplete();
              }}
              className="w-full bg-black hover:bg-gray-800 text-white"
              size="lg"
            >
              Go to Dashboard →
            </Button>
          </motion.div>
        )}

        {/* Skip text for auto-redirect */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.4, delay: 1.5 }}
          className="text-xs text-gray-500"
        >
          Redirecting automatically in a moment...
        </motion.p>
      </motion.div>
    </div>
  );
}
