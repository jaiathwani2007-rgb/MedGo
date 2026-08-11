'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
  id: string
  name: string
  generic_name: string | null
  brand_name: string | null
  price: number
  stock: number
  requires_prescription: boolean
  is_otc_whitelisted: boolean
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (med: any) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  prescriptionPath: string | null
  setPrescriptionPath: (path: string | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [prescriptionPath, setPrescriptionPath] = useState<string | null>(null)
  
  useEffect(() => {
    const saved = localStorage.getItem('medgo_cart')
    if (saved) setItems(JSON.parse(saved))
    const savedRx = localStorage.getItem('medgo_rx')
    if (savedRx) setPrescriptionPath(savedRx)
  }, [])

  useEffect(() => {
    localStorage.setItem('medgo_cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (prescriptionPath) localStorage.setItem('medgo_rx', prescriptionPath)
    else localStorage.removeItem('medgo_rx')
  }, [prescriptionPath])

  const addItem = (med: any) => {
    setItems(curr => {
      const existing = curr.find(i => i.id === med.id)
      if (existing) {
        return curr.map(i => i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...curr, { ...med, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => setItems(curr => curr.filter(i => i.id !== id))
  
  const updateQuantity = (id: string, delta: number) => {
    setItems(curr => curr.map(i => {
      if (i.id === id) {
        const newQ = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQ }
      }
      return i
    }))
  }

  const clearCart = () => {
    setItems([])
    setPrescriptionPath(null)
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      totalItems, subtotal, prescriptionPath, setPrescriptionPath 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
