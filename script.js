import { ZODIAC_SIGNS } from './data.js';

// --- State Management ---
let currentTheme = 'dark';
let isMuted = true;
let currentSign = null;
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


// --- Audio Logic ---
function setupAudio() {
    audio.volume = 0.3;
    muteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            audio.pause();
            muteIcon.setAttribute('data-lucide', 'volume-x');
        } else {
            audio.play().catch(err => console.log("Audio blocked:", err));
            muteIcon.setAttribute('data-lucide', 'volume-2');
        }
        lucide.createIcons();
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
    
    // Reset result if going back to home
    if (sectionId === 'home') {
        document.getElementById('zodiac-card-container').innerHTML = '';
    }
}

// --- Data Population ---
function populateSelects() {
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    months.forEach((m, i) => {
        const opt = new Option(m, i + 1);
        birthMonthSelect.add(opt);
    });

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

    birthMonthSelect.addEventListener('change', updateDays);
    updateDays();

    ZODIAC_SIGNS.forEach(sign => {
        compSign1Select.add(new Option(`${sign.symbol} ${sign.name}`, sign.id));
        compSign2Select.add(new Option(`${sign.symbol} ${sign.name}`, sign.id));
        passSignSelect.add(new Option(`${sign.symbol} ${sign.name}`, sign.id));
    });
    
    // Default values
    compSign1Select.value = ZODIAC_SIGNS[0].id;
    compSign2Select.value = ZODIAC_SIGNS[1].id;
}

// --- Sign Calculation ---
function getSignByDate(month, day) {
    return ZODIAC_SIGNS.find(sign => {
        if (sign.startMonth === sign.endMonth) {
            return month === sign.startMonth && day >= sign.startDay && day <= sign.endDay;
        }
        if (sign.startMonth < sign.endMonth) {
            return (month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay);
        }
        return (month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay);
    }) || ZODIAC_SIGNS[0];
}

// --- Forms Logic ---
function setupForms() {
    findSignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const month = parseInt(birthMonthSelect.value);
        const day = parseInt(birthDaySelect.value);
        const sign = getSignByDate(month, day);
        renderZodiacCard(sign);
        showSection('result');
    });

    calculateCompBtn.addEventListener('click', () => {
        const s1Id = compSign1Select.value;
        const s2Id = compSign2Select.value;
        const result = calculateCompatibility(s1Id, s2Id);
        renderCompatibility(result);
    });
}

function renderZodiacCard(sign) {
    const container = document.getElementById('zodiac-card-container');
    const tpl = document.getElementById('tpl-zodiac-card').content.cloneNode(true);
    
    tpl.querySelector('.zodiac-symbol-glow').textContent = sign.symbol;
    tpl.querySelector('.zodiac-name').textContent = sign.name;
    tpl.querySelector('.zodiac-element').textContent = `Élément : ${sign.element}`;
    tpl.querySelector('.zodiac-planet').textContent = sign.rulingPlanet;
    tpl.querySelector('.zodiac-quote').textContent = `"${sign.quote}"`;
    tpl.querySelector('.zodiac-desc').textContent = sign.description;
    tpl.querySelector('.zodiac-history').textContent = sign.history;
    
    const traitsContainer = tpl.querySelector('.zodiac-traits');
    sign.traits.forEach(t => {
        const span = document.createElement('span');
        span.className = "px-3 py-1 bg-blue-900/40 text-blue-200 rounded-lg text-sm border border-blue-500/20";
        span.textContent = t;
        traitsContainer.appendChild(span);
    });

    const compatPlus = tpl.querySelector('.zodiac-compat-plus');
    const compatMinus = tpl.querySelector('.zodiac-compat-minus');
    
    ZODIAC_SIGNS.filter(s => sign.compatibleWith.includes(s.id)).forEach(s => {
        const span = document.createElement('span');
        span.className = "text-sm text-green-200/80";
        span.textContent = `${s.symbol} ${s.name}`;
        compatPlus.appendChild(span);
    });

    ZODIAC_SIGNS.filter(s => sign.lessCompatibleWith.includes(s.id)).forEach(s => {
        const span = document.createElement('span');
        span.className = "text-sm text-red-200/80";
        span.textContent = `${s.symbol} ${s.name}`;
        compatMinus.appendChild(span);
    });

    tpl.querySelector('.back-to-home').addEventListener('click', () => showSection('home'));

    container.innerHTML = '';
    container.appendChild(tpl);
    lucide.createIcons();
}

