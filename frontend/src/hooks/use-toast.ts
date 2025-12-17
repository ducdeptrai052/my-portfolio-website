import { useEffect, useState } from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

export type ToastType = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts: ToastType[] = []
const listeners: Array<(toasts: ToastType[]) => void> = []

function addToast(toast: Omit<ToastType, "id">) {
  const id = genId()
  const newToast = { ...toast, id }
  toasts.push(newToast)
  
  if (toasts.length > TOAST_LIMIT) {
    toasts.shift()
  }
  
  listeners.forEach((listener) => listener([...toasts]))
  
  setTimeout(() => {
    removeToast(id)
  }, TOAST_REMOVE_DELAY)
  
  return id
}

function removeToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    listeners.forEach((listener) => listener([...toasts]))
  }
}

export function useToast() {
  const [state, setState] = useState<ToastType[]>([])

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts: state,
    toast: addToast,
    dismiss: removeToast,
  }
}

export const toast = addToast
