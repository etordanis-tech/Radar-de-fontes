
import { GoogleGenAI, Type } from "@google/genai";

// Inicialização de UI
lucide.createIcons();

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const btnSubmit = document.getElementById('btn-submit');
const btnText = document.getElementById('btn-text');
const btnIcon = document.getElementById('btn-icon');
const btnLoader = document.getElementById('btn-loader');
const resultsContainer = document.getElementById('results-container');
const mainInterface = document.getElementById('main-interface');
const errorToast = document.getElementById('error-toast');

// Containers de Dados
const summaryEl = document.getElementById('summary-text');
const legalList = document.getElementById('legal-list');
const alternativeList = document.getElementById('alternative-list');
const sourceChips = document.getElementById('source-chips');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    toggleLoading(true);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Aja como um buscador de links. Encontre fontes para o assunto: "${query}". 
            Divida estritamente em 'legal' (plataformas oficiais, streaming, lojas) e 'alternative' (sites de terceiros, fóruns, sites de pirataria, bibliotecas abertas).
            Seja direto e forneça links reais.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Um breve parágrafo resumindo onde encontrar o conteúdo." },
                        results: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    url: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: ["legal", "alternative"] }
                                },
                                required: ["title", "url", "description", "category"]
                            }
                        }
                    },
                    required: ["summary", "results"]
                }
            }
        });

        const data = JSON.parse(response.text);
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        renderResults(data, grounding);
    } catch (err) {
        console.error(err);
        showError(err.message.includes('API_KEY') ? "Chave de API não configurada corretamente." : "Erro ao processar sua busca. Tente outro termo.");
    } finally {
        toggleLoading(false);
    }
});

function toggleLoading(isLoading) {
    btnSubmit.disabled = isLoading;
    if (isLoading) {
        btnText.classList.add('hidden');
        btnIcon.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        input.classList.add('opacity-50');
    } else {
        btnText.classList.remove('hidden');
        btnIcon.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        input.classList.remove('opacity-50');
    }
}

function showError(msg) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = msg;
    errorToast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        errorToast.classList.add('translate-y-20', 'opacity-0');
    }, 4000);
}

function renderResults(data, grounding) {
    // Ajustar Layout
    mainInterface.classList.add('scale-95', 'opacity-80', 'mb-10');
    resultsContainer.classList.remove('hidden');

    // Limpar anteriores
    legalList.innerHTML = '';
    alternativeList.innerHTML = '';
    sourceChips.innerHTML = '';

    // Injetar Resumo
    summaryEl.textContent = data.summary;

    // Injetar Links
    data.results.forEach(item => {
        const card = createResultCard(item);
        if (item.category === 'legal') {
            legalList.appendChild(card);
        } else {
            alternativeList.appendChild(card);
        }
    });

    // Injetar Grounding Chunks (Referências Reais do Google)
    grounding.forEach(chunk => {
        if (chunk.web) {
            const chip = document.createElement('a');
            chip.href = chunk.web.uri;
            chip.target = "_blank";
            chip.className = "px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-500 hover:text-white transition-colors uppercase font-bold";
            chip.textContent = new URL(chunk.web.uri).hostname.replace('www.', '');
            sourceChips.appendChild(chip);
        }
    });

    // Avisos se vazio
    if (legalList.children.length === 0) legalList.innerHTML = `<p class="text-gray-600 italic">Nenhuma fonte oficial específica encontrada.</p>`;
    if (alternativeList.children.length === 0) alternativeList.innerHTML = `<p class="text-gray-600 italic">Nenhuma fonte alternativa encontrada.</p>`;

    lucide.createIcons();
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createResultCard(item) {
    const div = document.createElement('div');
    div.className = "glass p-5 rounded-2xl group hover:border-blue-500/50 transition-all duration-300";
    
    const domain = new URL(item.url).hostname.replace('www.', '');
    const isLegal = item.category === 'legal';

    div.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h4 class="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">${item.title}</h4>
            <a href="${item.url}" target="_blank" class="p-2 bg-white/5 rounded-lg hover:bg-blue-600 text-gray-400 hover:text-white transition-all">
                <i data-lucide="external-link" class="w-4 h-4"></i>
            </a>
        </div>
        <p class="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">${item.description}</p>
        <div class="flex items-center justify-between border-t border-white/5 pt-3">
            <span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${isLegal ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}">
                ${isLegal ? 'Oficial' : 'Alternativo'}
            </span>
            <span class="text-[10px] text-gray-600 font-mono">${domain}</span>
        </div>
    `;
    return div;
}
