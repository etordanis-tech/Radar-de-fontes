
import { GoogleGenAI, Type } from "@google/genai";

// Inicializa os ícones do Lucide
lucide.createIcons();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchIcon = document.getElementById('search-icon');
const loadingIcon = document.getElementById('loading-icon');
const resultsArea = document.getElementById('results-area');
const heroSection = document.getElementById('hero-section');
const suggestions = document.getElementById('suggestions');

const aiSummary = document.getElementById('ai-summary');
const legalLinks = document.getElementById('legal-links');
const alternativeLinks = document.getElementById('alternative-links');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    // Estado de Carregamento
    setLoading(true);
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Busque fontes para: "${query}". Divida em 'legal' (streaming, oficial) e 'alternative' (pirata, fórum, comunidade).`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        resources: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    url: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: ['legal', 'alternative'] }
                                },
                                required: ["title", "url", "description", "category"]
                            }
                        }
                    },
                    required: ["summary", "resources"]
                }
            }
        });

        const data = JSON.parse(response.text);
        renderResults(data);
    } catch (error) {
        console.error(error);
        alert("Erro ao buscar resultados. Tente novamente.");
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        searchButton.disabled = true;
        searchIcon.classList.add('hidden');
        loadingIcon.classList.remove('hidden');
        searchInput.classList.add('opacity-50');
    } else {
        searchButton.disabled = false;
        searchIcon.classList.remove('hidden');
        loadingIcon.classList.add('hidden');
        searchInput.classList.remove('opacity-50');
    }
}

function renderResults(data) {
    // Esconde Hero e Sugestões na primeira busca
    heroSection.classList.add('hidden');
    suggestions.classList.add('hidden');
    resultsArea.classList.remove('hidden');

    // Limpa containers
    legalLinks.innerHTML = '';
    alternativeLinks.innerHTML = '';

    // Resumo
    aiSummary.textContent = data.summary;

    // Links
    data.resources.forEach(res => {
        const card = createCard(res);
        if (res.category === 'legal') {
            legalLinks.appendChild(card);
        } else {
            alternativeLinks.appendChild(card);
        }
    });

    // Se alguma coluna estiver vazia
    if (legalLinks.innerHTML === '') {
        legalLinks.innerHTML = '<p class="text-gray-600 text-sm italic">Nenhuma fonte oficial encontrada.</p>';
    }
    if (alternativeLinks.innerHTML === '') {
        alternativeLinks.innerHTML = '<p class="text-gray-600 text-sm italic">Nenhuma fonte alternativa encontrada.</p>';
    }

    // Re-inicializa ícones nos novos elementos
    lucide.createIcons();
    
    // Scroll suave para os resultados
    resultsArea.scrollIntoView({ behavior: 'smooth' });
}

function createCard(resource) {
    const div = document.createElement('div');
    div.className = "bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group hover:bg-gray-900/60 animate-fade-in";
    
    const hostname = new URL(resource.url).hostname.replace('www.', '');
    const badgeClass = resource.category === 'legal' 
        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' 
        : 'bg-amber-900/30 text-amber-400 border-amber-800/50';

    div.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h4 class="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                ${resource.title}
            </h4>
            <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-all">
                <i data-lucide="external-link" class="w-4 h-4"></i>
            </a>
        </div>
        <p class="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            ${resource.description}
        </p>
        <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/50">
            <span class="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md border ${badgeClass}">
                ${resource.category === 'legal' ? 'Oficial' : 'Alternativo'}
            </span>
            <span class="text-[10px] text-gray-600 font-mono truncate max-w-[120px]">
                ${hostname}
            </span>
        </div>
    `;
    return div;
}
