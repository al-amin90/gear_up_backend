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
