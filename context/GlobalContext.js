'use client'
import { createContext, useContext, useState } from 'react'

// 1. Create context
const GlobalContext = createContext()

// 2. Create a provider - this is brought into application layout.jsx
export function GlobalProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <GlobalContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

// 3. Create a custom hook to access context - this is brought into where we want to access context
export function useGlobalContext() {
  return useContext(GlobalContext)
}

// 4. Pass value prop to GlobalContext.Provider - to get value, and change value from state -- lines 13-15

// 5. Wrap application in GlobalProvider in layout.js

// 6. Go to UnreadMessageCount.jsx - and access useGlobalContext

// 7. destructure from value of the provider in UnreadMessageCount.jsx

// 8. " " for 'Mark As Read' button in Message.jsx component

// 9. " " for 'Delete' button in Message.jsx component
