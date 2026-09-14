'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [localStats, setLocalStats] = useState<any>(null);
  const [alpineStats, setAlpineStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Busca os dados locais do Poco X3 GT
      const resLocal = await fetch('/api/stats');
      setLocalStats(await resLocal.json());

      // Busca os dados do novo celular via rede (Substitua pelo IP real)
      try {
        const resAlpine = await fetch('http://192.168.15.52:3001');
        setAlpineStats(await resAlpine.json());
      } catch (e) {
        console.error("Alpine offline ou IP incorreto");
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!localStats) return <div className="p-10 text-white">Carregando cluster...</div>;

  const memPoco = ((localStats.hardware.totalMem - localStats.hardware.freeMem) / localStats.hardware.totalMem * 100).toFixed(1);
  const memAlpine = alpineStats ? ((alpineStats.totalMem - alpineStats.freeMem) / alpineStats.totalMem * 100).toFixed(1) : '0';

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8 text-green-400">Homelab Cluster</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Card do Poco X3 GT */}
        <div className="bg-gray-800 p-6 rounded-lg border border-blue-500">
          <h2 className="text-blue-400 font-bold mb-2">Poco X3 GT (Master)</h2>
          <p>RAM: {memPoco}% em uso</p>
          <p>CPU: {localStats.hardware.loadAvg.map((l: number) => l.toFixed(2)).join(' / ')}</p>
        </div>

        {/* Card do Alpine */}
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
          <h2 className="text-purple-400 font-bold mb-2">Alpine (Dev Node)</h2>
          {alpineStats ? (
            <>
              <p>RAM: {memAlpine}% em uso</p>
              <p>CPU: {alpineStats.loadAvg.map((l: number) => l.toFixed(2)).join(' / ')}</p>
            </>
            ) : (
            <p className="text-red-400">Node Offline / Indisponível</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Serviços Ativos no Master (PM2)</h2>
      <div className="space-y-4">
        {localStats.services.map((srv: any) => (
          <div key={srv.name} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center border border-gray-700">
            <div>
              <span className="font-bold text-lg">{srv.name}</span>
              <span className={`ml-4 px-2 py-1 text-xs rounded ${srv.status === 'online' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {srv.status}
              </span>
            </div>
            <div className="text-sm text-gray-400 space-x-4">
              <span>CPU: {srv.cpu}%</span>
              <span>RAM: {(srv.mem / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}