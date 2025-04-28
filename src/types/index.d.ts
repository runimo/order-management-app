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
    totalPrice: string // e.g. "34,82"
  }
  relationships: {
    products: {
      data: ProductRelationship[]
    }
    supplier: {
      data: CompanyRelationship
    }
    customer: {
      data: CompanyRelationship
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

type ProductRelationship = {
  id: string
  type: ProductResourceType
}

type OrderRelationship = {
  id: string
  type: OrderResourceType
}

type CompanyRelationship = {
  id: string
  type: CompanyResourceType
}

export interface Company {
  type: 'Company'
  id: string
  attributes: {
    name: string
    address: string
  }
  relationships: {
    products: {
      data: ProductRelationship[]
    }
    createdOrders: {
      data: OrderRelationship[]
    }
    receivedOrders: {
      data: OrderRelationship[]
    }
  }
}

export interface Product {
  type: 'Product'
  id: string
  attributes: {
    name: string
    price: number
    stock: number
  }
  relationships: {
    supplier: {
      data: CompanyRelationship
    }
  }
}

export interface ProductDraft {
  id?: string | undefined
  name: string
  price: number
  stock: number
}

export interface AvailableSuppliers {
  id: string
  label: string
}
