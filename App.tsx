
import React, { useState, useCallback } from 'react';
import { GeminiService } from './services/geminiService';
import { SearchResult, SearchResource } from './types';
import { Search, Globe, ShieldCheck, ShieldAlert, ExternalLink, Loader2, Info } from 'lucide-react';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await gemini.findSources(query);
      setResult(data);
    } catch (err) {
      setError("Ocorreu um erro ao buscar as informações. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const renderResourceCard = (resource: SearchResource) => (
    <div key={resource.url} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-blue-500 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
          {resource.title}
        </h4>
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-white"
        >
          <ExternalLink size={18} />
        </a>
      </div>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {resource.description}
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
          resource.category === 'legal' 
            ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
        }`}>
          {resource.category === 'legal' ? 'Oficial' : 'Alternativo'}
        </span>
        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
          {new URL(resource.url).hostname}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl mb-6 border border-blue-500/20">
          <Globe className="text-blue-500" size={32} />
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Radar de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Fontes</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Encontre onde assistir, ler ou baixar conteúdos. Buscamos em fontes oficiais e comunidades alternativas em segundos.
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16 sticky top-8 z-50">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: 'Filme Matrix', 'Livro de Python', 'Software de edição'..."
            className="w-full bg-gray-900/80 backdrop-blur-md border-2 border-gray-800 focus:border-blue-500 rounded-2xl py-5 px-6 pr-16 text-lg outline-none transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin text-white" size={24} /> : <Search className="text-white" size={24} />}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
          <Info size={20} />
          {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="text-blue-400" /> Resumo da Busca
            </h2>
            <p className="text-gray-300 leading-relaxed italic">
              "{result.summary}"
            </p>
          </section>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Column 1: Legal */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-800">
                <ShieldCheck className="text-green-500" size={24} />
                <h3 className="text-xl font-bold text-white">Fontes Oficiais</h3>
              </div>
              <div className="grid gap-4">
                {result.resources.filter(r => r.category === 'legal').map(renderResourceCard)}
                {result.resources.filter(r => r.category === 'legal').length === 0 && (
                  <p className="text-gray-500 text-sm italic">Nenhuma fonte oficial específica encontrada.</p>
                )}
              </div>
            </div>

            {/* Column 2: Alternative */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-800">
                <ShieldAlert className="text-yellow-500" size={24} />
                <h3 className="text-xl font-bold text-white">Fontes da Comunidade</h3>
              </div>
              <div className="grid gap-4">
                {result.resources.filter(r => r.category === 'alternative').map(renderResourceCard)}
                {result.resources.filter(r => r.category === 'alternative').length === 0 && (
                  <p className="text-gray-500 text-sm italic">Nenhuma fonte alternativa encontrada.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <footer className="pt-12 border-t border-gray-900 text-center text-xs text-gray-500 flex flex-col gap-2">
            <p>Os resultados são gerados via IA com base em dados públicos do Google Search.</p>
            <p className="max-w-md mx-auto">Sempre verifique a segurança dos links antes de clicar. Não incentivamos a pirataria ilegal de conteúdo protegido por direitos autorais, apenas agregamos informações públicas.</p>
          </footer>
        </div>
      )}

      {/* Initial State / Empty */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Globe size={80} className="mb-6" />
          <p className="text-xl">Digite um assunto para começar a exploração</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-8 animate-pulse max-w-4xl mx-auto">
          <div className="h-32 bg-gray-900 rounded-3xl" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-900 rounded-3xl" />
            <div className="h-64 bg-gray-900 rounded-3xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
