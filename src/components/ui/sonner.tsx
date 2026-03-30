"use client"

import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#fdfaf5] group-[.toaster]:text-amber-950 group-[.toaster]:border-amber-900/10 group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-amber-900/60 text-[10px] font-medium leading-relaxed",
          actionButton: "group-[.toast]:bg-amber-600 group-[.toast]:text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl",
          cancelButton: "group-[.toast]:bg-amber-900/5 group-[.toast]:text-amber-900/40 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl",
          title: "text-[11px] font-black uppercase tracking-[0.1em] text-amber-900/90",
          closeButton: "group-[.toast]:bg-amber-900/5 group-[.toast]:text-amber-900/40 group-[.toast]:hover:bg-amber-900/10 transition-all",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
