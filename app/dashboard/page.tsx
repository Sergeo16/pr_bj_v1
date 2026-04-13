'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DuoStat {
  id: number;
  label: string;
  total: number;
  percentage: string;
}

interface DashboardData {
  national: {
    totalInscrits: number;
    totalVotants: number;
    tauxParticipation: string;
    totalBulletinsNuls: number;
    totalBulletinsBlancs: number;
    totalSuffragesExprimes: number;
    totalVoix: number;
    byDuo: DuoStat[];
  };
}

// Couleurs pour les légendes et barres (couleurs vives)
const COLORS = ['#0066FF', '#00D9A5'];
const DUO_COLORS: Record<string, string> = {
  'WADAGNI - TALATA': '#0066FF', // Bleu vif
  'HOUNKPE - HOUNWANOU': '#00D9A5', // Vert vif
};

// Fonction helper pour formater les nombres avec espace comme séparateur de milliers
const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR');
};

// Formatter personnalisé pour la légende avec couleurs vives
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', fontWeight: 'bold', fontSize: '15px' }}>
      {payload.map((entry: any, index: number) => {
        const duoColor = DUO_COLORS[entry.value] || COLORS[index % COLORS.length];
        return (
          <li key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{ 
                display: 'inline-block', 
                width: '16px', 
                height: '16px', 
                backgroundColor: duoColor,
                border: '2px solid #333',
                borderRadius: '2px'
              }} 
            />
            <span style={{ color: duoColor, fontWeight: 'bold' }}>{entry.value}</span>
          </li>
        );
      })}
    </ul>
  );
};


