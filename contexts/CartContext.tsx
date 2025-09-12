"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { CartItem, Event, TicketType } from "@/types/event"

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { event: Event; ticketType: TicketType; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { eventId: string; ticketTypeId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { eventId: string; ticketTypeId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

interface CartContextType extends CartState {
  addItem: (event: Event, ticketType: TicketType, quantity: number) => void
  removeItem: (eventId: string, ticketTypeId: string) => void
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { event, ticketType, quantity } = action.payload
      const existingItemIndex = state.items.findIndex(
        (item) => item.eventId === event.id && item.ticketTypeId === ticketType.id,
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity,
          event,
          ticketType,
        }
        newItems = [...state.items, newItem]
      }

      const total = newItems.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      const { eventId, ticketTypeId } = action.payload
      const newItems = state.items.filter((item) => !(item.eventId === eventId && item.ticketTypeId === ticketTypeId))

      const total = newItems.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const { eventId, ticketTypeId, quantity } = action.payload

      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { eventId, ticketTypeId } })
      }

      const newItems = state.items.map((item) =>
        item.eventId === eventId && item.ticketTypeId === ticketTypeId ? { ...item, quantity } : item,
      )

      const total = newItems.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      return { items, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("starEvents_cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("starEvents_cart", JSON.stringify(state.items))
  }, [state.items])

  const addItem = (event: Event, ticketType: TicketType, quantity: number) => {
    dispatch({ type: "ADD_ITEM", payload: { event, ticketType, quantity } })
  }

  const removeItem = (eventId: string, ticketTypeId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { eventId, ticketTypeId } })
  }

  const updateQuantity = (eventId: string, ticketTypeId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { eventId, ticketTypeId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
