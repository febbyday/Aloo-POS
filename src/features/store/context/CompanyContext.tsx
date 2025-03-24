import { createContext, useContext, ReactNode } from 'react'
import { CompanyInfo } from '@/types/common'

interface CompanyContextType {
  companyInfo: CompanyInfo
  currentUser: {
    name: string
    role: string
  }
}

const defaultCompanyInfo: CompanyInfo = {
  name: "Your Company Name",
  address: "123 Business Street, City, Country",
  phone: "+1 234 567 890",
  email: "contact@company.com"
}

const CompanyContext = createContext<CompanyContextType>({
  companyInfo: defaultCompanyInfo,
  currentUser: {
    name: "John Doe",
    role: "Administrator"
  }
})

export function CompanyProvider({ children }: { children: ReactNode }) {
  // In a real app, this would fetch from your backend
  const value = {
    companyInfo: defaultCompanyInfo,
    currentUser: {
      name: "John Doe",
      role: "Administrator"
    }
  }

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => useContext(CompanyContext)