export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filter, setFilter] = useState<'departement' | 'commune' | 'arrondissement' | 'village' | 'centre' | 'bureau' | 'agent'>('departement');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Détecter le thème au montage et lors des changements
  useEffect(() => {
    const checkTheme = () => {
      const html = document.documentElement;
      const isDark = html.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches ||
                     html.getAttribute('data-theme') === 'dark';
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    // Observer les changements de thème
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  // Détecter la largeur de la fenêtre pour le responsive
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Initialiser la largeur
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Charger les stats initiales complètes (une seule fois)
    fetchStats();
    
    // SSE pour les mises à jour en temps réel des totaux nationaux uniquement
    const eventSource = new EventSource('/api/dashboard/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'stats' && parsed.data) {
          // Mettre à jour seulement les données synthèse depuis le stream SSE
          setData(parsed.data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // En cas d'erreur, fermer la connexion
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Charger les données du tableau à la demande (quand le filtre change immédiatement, recherche avec debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTableData();
    }, filterValue ? 500 : 0); // Debounce de 500ms pour la recherche, immédiat pour le changement de filtre

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterValue]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const stats = await response.json();
      setData(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const loadTableData = async () => {
    setIsLoadingTable(true);
    try {
      const params = new URLSearchParams({
        filter: filter,
        ...(filterValue && { search: filterValue }),
      });
      const response = await fetch(`/api/dashboard/table?${params}`);
      const result = await response.json();
      setFilteredData(result.data || []);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setFilteredData([]);
    } finally {
      setIsLoadingTable(false);
    }
  };

  const exportToCSV = () => {
    if (!filteredData.length) return;

    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pr2026_${filter}_${new Date().toISOString()}.csv`;
    a.click();
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 px-2 sm:px-4 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">Dashboard - Synthèse en Temps Réel</h1>

      {/* Graphiques */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          {/* Graphique en barres - Conteneur centré avec largeur limitée sur grands écrans */}
          <div className="w-full flex justify-center px-2 sm:px-4">
            <div className="w-full max-w-4xl">
              <ResponsiveContainer width="100%" height={windowWidth && windowWidth < 640 ? 300 : windowWidth && windowWidth < 1024 ? 350 : 400} minHeight={250}>
                <BarChart 
                  data={data.national.byDuo}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  {/* Quadrillé retiré pour un look plus épuré */}
                  <XAxis 
                    dataKey="label" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ 
                      fill: isDarkMode ? '#ffffff' : '#1a1a1a', 
                      fontWeight: 'bold', 
                      fontSize: windowWidth && windowWidth < 640 ? 11 : 13,
                      fontStyle: 'italic'
                    }}
                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#e5e7eb', strokeWidth: 1 }}
                  />
                  <YAxis 
                    tick={{ 
                      fill: isDarkMode ? '#ffffff' : '#1a1a1a', 
                      fontWeight: 'bold', 
                      fontSize: windowWidth && windowWidth < 640 ? 11 : 13,
                      fontStyle: 'italic'
                    }}
                    axisLine={{ stroke: isDarkMode ? '#4b5563' : '#e5e7eb', strokeWidth: 1 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '2px solid #333',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    formatter={(value: any, name: string) => {
                      // Supprimer le label "total" et afficher directement la valeur avec le nom du duo
                      const entry = data.national.byDuo.find(d => d.total === value);
                      return [formatNumber(value), entry?.label || ''];
                    }}
                    labelFormatter={(label) => ''}
                  />
                  <Legend 
                    content={renderLegend}
                    wrapperStyle={{ 
                      paddingTop: '20px'
                    }}
                  />
                  <Bar 
                    dataKey="total"
                    name=""
                    radius={[8, 8, 0, 0]}
                  >
                    {data.national.byDuo.map((entry, index) => {
                      const duoColor = DUO_COLORS[entry.label] || COLORS[index % COLORS.length];
                      return <Cell key={`bar-cell-${index}`} fill={duoColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rectangles de synthèse par duo - Centrés et responsive */}
          <div className="w-full flex justify-center mt-6">
            <div className="w-full max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
                {data.national.byDuo.map((duo) => {
                  const duoColor = DUO_COLORS[duo.label] || COLORS[duo.id - 1] || '#666';
                  return (
                    <div key={duo.id} className="stat bg-base-200 rounded-lg p-4 border-2 flex flex-col items-center justify-center text-center w-full sm:w-auto" style={{ borderColor: duoColor }}>
                      <div 
                        className="stat-title text-sm sm:text-base font-bold" 
                        style={{ color: duoColor }}
                      >
                        {duo.label}
                      </div>
                      <div className="stat-value text-xl sm:text-2xl">{formatNumber(duo.total)}</div>
                      <div 
                        className="stat-desc text-sm font-bold" 
                        style={{ color: duoColor, fontSize: '1.1rem' }}
                      >
                        {duo.percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Synthèse totale */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          <h2 className="card-title text-xl sm:text-2xl mb-4">Synthèse totale</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Inscrits</div>
              <div className="stat-value text-2xl">{formatNumber(data.national.totalInscrits)}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Votants</div>
              <div className="stat-value text-2xl">{formatNumber(data.national.totalVotants)}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Taux de participation</div>
              <div className="stat-value text-2xl">{data.national.tauxParticipation}%</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Bulletins nuls</div>
              <div className="stat-value text-2xl">{formatNumber(data.national.totalBulletinsNuls)}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Bulletins blancs</div>
              <div className="stat-value text-2xl">{formatNumber(data.national.totalBulletinsBlancs)}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Suffrages exprimés</div>
              <div className="stat-value text-2xl">{formatNumber(data.national.totalSuffragesExprimes)}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Total des voix</div>
              <div className="stat-value text-2xl">{formatNumber(data.national.totalVoix)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Tableau */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
            <select
              className="select select-bordered w-full sm:w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="departement">Par Département</option>
              <option value="commune">Par Commune</option>
              <option value="arrondissement">Par Arrondissement</option>
              <option value="village">Par Village</option>
              <option value="centre">Par Centre</option>
              <option value="bureau">Par Bureau de vote</option>
              <option value="agent">Par Agent</option>
            </select>

            <input
              type="text"
              placeholder="Rechercher... (recherche automatique après 0.5s)"
              className="input input-bordered flex-1 min-w-0"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />

            <button 
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg 
                        transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                        active:scale-95 w-full sm:w-auto"
              onClick={exportToCSV}
            >
              Exporter CSV
            </button>
          </div>

          {isLoadingTable && (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-4">Chargement des données...</span>
            </div>
          )}
          {!isLoadingTable && (
            <div className="overflow-x-auto -mx-2 sm:-mx-4 sm:mx-0 w-full">
              <table className="table table-zebra w-full text-xs sm:text-sm md:text-base min-w-full">
                <thead>
                <tr className="whitespace-nowrap">
                  {filter === 'departement' && (
                    <>
                      <th>Département</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>Taux participation</th>
                      <th>Bulletins nuls</th>
                      <th>Bulletins blancs</th>
                      <th>Suffrages exprimés</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                      <th>Total voix</th>
                    </>
                  )}
                  {filter === 'commune' && (
                    <>
                      <th>Département</th>
                      <th>Commune</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>Taux participation</th>
                      <th>Bulletins nuls</th>
                      <th>Bulletins blancs</th>
                      <th>Suffrages exprimés</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                      <th>Total voix</th>
                    </>
                  )}
                  {filter === 'arrondissement' && (
                    <>
                      <th>Département</th>
                      <th>Commune</th>
                      <th>Arrondissement</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>Taux participation</th>
                      <th>Bulletins nuls</th>
                      <th>Bulletins blancs</th>
                      <th>Suffrages exprimés</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                      <th>Total voix</th>
                    </>
                  )}
                  {filter === 'village' && (
                    <>
                      <th>Département</th>
                      <th>Commune</th>
                      <th>Arrondissement</th>
                      <th>Village</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>Taux participation</th>
                      <th>Bulletins nuls</th>
                      <th>Bulletins blancs</th>
                      <th>Suffrages exprimés</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                      <th>Total voix</th>
                    </>
                  )}
                  {filter === 'centre' && (
                    <>
                      <th>Département</th>
                      <th>Commune</th>
                      <th>Arrondissement</th>
                      <th>Village</th>
                      <th>Centre</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>Taux participation</th>
                      <th>Bulletins nuls</th>
                      <th>Bulletins blancs</th>
                      <th>Suffrages exprimés</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                      <th>Total voix</th>
                    </>
                  )}
                  {filter === 'bureau' && (
                    <>
                      <th>Département</th>
                      <th>Commune</th>
                      <th>Arrondissement</th>
                      <th>Village</th>
                      <th>Centre</th>
                      <th>Bureau</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>Taux participation</th>
                      <th>Bulletins nuls</th>
                      <th>Bulletins blancs</th>
                      <th>Suffrages exprimés</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                      <th>Total voix</th>
                    </>
                  )}
                  {filter === 'agent' && (
                    <>
                      <th>Agent</th>
                      <th>Département</th>
                      <th>Commune</th>
                      <th>Arrondissement</th>
                      <th>Village</th>
                      <th>Centre</th>
                      <th>Bureau</th>
                      <th>Date</th>
                      <th>Inscrits</th>
                      <th>Votants</th>
                      <th>WADAGNI - TALATA</th>
                      <th>HOUNKPE - HOUNWANOU</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 100).map((row, idx) => {
                  const inscrits = parseInt(row.total_inscrits || 0, 10);
                  const votants = parseInt(row.total_votants || 0, 10);
                  const tauxParticipation = inscrits > 0 ? ((votants / inscrits) * 100).toFixed(2) : '0.00';
                  const totalVoix = parseInt(row.total_wadagni_talata || 0, 10) + parseInt(row.total_hounkpe_hounwanou || 0, 10);
                  
                  return (
                    <tr key={idx}>
                      {filter === 'departement' && (
                        <>
                          <td>{row.name}</td>
                          <td>{formatNumber(inscrits)}</td>
                          <td>{formatNumber(votants)}</td>
                          <td>{tauxParticipation}%</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_nuls || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_blancs || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_suffrages_exprimes || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_hounkpe_hounwanou || 0, 10))}</td>
                          <td>{formatNumber(totalVoix)}</td>
                        </>
                      )}
                      {filter === 'commune' && (
                        <>
                          <td>{row.departement_name}</td>
                          <td>{row.commune_name}</td>
                          <td>{formatNumber(inscrits)}</td>
                          <td>{formatNumber(votants)}</td>
                          <td>{tauxParticipation}%</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_nuls || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_blancs || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_suffrages_exprimes || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_hounkpe_hounwanou || 0, 10))}</td>
                          <td>{formatNumber(totalVoix)}</td>
                        </>
                      )}
                      {filter === 'arrondissement' && (
                        <>
                          <td>{row.departement_name}</td>
                          <td>{row.commune_name}</td>
                          <td>{row.arrondissement_name}</td>
                          <td>{formatNumber(inscrits)}</td>
                          <td>{formatNumber(votants)}</td>
                          <td>{tauxParticipation}%</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_nuls || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_blancs || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_suffrages_exprimes || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_hounkpe_hounwanou || 0, 10))}</td>
                          <td>{formatNumber(totalVoix)}</td>
                        </>
                      )}
                      {filter === 'village' && (
                        <>
                          <td>{row.departement_name}</td>
                          <td>{row.commune_name}</td>
                          <td>{row.arrondissement_name}</td>
                          <td>{row.village_name}</td>
                          <td>{formatNumber(inscrits)}</td>
                          <td>{formatNumber(votants)}</td>
                          <td>{tauxParticipation}%</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_nuls || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_blancs || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_suffrages_exprimes || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_hounkpe_hounwanou || 0, 10))}</td>
                          <td>{formatNumber(totalVoix)}</td>
                        </>
                      )}
                      {filter === 'centre' && (
                        <>
                          <td>{row.departement_name}</td>
                          <td>{row.commune_name}</td>
                          <td>{row.arrondissement_name}</td>
                          <td>{row.village_name}</td>
                          <td>{row.centre_name}</td>
                          <td>{formatNumber(inscrits)}</td>
                          <td>{formatNumber(votants)}</td>
                          <td>{tauxParticipation}%</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_nuls || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_blancs || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_suffrages_exprimes || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_hounkpe_hounwanou || 0, 10))}</td>
                          <td>{formatNumber(totalVoix)}</td>
                        </>
                      )}
                      {filter === 'bureau' && (
                        <>
                          <td>{row.departement_name}</td>
                          <td>{row.commune_name}</td>
                          <td>{row.arrondissement_name}</td>
                          <td>{row.village_name}</td>
                          <td>{row.centre_name}</td>
                          <td>{row.bureau_name}</td>
                          <td>{formatNumber(inscrits)}</td>
                          <td>{formatNumber(votants)}</td>
                          <td>{tauxParticipation}%</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_nuls || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_bulletins_blancs || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_suffrages_exprimes || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.total_hounkpe_hounwanou || 0, 10))}</td>
                          <td>{formatNumber(totalVoix)}</td>
                        </>
                      )}
                      {filter === 'agent' && (
                        <>
                          <td>{row.full_name}</td>
                          <td>{row.departement_name}</td>
                          <td>{row.commune_name}</td>
                          <td>{row.arrondissement_name}</td>
                          <td>{row.village_name}</td>
                          <td>{row.centre_name}</td>
                          <td>{row.bureau_name}</td>
                          <td>{new Date(row.created_at).toLocaleDateString('fr-FR')}</td>
                          <td>{formatNumber(parseInt(row.inscrits || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.votants || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.voix_wadagni_talata || 0, 10))}</td>
                          <td>{formatNumber(parseInt(row.voix_hounkpe_hounwanou || 0, 10))}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredData.length > 100 && (
              <div className="text-center mt-4 text-sm text-gray-500">
                Affichage des 100 premiers résultats sur {filteredData.length}
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

