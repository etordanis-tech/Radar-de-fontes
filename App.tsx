
import React, { useState, useCallback } from 'react';
import { GeminiService } from './services/geminiService';
import { SearchResult, SearchResource } from './types';
import { Search, Globe, ShieldCheck, ShieldAlert, ExternalLink, Loader2, Info, Flame, Sparkles, BookOpen, Tv } from 'lucide-react';

const gemini = new GeminiService();

const SUGGESTIONS = [
  { label: 'Filmes Lançamento', icon: <Tv size={14} />, query: 'Onde assistir filmes que acabaram de sair do cinema' },
  { label: 'Cursos de IA', icon: <Sparkles size={14} />, query: 'Melhores cursos gratuitos de Inteligência Artificial 2024' },
  { label: 'Livros PDF', icon: <BookOpen size={14} />, query: 'Sites para baixar livros em PDF legalmente' },
  { label: 'Jogos Grátis', icon: <Flame size={14} />, query: 'Onde baixar jogos de PC grátis e seguros' },
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await gemini.findSources(searchQuery);
      setResult(data);
    } catch (err) {
      setError("Ocorreu um erro ao buscar as informações. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  }, [query]);

  const handleSuggestionClick = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
    performSearch(suggestionQuery);
  };

  const renderResourceCard = (resource: SearchResource) => (
    <div key={resource.url} className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group hover:bg-gray-900/60">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {resource.title}
        </h4>
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-all"
          title="Abrir link"
        >
          <ExternalLink size={18} />
        </a>
      </div>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {resource.description}
      </p>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/50">
        <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md ${
          resource.category === 'legal' 
            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
            : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
        }`}>
          {resource.category === 'legal' ? 'Oficial' : 'Alternativo'}
        </span>
        <span className="text-[10px] text-gray-600 font-mono truncate max-w-[120px]">
          {new URL(resource.url).hostname.replace('www.', '')}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-blue-500/30">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Navigation / Mini-Header */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {setResult(null); setQuery('');}}>
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Globe size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">RADAR<span className="text-blue-500">FONTES</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#" className="hover:text-white transition-colors">Segurança</a>
            <a href="#" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10">Contribua</a>
          </div>
        </nav>

        {/* Hero Section */}
        {!result && !loading && (
          <header className="text-center mb-12 animate-in fade-in zoom-in-95 duration-700">
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
              Onde está o que você <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">procura agora?</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Encontre links diretos para streaming, downloads e comunidades. 
              Nossa IA mapeia a web em tempo real para você.
            </p>
          </header>
        )}

        {/* Search Bar Container */}
        <div className={`max-w-2xl mx-auto transition-all duration-700 ${result ? 'mb-12' : 'mb-24'}`}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você quer encontrar hoje?"
              className="relative w-full bg-gray-900 border border-white/10 focus:border-blue-500 rounded-2xl py-6 px-8 pr-20 text-xl outline-none transition-all shadow-2xl placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 z-20"
            >
              {loading ? <Loader2 className="animate-spin text-white" size={24} /> : <Search className="text-white" size={24} />}
            </button>
          </form>

          {/* Suggestions Chips */}
          {!result && !loading && (
            <div className="flex flex-wrap justify-center gap-3 mt-8 animate-in fade-in slide-in-from-top-2 duration-1000 delay-300">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.query)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-white/5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 hover:border-blue-500/50 transition-all"
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-900/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-8 flex items-center gap-4 animate-in fade-in shake">
            <div className="p-2 bg-red-500/20 rounded-lg">
               <Info size={20} />
            </div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Top Analysis Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
               <div>
                  <h2 className="text-sm uppercase tracking-[0.2em] font-black text-blue-500 mb-2">Análise Concluída</h2>
                  <h3 className="text-3xl font-bold text-white">Resultados para: "{query}"</h3>
               </div>
               <div className="flex gap-4">
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-xs text-emerald-400 font-bold">FONTES VERIFICADAS</span>
                  </div>
                  <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <span className="text-xs text-blue-400 font-bold">GROUNDING ATIVO</span>
                  </div>
               </div>
            </div>

            {/* AI Summary Box */}
            <section className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Sparkles size={120} />
              </div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                <div className="p-2 bg-blue-400/10 rounded-lg"><Info size={20} /></div>
                Visão Geral do Radar
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed italic border-l-4 border-blue-500/30 pl-6">
                "{result.summary}"
              </p>
            </section>

            {/* Resources Grid */}
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Column 1: Legal */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Fontes Oficiais</h3>
                    <p className="text-xs text-gray-500 font-medium">Canais autorizados e plataformas de streaming</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-1 gap-5">
                  {result.resources.filter(r => r.category === 'legal').map(renderResourceCard)}
                  {result.resources.filter(r => r.category === 'legal').length === 0 && (
                    <div className="p-8 border border-dashed border-gray-800 rounded-2xl text-center text-gray-600 text-sm">
                      Nenhuma fonte oficial identificada para este termo.
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Alternative */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                    <ShieldAlert className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Alternativas</h3>
                    <p className="text-xs text-gray-500 font-medium">Repositórios, comunidades e fóruns de terceiros</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-1 gap-5">
                  {result.resources.filter(r => r.category === 'alternative').map(renderResourceCard)}
                  {result.resources.filter(r => r.category === 'alternative').length === 0 && (
                    <div className="p-8 border border-dashed border-gray-800 rounded-2xl text-center text-gray-600 text-sm">
                      Nenhuma fonte de comunidade encontrada.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grounding Attribution */}
            {result.groundingUrls && result.groundingUrls.length > 0 && (
              <div className="pt-12 border-t border-white/5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Referências Consultadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.groundingUrls.slice(0, 5).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-500 hover:text-white transition-colors">
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-12 animate-pulse max-w-4xl mx-auto py-12">
            <div className="h-48 bg-gray-900/50 rounded-[2rem]" />
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <div className="h-12 w-1/2 bg-gray-900/50 rounded-xl" />
                 <div className="h-32 bg-gray-900/50 rounded-2xl" />
                 <div className="h-32 bg-gray-900/50 rounded-2xl" />
              </div>
              <div className="space-y-4">
                 <div className="h-12 w-1/2 bg-gray-900/50 rounded-xl" />
                 <div className="h-32 bg-gray-900/50 rounded-2xl" />
                 <div className="h-32 bg-gray-900/50 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-32 pt-16 border-t border-white/5 text-center">
          <div className="flex justify-center gap-8 mb-8 grayscale opacity-50">
             <div className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={14}/> PRIVACIDADE</div>
             <div className="flex items-center gap-2 text-xs font-bold"><Globe size={14}/> GLOBAL</div>
             <div className="flex items-center gap-2 text-xs font-bold"><Sparkles size={14}/> IA ATIVA</div>
          </div>
          <p className="text-sm text-gray-500 mb-2">© 2024 Radar Fontes. Desenvolvido com Gemini AI & Google Search.</p>
          <div className="max-w-xl mx-auto">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
              IMPORTANTE: Os resultados são gerados automaticamente. A segurança de links de terceiros não é garantida pelo Radar Fontes. 
              Respeite os direitos autorais e as leis locais.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
