export interface ProductData {
  id?: number;
  name: string;
  price: number; // Selling price
  purchasePrice?: number; // Purchase price for FIFO
  quantity: number; // For form validation only
  image?: string;
  color?: string;
  storage?: string;
  ram?: string;
  categoryId: number;
  category?: {
    id: number,
    name: string
  };
  specification?: Specification;
  stockBatches?: StockBatch[]; // For displaying stock status

  // Virtual fields from FIFO service
  inventoryValue?: number;
  averageCost?: number;
}

export interface StockBatch {
  id: number;
  productId: number;
  initialQuantity: number;
  remainingQuantity: number;
  purchasePrice: number;
  receivedDate: string;
  product?: ProductData;
}

export interface Specification {
  model?: string;
  display?: string;
  resolution?: string;
  os?: string;
  chipset?: string;
  main_camera?: string;
  selfie_camera?: string;
  battery?: string;
  charging?: string;
  charging_port?: string;
  weight?: string;
  dimensions?: string;
};
