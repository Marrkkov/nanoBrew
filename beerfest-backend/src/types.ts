export type ItemKey = "500" | "250" | "bottle_1" | "bottle_2" | "extra";

export type TotalsRow = {
  qty_500: number;
  qty_250: number;
  qty_bottle_1: number;
  qty_bottle_2: number;
  qty_extra: number;
};

export type OverviewRow = {
  username: string;
  qty_500: number;
  qty_250: number;
  qty_bottle_1: number;
  qty_bottle_2: number;
  qty_extra: number;
  grand: number;
};
