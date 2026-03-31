import { ZODIAC_SIGNS } from './data.js';

// --- State Management ---
let isMuted = true;
let userPhoto = null;
let currentGender = 'Homme';

// --- Selectors ---
const body = document.body;
const audio = document.getElementById('bg-audio');
const muteToggle = document.getElementById('mute-toggle');
const muteIcon = document.getElementById('mute-icon');
const navButtons = document.querySelectorAll('.btn-nav');
const sections = document.querySelectorAll('.section');
const findSignForm = document.getElementById('find-sign-form');
const birthDaySelect = document.getElementById('birth-day');
const birthMonthSelect = document.getElementById('birth-month');
const compSign1Select = document.getElementById('comp-sign-1');
const compSign2Select = document.getElementById('comp-sign-2');
const calculateCompBtn = document.getElementById('calculate-comp');
const passSignSelect = document.getElementById('pass-sign');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const genderButtons = document.querySelectorAll('#gender-toggle button');
const downloadBtn = document.getElementById('download-passport');

// --- Initialization ---
function init() {
    setupAudio();
    populateSelects();
    setupNavigation();
    setupForms();
    setupPassport();
    renderExplorer();
    lucide.createIcons();
}

function updateIcon(el, name) {
    if (!el) return;
    el.innerHTML = `<i data-lucide="${name}"></i>`;
    lucide.createIcons();
}

// --- Audio Logic ---
function setupAudio() {
    if (!audio) return;
    audio.volume = 0.3;

    muteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            audio.pause();
            updateIcon(muteIcon, 'volume-x');
        } else {
            audio.play().catch(() => {});
            updateIcon(muteIcon, 'volume-2');
        }
    });
}

// --- Navigation Logic ---
function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navButtons.forEach(b => b.classList.remove('active'));
    
    const targetSection = document.getElementById(`section-${sectionId}`);
    const targetBtn = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');
    
    if (sectionId === 'home') {
        const container = document.getElementById('zodiac-card-container');
        if (container) container.innerHTML = '';
    }
}

// --- Data Population ---
function populateSelects() {
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    if (birthMonthSelect) {
        months.forEach((m, i) => {
            birthMonthSelect.add(new Option(m, i + 1));
        });

        birthMonthSelect.addEventListener('change', updateDays);
        updateDays();
    }

    function updateDays() {
        const month = parseInt(birthMonthSelect.value);
        let days = 31;
        if (month === 2) days = 29;
        else if ([4, 6, 9, 11].includes(month)) days = 30;
        
        birthDaySelect.innerHTML = '';
        for (let i = 1; i <= days; i++) {
            birthDaySelect.add(new Option(i, i));
        }
    }

    ZODIAC_SIGNS.forEach(sign => {
        if (compSign1Select) compSign1Select.add(new Option(`${sign.symbol} ${sign.name}`, sign.id));
        if (compSign2Select) compSign2Select.add(new Option(`${sign.symbol} ${sign.name}`, sign.id));
        if (passSignSelect) passSignSelect.add(new Option(`${sign.symbol} ${sign.name}`, sign.id));
    });
}

// --- Sign Calculation ---
function getSignByDate(month, day) {
    return ZODIAC_SIGNS.find(sign => {
        if (sign.startMonth === sign.endMonth) {
            return month === sign.startMonth && day >= sign.startDay && day <= sign.endDay;
        }
        return (month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay);
    }) || ZODIAC_SIGNS[0];
}

// --- Forms Logic ---
function setupForms() {
    if (findSignForm) {
        findSignForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const month = parseInt(birthMonthSelect.value);
            const day = parseInt(birthDaySelect.value);
            const sign = getSignByDate(month, day);
            renderZodiacCard(sign);
            showSection('result');
        });
    }

    if (calculateCompBtn) {
        calculateCompBtn.addEventListener('click', () => {
            const s1Id = compSign1Select.value;
            const s2Id = compSign2Select.value;
            const result = calculateCompatibility(s1Id, s2Id);
            renderCompatibility(result);
        });
    }
}

function renderZodiacCard(sign) {
    const container = document.getElementById('zodiac-card-container');
    const templateEl = document.getElementById('tpl-zodiac-card');
    if (!container || !templateEl) return;

    const tpl = templateEl.content.cloneNode(true);
    
    tpl.querySelector('.zodiac-symbol-glow').textContent = sign.symbol;
    tpl.querySelector('.zodiac-name').textContent = sign.name;
    tpl.querySelector('.zodiac-element').textContent = `Élément : ${sign.element}`;
    tpl.querySelector('.zodiac-planet').textContent = sign.rulingPlanet;
    tpl.querySelector('.zodiac-quote').textContent = `"${sign.quote}"`;
    tpl.querySelector('.zodiac-desc').textContent = sign.description;
    
    const traitsContainer = tpl.querySelector('.zodiac-traits');
    sign.traits.forEach(t => {
        const span = document.createElement('span');
        span.className = "px-3 py-1 bg-blue-900/40 text-blue-200 rounded-lg text-sm border border-blue-500/20";
        span.textContent = t;
        traitsContainer.appendChild(span);
    });

    tpl.querySelector('.back-to-home').addEventListener('click', () => showSection('home'));

    container.innerHTML = '';
    container.appendChild(tpl);
    lucide.createIcons();
}

function renderExplorer() {
    const grid = document.getElementById('explorer-grid');
    if (!grid) return;
    ZODIAC_SIGNS.forEach(sign => {
        const btn = document.createElement('button');
        btn.className = "glass-card p-6 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95";
        btn.innerHTML = `
            <span class="text-5xl" style="filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))">${sign.symbol}</span>
            <span class="font-bold text-white">${sign.name}</span>
            <span class="text-[10px] uppercase tracking-widest text-violet-400">${sign.element}</span>
        `;
        btn.addEventListener('click', () => {
            renderZodiacCard(sign);
            showSection('result');
        });
        grid.appendChild(btn);
    });
}

