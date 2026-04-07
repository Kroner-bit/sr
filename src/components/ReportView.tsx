import { Participant } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';

interface Props {
  participants: Participant[];
  onBack: () => void;
}

export default function ReportView({ participants, onBack }: Props) {
  // Prepare data for charts
  const practiceData = Array.from({ length: 8 }).map((_, i) => {
    const dataPoint: any = { shot: `${i + 1}.` };
    participants.forEach(p => {
      dataPoint[p.nickname] = p.practiceShots[i] || 0;
    });
    return dataPoint;
  });

  const liveData = Array.from({ length: 8 }).map((_, i) => {
    const dataPoint: any = { shot: `${i + 1}.` };
    participants.forEach(p => {
      dataPoint[p.nickname] = p.liveShots[i] || 0;
    });
    return dataPoint;
  });

  const colors = ['#22d3ee', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c', '#38bdf8', '#4ade80'];

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center space-x-3">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-display font-bold text-white">Jelentés</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Összesítés</h2>
          <div className="space-y-3">
            {participants.map(p => {
              const practiceAvg = p.practiceShots.reduce((a, b) => a + b, 0) / 8;
              const liveAvg = p.liveShots.reduce((a, b) => a + b, 0) / 8;
              const totalAvg = (practiceAvg + liveAvg) / 2;
              return (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <div className="font-display font-bold text-lg text-white">{p.nickname}</div>
                    <div className="text-xs text-zinc-400 mt-1 flex space-x-3">
                      <span>Gyakorló: <span className="text-zinc-300">{practiceAvg.toFixed(2)}</span></span>
                      <span>Éles: <span className="text-zinc-300">{liveAvg.toFixed(2)}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 mb-0.5">Össz. Átlag</div>
                    <div className="text-2xl font-display font-bold text-cyan-400">{totalAvg.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Éles Lövések</h2>
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="shot" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#a1a1aa' }} />
                {participants.map((p, i) => (
                  <Line 
                    key={p.id} 
                    type="monotone" 
                    dataKey={p.nickname} 
                    stroke={colors[i % colors.length]} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Gyakorló Lövések</h2>
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={practiceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="shot" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#a1a1aa' }} />
                {participants.map((p, i) => (
                  <Line 
                    key={p.id} 
                    type="monotone" 
                    dataKey={p.nickname} 
                    stroke={colors[i % colors.length]} 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
