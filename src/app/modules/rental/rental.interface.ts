export interface IRentalItem {
  gearItemId: string;
  quantity: number;
}

export interface ICreateRentalPayload {
  startDate: string;
  endDate: string;
  items: IRentalItem[];
  note?: string;
}

export interface IRentalQuery {
  page?: string;
  limit?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}