function calculateCompatibility(s1Id, s2Id) {
    const s1 = ZODIAC_SIGNS.find(s => s.id === s1Id);
    const s2 = ZODIAC_SIGNS.find(s => s.id === s2Id);
    if (s1Id === s2Id) return { percentage: 85, description: "Une connexion miroir intense." };
    if (s1.compatibleWith.includes(s2Id)) return { percentage: 92, description: "Alliance céleste !" };
    return { percentage: 60, description: "Une relation qui demande des compromis." };
}

function renderCompatibility(result) {
    const container = document.getElementById('compatibility-result');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col items-center py-8 fade-in">
            <div class="relative w-48 h-48 mb-6">
                <svg class="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e1b4b" stroke-width="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="8" stroke-linecap="round" 
                            stroke-dasharray="283" stroke-dashoffset="${283 - (283 * result.percentage) / 100}" 
                            transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1.5s ease-out" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-4xl font-bold text-white">${result.percentage}%</span>
                </div>
            </div>
            <p class="text-center text-violet-100 italic">"${result.description}"</p>
        </div>
    `;
}

// --- Passport Logic ---
function setupPassport() {
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                userPhoto = ev.target.result;
                if (photoPreview) photoPreview.innerHTML = `<img src="${userPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:0.5rem">`;
                updatePassportPreview();
            };
            reader.readAsDataURL(file);
        });
    }

    genderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            genderButtons.forEach(b => b.classList.remove('active-gender'));
            btn.classList.add('active-gender');
            currentGender = btn.getAttribute('data-gender');
            updatePassportPreview();
        });
    });

    const inputs = ['pass-firstname', 'pass-lastname'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePassportPreview);
    });
    if (passSignSelect) passSignSelect.addEventListener('change', updatePassportPreview);

    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const node = document.getElementById('passport-card');
            if (!node) return;

            downloadBtn.innerText = "Génération...";
            downloadBtn.disabled = true;

            try {
                // Important pour laisser le temps au DOM de se stabiliser
                await new Promise(r => setTimeout(r, 500));
                
                const dataUrl = await htmlToImage.toPng(node, {
                    cacheBust: true,
                    pixelRatio: 2,
                    backgroundColor: null,
                    skipAutoScale: true
                });

                const link = document.createElement('a');
                link.download = `Passport_Astral.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error("Erreur export image:", err);
            } finally {
                downloadBtn.innerHTML = `<i data-lucide="download"></i> Télécharger`;
                downloadBtn.disabled = false;
                lucide.createIcons();
            }
        });
    }
    updatePassportPreview();
}

function updatePassportPreview() {
    const fname = document.getElementById('pass-firstname')?.value || 'NON DÉFINI';
    const lname = document.getElementById('pass-lastname')?.value || 'NON DÉFINI';
    const signId = passSignSelect?.value;
    const sign = ZODIAC_SIGNS.find(s => s.id === signId) || ZODIAC_SIGNS[0];
    const genderChar = currentGender === 'Homme' ? 'M' : currentGender === 'Femme' ? 'F' : 'X';
    const container = document.getElementById('passport-capture-area');
    
    if (!container) return;

    container.innerHTML = `
        <div class="passport-container relative shadow-2xl" id="passport-card" style="border: 2px solid #d4af37; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
            <div class="flex justify-between items-start mb-4">
                <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-widest opacity-70">Cosmic Identification</span>
                    <h2 class="text-xl font-black tracking-widest text-white">PASSPORT</h2>
                </div>
                <div class="text-3xl" style="color: #d4af37">${sign.symbol}</div>
            </div>
            <div class="flex gap-4 mb-4">
                <div class="passport-photo-box" style="border: 1px solid #d4af37; background: rgba(0,0,0,0.3); width:80px; height:100px; overflow:hidden;">
                    ${userPhoto ? `<img src="${userPhoto}" class="w-full h-full object-cover">` : `<div class="flex items-center justify-center h-full opacity-20"><i data-lucide="stars"></i></div>`}
                </div>
                <div class="flex-1 flex flex-col justify-around">
                    <div>
                        <p class="text-[7px] text-[#d4af37] uppercase">Nom / Surname</p>
                        <p class="text-white font-bold text-sm">${lname.toUpperCase()}</p>
                    </div>
                    <div>
                        <p class="text-[7px] text-[#d4af37] uppercase">Prénom / Given Name</p>
                        <p class="text-white font-bold text-sm">${fname.toUpperCase()}</p>
                    </div>
                    <div class="flex gap-4">
                        <div><p class="text-[7px] text-[#d4af37]">Sexe</p><p class="text-white font-bold">${genderChar}</p></div>
                        <div><p class="text-[7px] text-[#d4af37]">Signe</p><p class="text-white font-bold">${sign.name}</p></div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="bg-black/20 p-2 rounded"><p class="text-[7px] text-[#d4af37]">Élément</p><p class="text-white text-[10px]">${sign.element}</p></div>
                <div class="bg-black/20 p-2 rounded"><p class="text-[7px] text-[#d4af37]">Planète</p><p class="text-white text-[10px]">${sign.rulingPlanet}</p></div>
            </div>
            <div class="mt-auto pt-4 font-mono text-[7px] opacity-50 text-white">
                P<FRA${lname.substring(0,5)}<<<<<<<<<<<<<<<<<<<<<<br>${sign.name.toUpperCase()}<<<<<<<<<<<<<<<<
            </div>
        </div>
    `;
    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);
