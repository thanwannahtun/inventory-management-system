export interface ProductData {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  storage?: string;
  ram?: string;
  category: number;
  categoryRelation?: {
    id: number,
    name: string
  },
  specification?: Specification
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
