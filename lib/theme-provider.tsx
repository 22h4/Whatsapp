"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideIn = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider {...props}>
      <AnimatePresence mode="wait">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={`theme-child-${index}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </NextThemesProvider>
  )
}

// Animation variants
export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
}

// Gradient backgrounds
export const gradients = {
  light: {
    primary: "bg-gradient-to-br from-blue-50 to-indigo-50",
    secondary: "bg-gradient-to-br from-purple-50 to-pink-50",
    accent: "bg-gradient-to-br from-cyan-50 to-blue-50"
  },
  dark: {
    primary: "bg-gradient-to-br from-gray-900 to-slate-900",
    secondary: "bg-gradient-to-br from-purple-900 to-indigo-900",
    accent: "bg-gradient-to-br from-cyan-900 to-blue-900"
  }
}

// Glow effects
export const glows = {
  light: {
    primary: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    secondary: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
    accent: "shadow-[0_0_15px_rgba(6,182,212,0.5)]"
  },
  dark: {
    primary: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    secondary: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    accent: "shadow-[0_0_15px_rgba(6,182,212,0.3)]"
  }
} 