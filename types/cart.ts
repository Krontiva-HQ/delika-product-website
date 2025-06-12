export interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
  available: boolean
  selectedExtras?: Array<{
    id: string
    name: string
    price: string
    quantity: number
  }>
} 