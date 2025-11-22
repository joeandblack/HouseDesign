
import { HouseLayout } from './types';

// Land: 75x60 (Length/X x Width/Y)
// Coordinates: x=North-South (Left-Right on screen), y=East-West (Top-Bottom on screen)

export const INITIAL_LAYOUT: HouseLayout = {
  land: {
    width: 75,
    height: 60,
  },
  floors: [
    {
      id: 'floor_1',
      name: 'First Floor',
      rooms: [
        {
          id: 'adu_entry',
          name: 'ADU Entry',
          x: 15,
          y: 5,
          width: 20,
          height: 4,
          color: '#a5b4fc', // Indigo 300
          description: '20x4ft'
        },
        {
          id: 'garage',
          name: 'Garage',
          x: 15,
          y: 9, 
          width: 20,
          height: 22, // Ends at 31
          color: '#94a3b8', // Slate 400
          description: '20x22ft'
        },
        {
          id: 'living_room_a',
          name: 'Living Room',
          x: 35,
          y: 5,
          width: 10, 
          height: 26, // Ends at 31
          color: '#38bdf8', // Sky 400
          description: 'Main'
        },
        {
          id: 'living_room_b',
          name: 'Living Room', 
          x: 45,
          y: 21, // Starts at 21 (matches Stairs end)
          width: 5, 
          height: 10, // Ends at 31
          color: '#38bdf8', // Sky 400
          description: 'Ext'
        },
        {
          id: 'staircase_1',
          name: 'Stairs',
          x: 45,
          y: 5,
          width: 10, // Widened to 10ft
          height: 16, // Ends at 21
          color: '#cbd5e1', // Slate 300
          description: '10x16ft'
        },
        {
          id: 'bedroom_1', // Merged into Living Room
          name: 'Living Room',
          x: 55, // Shifted to 55
          y: 5,
          width: 15, // Reduced to 15ft
          height: 16, // Ends at 21
          color: '#38bdf8', // Sky 400
          description: 'Merged Bed1'
        },
        {
          id: 'bedroom_2',
          name: 'Playroom',
          x: 50, // Aligned to x=50
          y: 21, // Starts at 21
          width: 20, 
          height: 20, // Ends at 41
          color: '#facc15', // Yellow 400
          description: '20x20ft'
        }
      ]
    },
    {
      id: 'floor_2',
      name: 'Second Floor',
      rooms: [
        // Left Part: ADU
        {
          id: 'adu_loft_stair',
          name: 'ADU Stair/Loft',
          x: 15,
          y: 5,
          width: 20,
          height: 4,
          color: '#a5b4fc', // Indigo 300
          description: '20x4ft'
        },
        {
          id: 'adu_living',
          name: 'ADU Living',
          x: 15,
          y: 9, 
          width: 20,
          height: 12, // Ends at 21
          color: '#818cf8', // Indigo 400
          description: '20x12ft'
        },
        {
          id: 'adu_bed_1',
          name: 'ADU Room 1',
          x: 15,
          y: 21, // Starts at 21
          width: 20,
          height: 10,
          color: '#c084fc', // Purple 400
          description: '20x10ft'
        },
        {
          id: 'adu_bed_2',
          name: 'ADU Room 2',
          x: 35,
          y: 5,
          width: 10,
          height: 11, // Ends at 16
          color: '#c084fc', // Purple 400
          description: '10x11ft'
        },
        // Right Part: Main House
        {
          id: 'loft_stairs',
          name: 'Loft / Stairs',
          x: 45, 
          y: 5,
          width: 10, // Widened to 10ft
          height: 16, // Ends at 21
          color: '#cbd5e1', // Slate 300
          description: 'Stair/Loft'
        },
        {
          id: 'main_bed_4', 
          name: 'Guest Room 2',
          x: 55, // Shifted to 55
          y: 5,
          width: 15, // Reduced to 15ft
          height: 16, // Ends at 21
          color: '#fb7185', // Rose 400
          description: '15x16ft'
        },
        // Bedroom 3 -> Guest Room 1
        {
          id: 'main_bed_3_a',
          name: 'Guest Room 1',
          x: 35, 
          y: 16, // Starts at 16 (After ADU Bed 2)
          width: 10, 
          height: 15, // Ends at 31
          color: '#fb7185', // Rose 400
          description: 'L-Shape Part 1'
        },
        {
          id: 'main_bed_3_b',
          name: 'Guest Room 1',
          x: 45,
          y: 21, // Starts at 21
          width: 5, 
          height: 10, // Ends at 31
          color: '#fb7185', // Rose 400
          description: 'L-Shape Part 2'
        },
        {
          id: 'main_bed_5', 
          name: 'Master Room',
          x: 50, // Aligned to x=50
          y: 21, // Starts at 21
          width: 20, 
          height: 20, // Ends at 41
          color: '#fda4af', // Rose 300
          description: '20x20ft'
        }
      ]
    }
  ]
};

export const SAMPLE_PROMPTS = [
  "Swap the position of the ADU Living room and ADU Room 1 on the 2nd floor.",
  "Expand the garage on the 1st floor to be 25ft wide.",
  "Add a balcony to Bedroom 5 on the 2nd floor facing West.",
  "Make the stairs 10ft wide instead of 5ft.",
];