function renderExplorer() {
    const grid = document.getElementById('explorer-grid');
    ZODIAC_SIGNS.forEach(sign => {
        const btn = document.createElement('button');
        btn.className = "glass-card p-6 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95";
        btn.innerHTML = `
            <span class="text-5xl" style="filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))">${sign.symbol}</span>
            <span class="font-bold">${sign.name}</span>
            <span class="text-[10px] uppercase tracking-widest text-violet-400">${sign.element}</span>
        `;
        btn.addEventListener('click', () => {
            renderZodiacCard(sign);
            showSection('result');
        });
        grid.appendChild(btn);
    });
}

// --- Compatibility Logic ---
function calculateCompatibility(s1Id, s2Id) {
    const s1 = ZODIAC_SIGNS.find(s => s.id === s1Id);
    const s2 = ZODIAC_SIGNS.find(s => s.id === s2Id);

    if (s1Id === s2Id) return { percentage: 85, description: "Une connexion miroir intense. Vous vous comprenez sans parler." };
    if (s1.compatibleWith.includes(s2Id)) return { percentage: 92, description: `Alliance céleste ! ${s1.compatibilityAnalysis}` };
    if (s1.lessCompatibleWith.includes(s2Id)) return { percentage: 45, description: "Des défis à relever, mais rien n'est impossible avec de la patience." };
    if (s1.element === s2.element) return { percentage: 80, description: "Une compréhension naturelle grâce à votre élément commun." };
    
    return { percentage: 60, description: "Une relation qui demande des compromis et une ouverture d'esprit." };
}

function renderCompatibility(result) {
    const container = document.getElementById('compatibility-result');
    container.innerHTML = `
        <div class="flex flex-col items-center py-8">
            <div class="relative w-48 h-48 mb-6">
                <svg class="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e1b4b" stroke-width="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="8" stroke-linecap="round" 
                            stroke-dasharray="283" stroke-dashoffset="${283 - (283 * result.percentage) / 100}" 
                            transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1.5s ease-out" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-4xl font-bold text-white">${result.percentage}%</span>
                    <span class="text-xs text-violet-300 uppercase tracking-widest">Affinité</span>
                </div>
            </div>
            <p class="text-center text-violet-100 italic max-w-xs">"${result.description}"</p>
        </div>
    `;
}

// --- Passport Logic ---
function setupPassport() {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userPhoto = e.target.result;
                photoPreview.innerHTML = `<img src="${userPhoto}" class="w-full h-full object-cover">`;
                updatePassportPreview();
            };
            reader.readAsDataURL(file);
        }
    });

    genderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            genderButtons.forEach(b => b.classList.remove('active-gender'));
            btn.classList.add('active-gender');
            currentGender = btn.getAttribute('data-gender');
            updatePassportPreview();
        });
    });

    [document.getElementById('pass-firstname'), document.getElementById('pass-lastname'), passSignSelect].forEach(el => {
        el.addEventListener('input', updatePassportPreview);
        el.addEventListener('change', updatePassportPreview);
    });

    downloadBtn.addEventListener('click', async () => {
    const area = document.getElementById('passport-capture-area');

    try {
        // attendre que toutes les images soient chargées
        const images = area.querySelectorAll('img');
        await Promise.all(
            [...images].map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => {
                    img.onload = img.onerror = res;
                });
            })
        );

        // petit délai pour stabiliser le DOM
        await new Promise(res => setTimeout(res, 100));

        const dataUrl = await htmlToImage.toPng(area, {
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: '#0a0a1a'
        });

        const link = document.createElement('a');
        link.download = `AstroPassport_${document.getElementById('pass-firstname').value || 'User'}.png`;
        link.href = dataUrl;
        link.click();

    } catch (err) {
        console.error('Export error:', err);
    }
});

    updatePassportPreview();
}

