import { GoogleGenAI, Type } from "@google/genai";
import { HouseLayout } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const updateLayoutWithAI = async (
  currentLayout: HouseLayout,
  userPrompt: string
): Promise<HouseLayout> => {
  
  const systemInstruction = `
    You are an expert architect AI specialized in 2D floor plan generation for multi-story houses.
    Your task is to modify a JSON structure representing a house layout based on a user's natural language request.
    
    COORDINATE SYSTEM:
    - The layout is a 2D cartesian plane.
    - Top-Left is (0,0).
    - X-axis increases to the RIGHT (South).
    - Y-axis increases DOWNWARDS (West).
    - "Left edge" corresponds to North (x=0).
    - "Top edge" corresponds to East (y=0).
    
    STRUCTURE:
    - The layout contains 'land' dimensions and an array of 'floors'.
    - Each 'floor' has an id, name, and a list of 'rooms'.
    
    INPUT:
    - Current Layout JSON.
    - User Instruction (e.g., "Add a bathroom on the 2nd floor", "Resize garage").
    
    OUTPUT:
    - A valid JSON object matching the input structure with the requested modifications.
    - Ensure structural walls often align between floors (e.g., external walls).
    - Ensure rooms do not unintentionally overlap unless specified.
    - Ensure rooms generally stay within the land boundaries (0,0) to (land.width, land.height).
    - Recalculate positions (x,y) and dimensions (width,height) accurately.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Current Layout: ${JSON.stringify(currentLayout)}
        User Instruction: ${userPrompt}
      `,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                land: {
                    type: Type.OBJECT,
                    properties: {
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER }
                    },
                    required: ["width", "height"]
                },
                floors: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            rooms: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        name: { type: Type.STRING },
                                        x: { type: Type.NUMBER },
                                        y: { type: Type.NUMBER },
                                        width: { type: Type.NUMBER },
                                        height: { type: Type.NUMBER },
                                        color: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    },
                                    required: ["id", "name", "x", "y", "width", "height", "color"]
                                }
                            }
                        },
                        required: ["id", "name", "rooms"]
                    }
                }
            },
            required: ["land", "floors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as HouseLayout;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};