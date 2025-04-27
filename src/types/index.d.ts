export interface Order {
  type: OrderResourceType
  id: string
  attributes: {
    createdAt: string // ISO date string
    orderNumber: string
    status: OrderStatus
    quantities: {
      productId: string
      count: number
    }[]
    totalPrice: string; // e.g. "34,82" 
  }
  relationships: {
    products: {
      data: {
        type: 'Product'
        id: string
      }[];
    }
    supplier: {
      data: {
        type: 'Company'
        id: string
      }
    }
    customer: {
      data: {
        type: 'Company'
        id: string
      }
    }
  }
}

export type OrderStatus = 'processing' | 'pending' | 'shipped' | 'delivered'

export type OrderType = 'orderBeingCreated' | 'orderBeingEdited'

export type OrderResourceType = 'Order'

export type ProductsTransformedForEdit = {
  id: string
  count: number
  name: string
  price: number
}
  
export interface OrderTransformedForEdit {
  id: string
  createdAt: string // ISO date string
  orderNumber: string
  status: OrderStatus
  products: ProductsTransformedForEdit[]
  supplierId: string
  totalPrice: string // e.g. "34,82" 
}

export interface OrderDraft {
  products: ProductsTransformedForEdit[]
  supplierId: string
  totalPrice: string // e.g. "34,82" 
}

export type ProductResourceType = 'Product'

export type CompanyResourceType = 'Company'