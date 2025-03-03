import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Branch Details',
  description: 'View branch details and menu',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 