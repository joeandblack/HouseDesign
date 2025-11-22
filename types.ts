export interface Room {
  id: string;
  name: string;
  x: number; // Distance from Left (North) edge
  y: number; // Distance from Top (East) edge
  width: number; // Dimension along X axis
  height: number; // Dimension along Y axis
  color?: string;
  description?: string;
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Land {
  width: number; // Length (North-South axis)
  height: number; // Width (East-West axis)
}

export interface HouseLayout {
  land: Land;
  floors: Floor[];
}

export enum BlueprintViewMode {
  SCHEMATIC = 'SCHEMATIC',
  SIMPLE = 'SIMPLE',
}