
import React, { useState, useCallback, useMemo } from 'react';
import { INITIAL_LAYOUT, SAMPLE_PROMPTS } from './constants';
import { HouseLayout, Room } from './types';
import { BlueprintCanvas } from './components/BlueprintCanvas';
import { updateLayoutWithAI } from './services/geminiService';
import { 
  WrenchScrewdriverIcon, 
  SparklesIcon, 
  ArrowPathIcon,
  MapIcon 
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [layout, setLayout] = useState<HouseLayout>(INITIAL_LAYOUT);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const newLayout = await updateLayoutWithAI(layout, prompt);
      setLayout(newLayout);
      setPrompt('');
    } catch (err) {
      setError("Failed to update layout. Please try a different instruction.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSampleClick = (text: string) => {
    setPrompt(text);
  };

  const resetLayout = useCallback(() => {
    setLayout(INITIAL_LAYOUT);
    setError(null);
  }, []);

  // Group rooms by name for the legend to handle split rooms (e.g. Bedroom 3)
  const getGroupedRooms = (rooms: Room[]) => {
    const groups: { [name: string]: { area: number, color: string, rects: Room[] } } = {};
    rooms.forEach(room => {
        if (!groups[room.name]) {
            groups[room.name] = { area: 0, color: room.color || '#cbd5e1', rects: [] };
        }
        groups[room.name].area += room.width * room.height;
        groups[room.name].rects.push(room);
    });
    return Object.entries(groups).map(([name, data]) => ({
        name,
        area: data.area,
        color: data.color,
        rectCount: data.rects.length,
        // For display coordinates, use the first rect
        x: data.rects[0].x,
        y: data.rects[0].y
    }));
  };

  const totalArea = useMemo(() => {
    return layout.floors.reduce((floorAcc, floor) => {
      return floorAcc + floor.rooms.reduce((roomAcc, room) => roomAcc + (room.width * room.height), 0);
    }, 0);
  }, [layout]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MapIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AI Architect</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={resetLayout}
               className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors"
             >
               <ArrowPathIcon className="h-4 w-4" />
               Reset to Default
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Details */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-fit sticky top-24">
          
          {/* AI Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-900">AI Designer</h2>
            </div>
            
            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
              <label htmlFor="prompt" className="sr-only">Instruction</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a change... e.g. 'Add a bathroom to the 2nd floor'"
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] resize-none p-3 text-sm"
                disabled={isGenerating}
              />
              
              {error && (
                <div className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`
                  flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium text-sm text-white shadow-sm transition-all
                  ${isGenerating || !prompt.trim() 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:transform active:scale-[0.98]'}
                `}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Designing...
                  </>
                ) : (
                  <>Generate Changes</>
                )}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Sample Commands</p>
              <div className="flex flex-col gap-2">
                {SAMPLE_PROMPTS.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleClick(text)}
                    className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded transition-colors border border-transparent hover:border-indigo-100 truncate"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Room Details Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 max-h-[400px] overflow-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
              <WrenchScrewdriverIcon className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Blueprint Details</h2>
            </div>
            <div className="">
              {layout.floors.map((floor) => (
                <div key={floor.id} className="mb-6 last:mb-0">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{floor.name}</h3>
                  <ul className="divide-y divide-slate-100">
                    {getGroupedRooms(floor.rooms).map((group, idx) => (
                      <li key={idx} className="py-2 flex items-center justify-between group hover:bg-slate-50 rounded px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-3 h-3 rounded-full shadow-sm border border-black/10" 
                            style={{ backgroundColor: group.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{group.name}</p>
                            <p className="text-[10px] text-slate-500">{group.rectCount > 1 ? 'Complex Shape' : `X: ${group.x}' | Y: ${group.y}'`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-slate-700">{Math.round(group.area)} sq ft</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-600">
                <span>Total Gross Area</span>
                <span className="font-mono font-bold">
                  {totalArea} sq ft
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 min-h-[600px] lg:h-[calc(100vh-8rem)]">
           <BlueprintCanvas layout={layout} />
        </div>

      </main>
    </div>
  );
};

export default App;
