export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* We don't need any special layout here as StoreHeader handles that */}
      {children}
    </div>
  )
} 