export interface IGearQuery {
  searchTerm?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  isAvailable?: boolean;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ICreateGearPayload {
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  categoryId: string;
}
