/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { fetchRealFootballNews, fetchLiveScores, fetchStandings, FootballNews } from './services/footballService';
import { 
  Trophy, 
  Newspaper, 
  Calendar, 
  Users, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Star,
  TrendingUp,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  LayoutDashboard,
  PlusCircle,
  Settings,
  BarChart3,
  FileText,
  Eye,
  Trash2,
  Edit3,
  Flag,
  Shield,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NAV_LINKS = [
  { name: 'Serie A', icon: Shield },
  { name: 'Serie B', icon: Flag },
  { name: 'Champions League', icon: Trophy },
  { name: 'Europa League', icon: Zap },
  { name: 'Coppa Italia', icon: Star },
  { name: 'Nazionali', icon: Globe },
];

const INITIAL_ARTICLES = [
  {
    id: 1,
    title: "La corsa allo scudetto si infiamma: chi la spunterà?",
    category: "Serie A",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    time: "2 ore fa",
    views: 1240,
    status: "Pubblicato"
  },
  {
    id: 2,
    title: "Champions League: i sorteggi dei quarti di finale",
    category: "Champions League",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    time: "5 ore fa",
    views: 850,
    status: "Pubblicato"
  },
  {
    id: 3,
    title: "Mercato: il giovane talento che fa gola alle big",
    category: "Calciomercato",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800",
    time: "Ieri",
    views: 2100,
    status: "Pubblicato"
  }
];

const MATCHES = [
  { id: 1, home: "Inter", away: "Milan", score: "2 - 1", status: "Terminata", league: "Serie A" },
  { id: 2, home: "Real Madrid", away: "Barcelona", score: "0 - 0", status: "25'", league: "La Liga" },
  { id: 3, home: "Man City", away: "Liverpool", score: "1 - 1", status: "Intervallo", league: "Premier League" },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'public' | 'dashboard' | 'article' | 'category' | 'search' | 'fan-zone' | 'predictions'>('public');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [newArticle, setNewArticle] = useState({ title: '', category: 'Serie A', summary: '', image: '' });
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  const handlePrediction = (matchId: number, result: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: result }));
  };

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200";

  useEffect(() => {
    async function loadData() {
      try {
        const [realNews, realScores] = await Promise.all([
          fetchRealFootballNews(),
          fetchLiveScores()
        ]);
        setArticles(realNews.map((n: any, i: number) => ({
          ...n,
          id: i,
          image: n.image && n.image.startsWith('http') ? n.image : `https://images.unsplash.com/photo-${1574629810360 + i}-7efbbe195018?auto=format&fit=crop&q=80&w=800`,
          status: 'Pubblicato',
          views: Math.floor(Math.random() * 5000)
        })));
        setMatches(realScores);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (view === 'public' && articles.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(articles.length, 5));
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [view, articles.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const results = articles.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setView('search');
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  const openArticle = (article: any) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };

  const openCategory = async (category: string) => {
    setSelectedCategory(category);
    setView('category');
    setCategoryLoading(true);
    setStandings([]);
    setCategoryArticles([]);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);

    try {
      const [catNews, catStandings] = await Promise.all([
        fetchRealFootballNews(category),
        category !== 'Tutte' && category !== 'Nazionali' ? fetchStandings(category) : Promise.resolve([])
      ]);
      setCategoryArticles(catNews.map((n: any, i: number) => ({
        ...n,
        id: `cat-${i}`,
        image: n.image && n.image.startsWith('http') ? n.image : `https://images.unsplash.com/photo-${1574629810360 + i}-7efbbe195018?auto=format&fit=crop&q=80&w=800`
      })));
      setStandings(catStandings);
    } catch (err) {
      console.error(err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticleId !== null) {
      setArticles(articles.map(a => a.id === editingArticleId ? {
        ...a,
        title: newArticle.title,
        category: newArticle.category,
        summary: newArticle.summary,
        image: newArticle.image || a.image
      } : a));
    } else {
      const article = {
        id: Date.now(),
        title: newArticle.title,
        category: newArticle.category,
        summary: newArticle.summary || "Nessun contenuto fornito.",
        image: newArticle.image || `https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800`,
        url: "#",
        time: "Adesso",
        views: 0,
        status: "Pubblicato"
      };
      setArticles([article, ...articles]);
    }
    setIsAddingArticle(false);
    setEditingArticleId(null);
    setNewArticle({ title: '', category: 'Serie A', summary: '', image: '' });
  };

  const openEditModal = (article: any) => {
    setNewArticle({
      title: article.title,
      category: article.category,
      summary: article.summary || '',
      image: article.image || ''
    });
    setEditingArticleId(article.id);
    setIsAddingArticle(true);
  };

  const deleteArticle = (id: number) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-neutral-100 flex">
        {/* Dashboard Sidebar */}
        <aside className="w-64 bg-neutral-900 text-white flex flex-col hidden md:flex">
          <div className="p-6 flex items-center gap-2 border-b border-neutral-800">
            <Trophy className="w-6 h-6 text-emerald-500" />
            <span className="font-display font-bold text-lg">Admin Panel</span>
          </div>
          <nav className="flex-grow p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 rounded-xl text-sm font-medium">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors">
              <FileText className="w-5 h-5" /> Articoli
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors">
              <BarChart3 className="w-5 h-5" /> Statistiche
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors">
              <Settings className="w-5 h-5" /> Impostazioni
            </button>
          </nav>
          <div className="p-4 border-t border-neutral-800">
            <button 
              onClick={() => setView('public')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold transition-colors"
            >
              Torna al Sito
            </button>
          </div>
        </aside>

        {/* Dashboard Main Content */}
        <main className="flex-grow p-8 overflow-y-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">Gestione Contenuti</h1>
              <p className="text-neutral-500 text-sm">Bentornato, ecco cosa succede oggi.</p>
            </div>
            <button 
              onClick={() => setIsAddingArticle(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
            >
              <PlusCircle className="w-5 h-5" /> Nuovo Articolo
            </button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-emerald-600">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">45.2k</h3>
              <p className="text-neutral-500 text-sm">Visualizzazioni Totali</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-emerald-600">+5</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">{articles.length}</h3>
              <p className="text-neutral-500 text-sm">Articoli Pubblicati</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-red-600">-2%</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">1.2k</h3>
              <p className="text-neutral-500 text-sm">Utenti Attivi</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Youtube className="w-5 h-5" /></div>
                <button 
                  onClick={() => { setTempVideoUrl(videoUrl); setIsEditingVideo(true); }}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Modifica
                </button>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 truncate">Video Home</h3>
              <p className="text-neutral-500 text-xs truncate">{videoUrl}</p>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="font-bold text-neutral-900">Articoli Recenti</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-400"><Search className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Titolo</th>
                    <th className="px-6 py-4 font-bold">Categoria</th>
                    <th className="px-6 py-4 font-bold">Stato</th>
                    <th className="px-6 py-4 font-bold">Views</th>
                    <th className="px-6 py-4 font-bold text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={article.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="text-sm font-bold text-neutral-900 line-clamp-1">{article.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full font-medium">{article.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${article.status === 'Pubblicato' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{article.views}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openArticle(article)}
                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Visualizza"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(article)}
                            className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Modifica"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteArticle(article.id)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Video Edit Modal */}
        <AnimatePresence>
          {isEditingVideo && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditingVideo(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md"
              >
                <h2 className="text-xl font-bold mb-4">Modifica Video YouTube</h2>
                <p className="text-sm text-neutral-500 mb-4">Inserisci l'URL "embed" del video (es: https://www.youtube.com/embed/ID_VIDEO)</p>
                <input 
                  type="text"
                  value={tempVideoUrl}
                  onChange={(e) => setTempVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl mb-6 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditingVideo(false)}
                    className="flex-1 py-2 bg-neutral-100 rounded-xl font-bold"
                  >
                    Annulla
                  </button>
                  <button 
                    onClick={() => { setVideoUrl(tempVideoUrl); setIsEditingVideo(false); }}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                  >
                    Salva
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Article Modal */}
        <AnimatePresence>
          {isAddingArticle && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingArticle(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-8">
                  <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">
                    {editingArticleId !== null ? 'Modifica Articolo' : 'Scrivi Nuovo Articolo'}
                  </h2>
                  <form onSubmit={handleAddArticle} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Titolo Articolo</label>
                        <input 
                          required
                          type="text" 
                          value={newArticle.title}
                          onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                          placeholder="Inserisci un titolo..." 
                          className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Categoria</label>
                        <select 
                          value={newArticle.category}
                          onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        >
                          {NAV_LINKS.map(link => (
                            <option key={link.name} value={link.name}>{link.name}</option>
                          ))}
                          <option value="Calciomercato">Calciomercato</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">URL Immagine (Opzionale)</label>
                      <input 
                        type="url" 
                        value={newArticle.image}
                        onChange={(e) => setNewArticle({...newArticle, image: e.target.value})}
                        placeholder="https://esempio.it/immagine.jpg" 
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Contenuto (Markdown supportato)</label>
                      <textarea 
                        required
                        rows={8}
                        value={newArticle.summary}
                        onChange={(e) => setNewArticle({...newArticle, summary: e.target.value})}
                        placeholder="Scrivi qui il corpo dell'articolo..." 
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingArticle(false);
                          setEditingArticleId(null);
                          setNewArticle({ title: '', category: 'Serie A', summary: '', image: '' });
                        }}
                        className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                      >
                        Annulla
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
                      >
                        {editingArticleId !== null ? 'Salva Modifiche' : 'Pubblica Articolo'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setView('public')}
            >
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-extrabold tracking-tight text-emerald-900">
                MONDO<span className="text-emerald-600">CALCIO</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => openCategory(link.name)}
                  className="text-xs font-bold text-neutral-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.name}
                </button>
              ))}
              <div className="h-4 w-px bg-neutral-200 mx-2"></div>
              <button 
                onClick={() => setView('fan-zone')}
                className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider transition-colors ${view === 'fan-zone' ? 'text-emerald-600' : 'text-neutral-500 hover:text-emerald-600'}`}
              >
                <Users className="w-3.5 h-3.5" /> Fan Zone
              </button>
              <button 
                onClick={() => setView('predictions')}
                className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider transition-colors ${view === 'predictions' ? 'text-emerald-600' : 'text-neutral-500 hover:text-emerald-600'}`}
              >
                <Zap className="w-3.5 h-3.5" /> Pronostici
              </button>
            </nav>

            {/* Search & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <div className={`relative transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64' : 'w-10'}`}>
                <form onSubmit={handleSearch} className="flex items-center">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca notizie..."
                    className={`w-full bg-neutral-100 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="absolute right-0 p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Admin
              </button>
              <button 
                className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-neutral-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => openCategory(link.name)}
                    className="w-full flex items-center gap-4 text-lg font-medium text-neutral-700 hover:text-emerald-600"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </button>
                ))}
                <div className="h-px bg-neutral-100 my-4"></div>
                <button 
                  onClick={() => { setView('fan-zone'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-4 text-lg font-medium text-neutral-700 hover:text-emerald-600"
                >
                  <Users className="w-5 h-5" /> Fan Zone
                </button>
                <button 
                  onClick={() => { setView('predictions'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-4 text-lg font-medium text-neutral-700 hover:text-emerald-600"
                >
                  <Zap className="w-5 h-5" /> Pronostici
                </button>
                <button 
                  onClick={() => { setView('dashboard'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-4 text-lg font-medium text-emerald-600 pt-4 border-t border-neutral-100"
                >
                  <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow bg-neutral-50">
        {view === 'article' && selectedArticle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-12"
          >
            <button 
              onClick={() => setView('public')}
              className="flex items-center gap-2 text-emerald-600 font-bold mb-8 hover:translate-x-1 transition-transform"
            >
              <ChevronRight className="w-5 h-5 rotate-180" /> Torna alla Home
            </button>
            <img 
              src={selectedArticle.image} 
              alt={selectedArticle.title}
              className="w-full h-[450px] object-cover rounded-3xl shadow-2xl mb-8"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {selectedArticle.category}
              </span>
              <span className="text-neutral-400 text-sm">{selectedArticle.time}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-neutral-900 mb-8 leading-tight">
              {selectedArticle.title}
            </h1>
            <div className="prose prose-emerald max-w-none text-neutral-700 leading-relaxed text-lg">
              <Markdown>{selectedArticle.summary}</Markdown>
              {selectedArticle.url && selectedArticle.url !== '#' && (
                <p className="mt-8">
                  Per approfondire la notizia completa, visita la fonte ufficiale: 
                  <a 
                    href={selectedArticle.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-emerald-600 font-bold underline"
                  >
                    Leggi su {(() => {
                      try {
                        return new URL(selectedArticle.url).hostname;
                      } catch {
                        return 'Fonte';
                      }
                    })()}
                  </a>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {view === 'category' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-display font-extrabold text-neutral-900">{selectedCategory}</h1>
                </div>
                <p className="text-neutral-500">Tutte le ultime notizie e approfondimenti su {selectedCategory}</p>
              </div>
              <button 
                onClick={() => setView('public')}
                className="px-6 py-2 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
              >
                Torna alla Home
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* News Column */}
              <div className="lg:col-span-2 space-y-8">
                <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-emerald-600" />
                  Ultime Notizie
                </h2>
                
                {categoryLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex gap-6 animate-pulse">
                        <div className="w-32 h-32 bg-neutral-200 rounded-xl flex-shrink-0"></div>
                        <div className="flex-grow space-y-3 py-2">
                          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                          <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : categoryArticles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {categoryArticles.map((news) => (
                      <motion.div 
                        key={news.id}
                        whileHover={{ x: 5 }}
                        onClick={() => openArticle(news)}
                        className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden cursor-pointer group flex flex-col sm:flex-row"
                      >
                        <div className="sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-6 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{news.category}</span>
                            <h3 className="text-xl font-bold text-neutral-900 mt-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                              {news.title}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-3 line-clamp-2">{news.summary}</p>
                          </div>
                          <p className="text-xs text-neutral-400 mt-4">{news.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                    <Newspaper className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <p className="text-neutral-400 font-medium">Nessun articolo trovato in questa sezione al momento.</p>
                  </div>
                )}
              </div>

              {/* Sidebar / Standings */}
              <div className="space-y-8">
                {selectedCategory !== 'Tutte' && selectedCategory !== 'Nazionali' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="p-5 bg-neutral-900 text-white flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Classifica Reale
                      </h3>
                    </div>
                    <div className="p-2">
                      {categoryLoading ? (
                        <div className="space-y-2 p-4">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-8 bg-neutral-100 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : standings.length > 0 ? (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-neutral-400 border-b border-neutral-100">
                              <th className="px-3 py-2 text-left font-bold">#</th>
                              <th className="px-3 py-2 text-left font-bold">Squadra</th>
                              <th className="px-3 py-2 text-center font-bold">P</th>
                              <th className="px-3 py-2 text-right font-bold">Pt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50">
                            {standings.map((team, i) => (
                              <tr key={i} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-3 py-3 font-bold text-neutral-400">{team.position}</td>
                                <td className="px-3 py-3 font-bold text-neutral-900">{team.team}</td>
                                <td className="px-3 py-3 text-center text-neutral-500">{team.played}</td>
                                <td className="px-3 py-3 text-right font-extrabold text-emerald-600">{team.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-8 text-center text-neutral-400 italic">
                          Dati classifica non disponibili.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ad Placeholder */}
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Sponsor</span>
                  <h4 className="font-bold text-emerald-900 mb-2">Abbonati a Mondo Calcio Premium</h4>
                  <p className="text-xs text-emerald-700 mb-4">Contenuti esclusivi, interviste e analisi tattiche senza pubblicità.</p>
                  <button className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                    Scopri di più
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'fan-zone' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4 block">Community</span>
              <h1 className="text-5xl font-display font-extrabold text-neutral-900 mb-6">Fan Zone</h1>
              <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
                Il cuore pulsante di Mondo Calcio. Unisciti alla discussione, partecipa ai sondaggi e condividi la tua passione.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Fan Wall */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                    Fan Wall
                  </h2>
                  <div className="space-y-6">
                    {[
                      { user: "Marco88", text: "Che partita ieri sera! La Serie A non è mai stata così equilibrata.", time: "10 min fa", avatar: "M" },
                      { user: "Giulia_Inter", text: "Speriamo bene per il derby, la tensione è alle stelle!", time: "45 min fa", avatar: "G" },
                      { user: "Luca_Juve", text: "Il mercato di gennaio sarà decisivo per la rincorsa Champions.", time: "2 ore fa", avatar: "L" },
                    ].map((msg, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-neutral-50 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {msg.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-neutral-900">{msg.user}</span>
                            <span className="text-[10px] text-neutral-400">{msg.time}</span>
                          </div>
                          <p className="text-sm text-neutral-600">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-neutral-100">
                    <textarea 
                      placeholder="Scrivi qualcosa sulla bacheca..."
                      className="w-full p-4 bg-neutral-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none h-24 text-sm"
                    ></textarea>
                    <button className="mt-4 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                      Pubblica
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Poll Section */}
                <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                    Sondaggio
                  </h3>
                  <p className="text-emerald-100 font-medium mb-6">Chi vincerà lo scudetto quest'anno?</p>
                  <div className="space-y-3">
                    {[
                      { team: "Inter", votes: 45 },
                      { team: "Juventus", votes: 30 },
                      { team: "Milan", votes: 15 },
                      { team: "Napoli", votes: 10 },
                    ].map((option, i) => (
                      <button key={i} className="w-full group">
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span>{option.team}</span>
                          <span>{option.votes}%</span>
                        </div>
                        <div className="h-2 bg-emerald-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${option.votes}%` }}
                            className="h-full bg-emerald-400"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Fans */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                    Top Fans
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: "Francesco T.", points: 1250, rank: 1 },
                      { name: "Alessio B.", points: 1100, rank: 2 },
                      { name: "Sofia R.", points: 980, rank: 3 },
                    ].map((fan, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-neutral-400 w-4">#{fan.rank}</span>
                          <span className="text-sm font-bold text-neutral-900">{fan.name}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">{fan.points} pt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'predictions' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4 block">Sfida</span>
              <h1 className="text-5xl font-display font-extrabold text-neutral-900 mb-6">Pronostici</h1>
              <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
                Metti alla prova la tua conoscenza calcistica. Indovina i risultati delle partite e scala la classifica globale.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-emerald-600" />
                  Partite di Oggi
                </h2>
                
                {matches.length > 0 ? matches.map((match, i) => (
                  <div key={i} className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-8">
                      <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {match.league}
                      </span>
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        {match.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 items-center gap-4 mb-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="font-bold text-neutral-900">{match.home}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-display font-black text-neutral-900">{match.score}</span>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="font-bold text-neutral-900">{match.away}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {['1', 'X', '2'].map((res) => (
                        <button 
                          key={res}
                          onClick={() => handlePrediction(i, res)}
                          className={`py-3 rounded-xl font-bold text-sm transition-all ${
                            predictions[i] === res 
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                              : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                    <p className="text-neutral-400 font-medium">Nessuna partita disponibile per i pronostici al momento.</p>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
                  <h3 className="text-xl font-bold mb-6">Come Funziona</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: Zap, title: "Scegli l'esito", desc: "Seleziona 1, X o 2 per ogni partita." },
                      { icon: Trophy, title: "Guadagna punti", desc: "Ottieni 10 punti per ogni pronostico esatto." },
                      { icon: Star, title: "Scala la vetta", desc: "Entra nella Top 10 dei fan mondiali." },
                    ].map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral-900">{step.title}</p>
                          <p className="text-xs text-neutral-500">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-extrabold text-neutral-900">Risultati per: "{searchQuery}"</h1>
              <p className="text-neutral-500 mt-2">Trovati {searchResults.length} articoli</p>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((news) => (
                  <motion.div 
                    key={news.id}
                    whileHover={{ y: -5 }}
                    onClick={() => openArticle(news)}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden cursor-pointer group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{news.category}</span>
                      <h3 className="text-lg font-bold text-neutral-900 mt-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-4">{news.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                <Search className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                <p className="text-neutral-400 font-medium">Nessun risultato trovato per la tua ricerca.</p>
                <button 
                  onClick={() => setView('public')}
                  className="mt-6 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Torna alla Home
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'public' && (
          <>
            {/* Slider Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
                {articles.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => openArticle(articles[currentSlide])}
                    >
                      <img 
                        src={articles[currentSlide].image} 
                        alt={articles[currentSlide].title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                        <motion.span 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="inline-block px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full mb-4 w-fit uppercase tracking-widest"
                        >
                          {articles[currentSlide].category}
                        </motion.span>
                        <motion.h2 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="text-3xl md:text-5xl font-display font-extrabold text-white mb-4 leading-tight max-w-3xl"
                        >
                          {articles[currentSlide].title}
                        </motion.h2>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-neutral-300 text-sm md:text-base flex items-center gap-3"
                        >
                          <Calendar className="w-5 h-5" /> {articles[currentSlide].time}
                        </motion.p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full bg-neutral-200 animate-pulse flex items-center justify-center">
                    <p className="text-neutral-400 font-bold">Caricamento notizie...</p>
                  </div>
                )}
                
                {/* Slider Controls */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                  {articles.slice(0, 5).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-emerald-500 w-8' : 'bg-white/50 hover:bg-white'}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Hero / Featured News */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Featured (Now a grid of other news) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.slice(5, 11).map((news, idx) => (
                    <motion.div 
                      key={news.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden cursor-pointer group"
                      onClick={() => openArticle(news)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{news.category}</span>
                        <h3 className="text-lg font-bold text-neutral-900 mt-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-4">{news.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Side News */}
                <div className="space-y-6">
                  <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    In Evidenza
                  </h2>
                  {articles.slice(1, 6).map((news, idx) => (
                    <motion.div 
                      key={news.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (idx + 1) }}
                      onClick={() => openArticle(news)}
                      className="bg-white rounded-xl shadow-sm overflow-hidden flex gap-4 p-3 hover:shadow-md transition-shadow cursor-pointer border border-neutral-100"
                    >
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            {news.category}
                          </span>
                          <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 mt-1 leading-snug">
                            {news.title}
                          </h3>
                        </div>
                        <p className="text-[10px] text-neutral-500">{news.time}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Live Scores Widget */}
                  <div className="bg-emerald-900 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Risultati Reali
                      </h3>
                      <span className="text-[10px] bg-red-500 px-2 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>
                    </div>
                    <div className="space-y-4">
                      {matches.length > 0 ? matches.map((match, i) => (
                        <div key={i} className="border-b border-emerald-800/50 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between text-[10px] text-emerald-400 mb-1 font-medium">
                            <span>{match.league}</span>
                            <span>{match.status}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">{match.home}</span>
                            <span className="text-sm font-mono font-bold bg-emerald-800 px-2 py-0.5 rounded">{match.score}</span>
                            <span className="text-sm font-semibold text-right">{match.away}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-emerald-400/60 italic text-center py-4">Caricamento risultati...</p>
                      )}
                    </div>
                    <button 
                      onClick={() => window.open('https://www.diretta.it', '_blank')}
                      className="w-full mt-4 py-2 text-xs font-bold text-emerald-400 border border-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
                    >
                      Vedi tutti i match su Diretta.it
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Video Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 md:p-16 flex flex-col justify-center">
                    <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-4">Video del Giorno</span>
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-6 leading-tight">
                      Le migliori azioni e i gol più belli della settimana
                    </h2>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                      Resta aggiornato con i nostri contenuti video esclusivi. Analisi tattiche, interviste e i momenti più spettacolari dai campi di tutto il mondo.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold">Mondo Calcio TV</p>
                        <p className="text-neutral-500 text-sm">Iscriviti al canale</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video lg:aspect-auto h-full min-h-[300px]">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={videoUrl} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              </div>
            </section>

            {/* Categories Section */}
            <section className="bg-white py-12 border-y border-neutral-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-neutral-900">Sezioni Principali</h2>
                  <button 
                    onClick={() => openCategory('Tutte')}
                    className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:underline"
                  >
                    Tutte le sezioni <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {NAV_LINKS.map((link, idx) => (
                    <motion.div 
                      key={link.name}
                      whileHover={{ y: -5 }}
                      onClick={() => openCategory(link.name)}
                      className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 flex flex-col items-center text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <link.icon className={`w-6 h-6 ${idx % 2 === 0 ? 'text-emerald-600' : 'text-blue-600'}`} />
                      </div>
                      <h3 className="font-bold text-neutral-800 text-sm">{link.name}</h3>
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Esplora</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Newsletter */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-700 rounded-full opacity-20 blur-3xl"></div>
                
                <div className="relative z-10 text-center md:text-left">
                  <h2 className="text-3xl font-display font-extrabold text-white mb-2">Resta aggiornato!</h2>
                  <p className="text-emerald-100">Iscriviti alla nostra newsletter per non perdere nessuna notizia.</p>
                </div>
                <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="La tua email" 
                    className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-64"
                  />
                  <button className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
                    Iscriviti
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-display font-extrabold tracking-tight text-white">
                  MONDO<span className="text-emerald-600">CALCIO</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Il tuo punto di riferimento quotidiano per tutto ciò che riguarda il gioco più bello del mondo. Notizie, analisi e passione.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-emerald-500 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-emerald-500 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-emerald-500 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-emerald-500 transition-colors"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Navigazione</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => setView('public')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => openCategory('Tutte')} className="hover:text-white transition-colors">Notizie</button></li>
                <li><button onClick={() => setView('public')} className="hover:text-white transition-colors">Risultati</button></li>
                <li><button onClick={() => openCategory('Serie A')} className="hover:text-white transition-colors">Classifiche</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Campionati</h4>
              <ul className="space-y-4 text-sm">
                {NAV_LINKS.slice(0, 4).map(link => (
                  <li key={link.name}><button onClick={() => openCategory(link.name)} className="hover:text-white transition-colors">{link.name}</button></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Supporto</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Chi Siamo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contatti</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; 2024 Mondo Calcio. Tutti i diritti riservati.</p>
            <div className="flex gap-6">
              <span>Made with ❤️ for football fans</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