function updatePassportPreview() {
    const fname = document.getElementById('pass-firstname').value || 'NON DÉFINI';
    const lname = document.getElementById('pass-lastname').value || 'NON DÉFINI';
    const signId = passSignSelect.value;
    const sign = ZODIAC_SIGNS.find(s => s.id === signId) || ZODIAC_SIGNS[0];
    const genderChar = currentGender === 'Homme' ? 'M' : currentGender === 'Femme' ? 'F' : 'X';

     const traitsHTML = sign.traits.slice(0, 4).map(t => `
    <span style="
        padding:4px 10px;
        border-radius:20px;
        font-size:10px;
        background:rgba(139,92,246,0.2);
        border:1px solid rgba(139,92,246,0.3);
        color:#c4b5fd;
    ">
        ${t}
    </span>
`).join('');

    const container = document.getElementById('passport-capture-area');
    container.innerHTML = `
        <div class="passport-container" id="passport-card">
            <div class="flex justify-between items-start mb-6 z-10">
                <div class="flex flex-col">
                    <span class="text-[10px] uppercase tracking-[0.3em] font-bold mb-1" style="color: #a78bfa">Union Astrologique</span>
                    <h2 class="text-xl font-bold tracking-tight" style="color: #ffffff">PASSEPORT ASTRAL</h2>
                </div>
                <div class="text-3xl" style="color: #d4af37">${sign.symbol}</div>
            </div>

            <div class="flex gap-4 mb-6 z-10">
                <div class="passport-photo-box">
                    ${userPhoto ? `<img src="${userPhoto}" class="w-full h-full object-cover">` : `<span class="text-4xl" style="color: #d4af37">${sign.symbol}</span>`}
                </div>
                <div class="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <p class="passport-label">Nom / Surname</p>
                        <p class="passport-value">${lname.toUpperCase()}</p>
                    </div>
                    <div>
                        <p class="passport-label">Prénom / Given Name</p>
                        <p class="passport-value">${fname.toUpperCase()}</p>
                    </div>
                    <div class="flex gap-4">
                        <div>
                            <p class="passport-label">Sexe / Sex</p>
                            <p class="passport-value" style="font-size: 12px">${genderChar}</p>
                        </div>
                        <div>
                            <p class="passport-label">Signe / Sign</p>
                            <p class="passport-value" style="font-size: 12px">${sign.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex-1 pt-5 z-10 flex flex-col gap-4" style="border-top: 1px solid rgba(212, 175, 55, 0.2)">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="passport-label">Élément</p>
                        <p class="passport-value" style="font-size: 12px">${sign.element}</p>
                    </div>
                    <div>
                        <p class="passport-label">Planète</p>
                        <p class="passport-value" style="font-size: 12px">${sign.rulingPlanet}</p>
                    </div>
                </div>
               <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
    ${traitsHTML}
</div>

<div class="p-3 rounded-lg italic" style="background: rgba(30, 27, 75, 0.4); border: 1px solid rgba(212, 175, 55, 0.1)">
    <p class="text-[11px] text-center leading-relaxed" style="color: #e2e8f0">"${sign.quote}"</p>
</div>
            </div>

            <div class="mt-auto pt-4 z-10 flex flex-col gap-2" style="border-top: 1px solid rgba(212, 175, 55, 0.2)">
                <div class="flex justify-between items-end">
                    <p class="passport-mrz">
                        P<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< <br>
                        ${lname.padEnd(10, '<').toUpperCase()}${fname.padEnd(10, '<').toUpperCase()}<<<<<<<<<<<<<<<<<<<< <br>
                        ${sign.name.toUpperCase()}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                    </p>
                    <p class="text-[11px] italic" style="color: rgba(167, 139, 250, 0.4)">AstroGuide App</p>
                </div>
            </div>
        </div>
    `;
}

// Run init
document.addEventListener('DOMContentLoaded', init);
