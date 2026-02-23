// ============================================================
// Retail TRACE — Astha Feed Edition
// Mock data: 8 districts, 24 upazilas, 32 bazars, 100+ dealers
// ============================================================

export interface RTDistrict {
    id: string;
    name: string;
    division: string;
    center: { lat: number; lng: number };
}

export interface RTUpazila {
    id: string;
    name: string;
    districtId: string;
    center: { lat: number; lng: number };
}

export interface RTBazar {
    id: string;
    name: string;
    upazilaId: string;
    districtId: string;
    location: { lat: number; lng: number };
    type: 'poultry' | 'fish' | 'mixed' | 'general';
    dealerCount?: number;
}

export interface RTDealer {
    id: string;
    name: string;
    ownerName: string;
    phone: string;
    type: 'active' | 'prospect' | 'inactive' | 'declining';
    districtId: string;
    upazilaId: string;
    bazarId: string;
    location: { lat: number; lng: number };
    products: string[];
    monthlyOrder: number;
    lastVisit: string;
    assignedSR: string;
}

export interface RTSR {
    id: string;
    name: string;
    phone: string;
    designation: 'SR' | 'DSR';
    districtId: string;
    status: 'active' | 'idle' | 'offline';
    location: { lat: number; lng: number };
    dealerCount: number;
    monthlySales: number;
    target: number;
}

// ─── DISTRICTS ────────────────────────────────────────────────
export const districts: RTDistrict[] = [
    { id: 'd1', name: 'Rajshahi', division: 'Rajshahi', center: { lat: 24.3745, lng: 88.6042 } },
    { id: 'd2', name: 'Natore', division: 'Rajshahi', center: { lat: 24.4206, lng: 89.0000 } },
    { id: 'd3', name: 'Naogaon', division: 'Rajshahi', center: { lat: 24.7936, lng: 88.9318 } },
    { id: 'd4', name: 'Chapainawabganj', division: 'Rajshahi', center: { lat: 24.5965, lng: 88.2776 } },
    { id: 'd5', name: 'Bogura', division: 'Rajshahi', center: { lat: 24.8466, lng: 89.3773 } },
    { id: 'd6', name: 'Pabna', division: 'Rajshahi', center: { lat: 24.0064, lng: 89.2372 } },
    { id: 'd7', name: 'Rangpur', division: 'Rangpur', center: { lat: 25.7439, lng: 89.2752 } },
    { id: 'd8', name: 'Dinajpur', division: 'Rangpur', center: { lat: 25.6279, lng: 88.6332 } },
];

// ─── UPAZILAS (3 per district = 24) ───────────────────────────
export const upazilas: RTUpazila[] = [
    // Rajshahi
    { id: 'u1', name: 'Rajshahi Sadar (Boalia)', districtId: 'd1', center: { lat: 24.3750, lng: 88.5900 } },
    { id: 'u2', name: 'Shah Makhdum', districtId: 'd1', center: { lat: 24.3620, lng: 88.6300 } },
    { id: 'u3', name: 'Paba', districtId: 'd1', center: { lat: 24.3350, lng: 88.6350 } },
    // Natore
    { id: 'u4', name: 'Natore Sadar', districtId: 'd2', center: { lat: 24.4100, lng: 89.0000 } },
    { id: 'u5', name: 'Baraigram', districtId: 'd2', center: { lat: 24.3580, lng: 89.0800 } },
    { id: 'u6', name: 'Singra', districtId: 'd2', center: { lat: 24.4800, lng: 89.1400 } },
    // Naogaon
    { id: 'u7', name: 'Naogaon Sadar', districtId: 'd3', center: { lat: 24.7950, lng: 88.9300 } },
    { id: 'u8', name: 'Manda', districtId: 'd3', center: { lat: 24.7100, lng: 88.8500 } },
    { id: 'u9', name: 'Raninagar', districtId: 'd3', center: { lat: 24.7300, lng: 88.9700 } },
    // Chapainawabganj
    { id: 'u10', name: 'Chapainawabganj Sadar', districtId: 'd4', center: { lat: 24.5960, lng: 88.2780 } },
    { id: 'u11', name: 'Shibganj', districtId: 'd4', center: { lat: 24.6400, lng: 88.3500 } },
    { id: 'u12', name: 'Gomastapur', districtId: 'd4', center: { lat: 24.7200, lng: 88.2800 } },
    // Bogura
    { id: 'u13', name: 'Bogura Sadar', districtId: 'd5', center: { lat: 24.8500, lng: 89.3700 } },
    { id: 'u14', name: 'Sherpur', districtId: 'd5', center: { lat: 24.7800, lng: 89.4000 } },
    { id: 'u15', name: 'Shibganj (Bogura)', districtId: 'd5', center: { lat: 24.8200, lng: 89.3200 } },
    // Pabna
    { id: 'u16', name: 'Pabna Sadar', districtId: 'd6', center: { lat: 24.0060, lng: 89.2400 } },
    { id: 'u17', name: 'Ishwardi', districtId: 'd6', center: { lat: 24.1300, lng: 89.0700 } },
    { id: 'u18', name: 'Atgharia', districtId: 'd6', center: { lat: 24.0500, lng: 89.2800 } },
    // Rangpur
    { id: 'u19', name: 'Rangpur Sadar', districtId: 'd7', center: { lat: 25.7450, lng: 89.2750 } },
    { id: 'u20', name: 'Mithapukur', districtId: 'd7', center: { lat: 25.6100, lng: 89.2800 } },
    { id: 'u21', name: 'Pirganj', districtId: 'd7', center: { lat: 25.8500, lng: 89.3500 } },
    // Dinajpur
    { id: 'u22', name: 'Dinajpur Sadar', districtId: 'd8', center: { lat: 25.6280, lng: 88.6330 } },
    { id: 'u23', name: 'Birampur', districtId: 'd8', center: { lat: 25.5000, lng: 88.6000 } },
    { id: 'u24', name: 'Parbatipur', districtId: 'd8', center: { lat: 25.6700, lng: 88.7500 } },
];

// ─── BAZARS (32 total ≈ 4 per district) ──────────────────────
export const bazars: RTBazar[] = [
    // Rajshahi
    { id: 'b1', name: 'Shaheb Bazar', upazilaId: 'u1', districtId: 'd1', location: { lat: 24.3753, lng: 88.5985 }, type: 'general' },
    { id: 'b2', name: 'Boalia Bazar', upazilaId: 'u1', districtId: 'd1', location: { lat: 24.3810, lng: 88.5850 }, type: 'poultry' },
    { id: 'b3', name: 'Laxmipur Haat', upazilaId: 'u2', districtId: 'd1', location: { lat: 24.3580, lng: 88.6250 }, type: 'mixed' },
    { id: 'b4', name: 'Paba Bazar', upazilaId: 'u3', districtId: 'd1', location: { lat: 24.3400, lng: 88.6400 }, type: 'fish' },
    // Natore
    { id: 'b5', name: 'Natore Sadar Bazar', upazilaId: 'u4', districtId: 'd2', location: { lat: 24.4150, lng: 88.9950 }, type: 'general' },
    { id: 'b6', name: 'Baraigram Haat', upazilaId: 'u5', districtId: 'd2', location: { lat: 24.3600, lng: 89.0750 }, type: 'poultry' },
    { id: 'b7', name: 'Singra Bazar', upazilaId: 'u6', districtId: 'd2', location: { lat: 24.4830, lng: 89.1350 }, type: 'mixed' },
    { id: 'b8', name: 'Gurudaspur Haat', upazilaId: 'u4', districtId: 'd2', location: { lat: 24.4300, lng: 89.0200 }, type: 'fish' },
    // Naogaon
    { id: 'b9', name: 'Naogaon Central Bazar', upazilaId: 'u7', districtId: 'd3', location: { lat: 24.7980, lng: 88.9250 }, type: 'general' },
    { id: 'b10', name: 'Manda Haat', upazilaId: 'u8', districtId: 'd3', location: { lat: 24.7150, lng: 88.8450 }, type: 'poultry' },
    { id: 'b11', name: 'Raninagar Bazar', upazilaId: 'u9', districtId: 'd3', location: { lat: 24.7350, lng: 88.9650 }, type: 'mixed' },
    { id: 'b12', name: 'Patnitala Haat', upazilaId: 'u7', districtId: 'd3', location: { lat: 24.8100, lng: 88.9000 }, type: 'fish' },
    // Chapainawabganj
    { id: 'b13', name: 'Chapainawabganj Bazar', upazilaId: 'u10', districtId: 'd4', location: { lat: 24.5980, lng: 88.2750 }, type: 'general' },
    { id: 'b14', name: 'Shibganj Haat', upazilaId: 'u11', districtId: 'd4', location: { lat: 24.6420, lng: 88.3480 }, type: 'poultry' },
    { id: 'b15', name: 'Gomastapur Bazar', upazilaId: 'u12', districtId: 'd4', location: { lat: 24.7220, lng: 88.2750 }, type: 'mixed' },
    { id: 'b16', name: 'Kansat Haat', upazilaId: 'u11', districtId: 'd4', location: { lat: 24.6500, lng: 88.3650 }, type: 'general' },
    // Bogura
    { id: 'b17', name: 'Bogura Satmatha Bazar', upazilaId: 'u13', districtId: 'd5', location: { lat: 24.8520, lng: 89.3720 }, type: 'general' },
    { id: 'b18', name: 'Sherpur Bazar', upazilaId: 'u14', districtId: 'd5', location: { lat: 24.7820, lng: 89.3950 }, type: 'poultry' },
    { id: 'b19', name: 'Shibganj Bazar (Bogura)', upazilaId: 'u15', districtId: 'd5', location: { lat: 24.8220, lng: 89.3150 }, type: 'mixed' },
    { id: 'b20', name: 'Mahasthangarh Haat', upazilaId: 'u15', districtId: 'd5', location: { lat: 24.8350, lng: 89.3050 }, type: 'fish' },
    // Pabna
    { id: 'b21', name: 'Pabna Sadar Bazar', upazilaId: 'u16', districtId: 'd6', location: { lat: 24.0080, lng: 89.2350 }, type: 'general' },
    { id: 'b22', name: 'Ishwardi Haat', upazilaId: 'u17', districtId: 'd6', location: { lat: 24.1320, lng: 89.0680 }, type: 'poultry' },
    { id: 'b23', name: 'Atgharia Bazar', upazilaId: 'u18', districtId: 'd6', location: { lat: 24.0520, lng: 89.2770 }, type: 'mixed' },
    { id: 'b24', name: 'Chatmohar Haat', upazilaId: 'u16', districtId: 'd6', location: { lat: 24.0200, lng: 89.2500 }, type: 'fish' },
    // Rangpur
    { id: 'b25', name: 'Rangpur Central Bazar', upazilaId: 'u19', districtId: 'd7', location: { lat: 25.7480, lng: 89.2700 }, type: 'general' },
    { id: 'b26', name: 'Mithapukur Haat', upazilaId: 'u20', districtId: 'd7', location: { lat: 25.6120, lng: 89.2780 }, type: 'poultry' },
    { id: 'b27', name: 'Pirganj Bazar', upazilaId: 'u21', districtId: 'd7', location: { lat: 25.8520, lng: 89.3480 }, type: 'mixed' },
    { id: 'b28', name: 'Badarganj Haat', upazilaId: 'u19', districtId: 'd7', location: { lat: 25.7700, lng: 89.3000 }, type: 'fish' },
    // Dinajpur
    { id: 'b29', name: 'Dinajpur Central Bazar', upazilaId: 'u22', districtId: 'd8', location: { lat: 25.6300, lng: 88.6300 }, type: 'general' },
    { id: 'b30', name: 'Birampur Haat', upazilaId: 'u23', districtId: 'd8', location: { lat: 25.5020, lng: 88.5980 }, type: 'poultry' },
    { id: 'b31', name: 'Parbatipur Bazar', upazilaId: 'u24', districtId: 'd8', location: { lat: 25.6720, lng: 88.7480 }, type: 'mixed' },
    { id: 'b32', name: 'Fulbari Haat', upazilaId: 'u22', districtId: 'd8', location: { lat: 25.6400, lng: 88.6500 }, type: 'fish' },
];

// ─── PRODUCTS ─────────────────────────────────────────────────
export const FEED_PRODUCTS = [
    'Layer Feed Premium',
    'Broiler Starter',
    'Broiler Finisher',
    'Cattle Feed Gold',
    'Fish Feed Special',
    'Pre-Starter Crumbs',
    'Layer Feed Standard',
    'Duck Feed Mix',
];

// ─── BENGALI NAMES ────────────────────────────────────────────
const firstNames = [
    'Abdul', 'Mohammad', 'Md.', 'Rahim', 'Kamal', 'Jamal', 'Nasir', 'Habib',
    'Rafiq', 'Shahin', 'Tariq', 'Imran', 'Faruk', 'Sohel', 'Anis', 'Zahir',
    'Mamun', 'Rasel', 'Sumon', 'Sabbir', 'Rubel', 'Milon', 'Belal', 'Alamgir',
    'Shafiq', 'Delwar', 'Anwar', 'Ruhul', 'Noor', 'Mizanur', 'Moinul', 'Khokon',
];
const lastNames = [
    'Hossain', 'Rahman', 'Islam', 'Alam', 'Uddin', 'Ahmed', 'Khan', 'Miah',
    'Kabir', 'Karim', 'Sarker', 'Ali', 'Chowdhury', 'Begum', 'Khatun', 'Sheikh',
];
const feedShopPrefixes = [
    'Feed Centre', 'Feed Store', 'Agro Hub', 'Feed Mart', 'Poultry Feed',
    'Agro Centre', 'Feed House', 'Feed Point', 'Agro Feed', 'Feed Supply',
    'Krishi Feed', 'Feed Corner', 'Feed Depot', 'Matsya Feed', 'Agro Mart',
];

// Seeded pseudo-random for determinism
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
    return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => rand() - 0.5);
    return shuffled.slice(0, n);
}

function jitter(base: number, range: number): number {
    return base + (rand() - 0.5) * range;
}

// ─── GENERATE 100+ DEALERS ───────────────────────────────────
function generateDealers(): RTDealer[] {
    const dealers: RTDealer[] = [];
    const types: RTDealer['type'][] = ['active', 'active', 'active', 'prospect', 'inactive', 'declining'];
    const srNames = [
        'Rahim Uddin', 'Kamal Hossain', 'Jamal Ahmed', 'Fatema Begum', 'Mizanur Rahman',
        'Nasrin Akter', 'Tariqul Islam', 'Habibur Khan', 'Sohel Miah', 'Rasel Sarker',
        'Imran Kabir', 'Sumon Ali', 'Faruk Sheikh', 'Rubel Hossain', 'Anis Rahman',
    ];

    let dealerId = 1;

    for (const bazar of bazars) {
        // 3–5 dealers per bazar → ~128 total
        const dealerCount = 3 + Math.floor(rand() * 3);

        for (let j = 0; j < dealerCount; j++) {
            const firstName = pick(firstNames);
            const lastName = pick(lastNames);
            const ownerName = `${firstName} ${lastName}`;
            const shopPrefix = pick(feedShopPrefixes);
            const dealerType = pick(types);

            const monthlyOrder =
                dealerType === 'active' ? 50000 + Math.floor(rand() * 200000) :
                    dealerType === 'declining' ? 10000 + Math.floor(rand() * 40000) :
                        dealerType === 'prospect' ? 0 :
                            0;

            const products =
                dealerType === 'active' ? pickN(FEED_PRODUCTS, 2 + Math.floor(rand() * 3)) :
                    dealerType === 'declining' ? pickN(FEED_PRODUCTS, 1) :
                        [];

            const daysAgo = Math.floor(rand() * 30);
            const lastVisitDate = new Date();
            lastVisitDate.setDate(lastVisitDate.getDate() - daysAgo);

            dealers.push({
                id: `rtd-${dealerId}`,
                name: `${bazar.name} ${shopPrefix}`,
                ownerName,
                phone: `+880-171${String(1000000 + dealerId).slice(1)}`,
                type: dealerType,
                districtId: bazar.districtId,
                upazilaId: bazar.upazilaId,
                bazarId: bazar.id,
                location: {
                    lat: jitter(bazar.location.lat, 0.012),
                    lng: jitter(bazar.location.lng, 0.012),
                },
                products,
                monthlyOrder,
                lastVisit: lastVisitDate.toISOString().split('T')[0],
                assignedSR: pick(srNames),
            });

            dealerId++;
        }
    }

    return dealers;
}

// ─── GENERATE 15 SRs ─────────────────────────────────────────
function generateSRs(): RTSR[] {
    const srData = [
        { name: 'Rahim Uddin', districtId: 'd1', designation: 'SR' as const },
        { name: 'Kamal Hossain', districtId: 'd1', designation: 'SR' as const },
        { name: 'Jamal Ahmed', districtId: 'd2', designation: 'SR' as const },
        { name: 'Fatema Begum', districtId: 'd2', designation: 'DSR' as const },
        { name: 'Mizanur Rahman', districtId: 'd3', designation: 'SR' as const },
        { name: 'Nasrin Akter', districtId: 'd3', designation: 'SR' as const },
        { name: 'Tariqul Islam', districtId: 'd4', designation: 'SR' as const },
        { name: 'Habibur Khan', districtId: 'd4', designation: 'DSR' as const },
        { name: 'Sohel Miah', districtId: 'd5', designation: 'SR' as const },
        { name: 'Rasel Sarker', districtId: 'd5', designation: 'SR' as const },
        { name: 'Imran Kabir', districtId: 'd6', designation: 'SR' as const },
        { name: 'Sumon Ali', districtId: 'd6', designation: 'DSR' as const },
        { name: 'Faruk Sheikh', districtId: 'd7', designation: 'SR' as const },
        { name: 'Rubel Hossain', districtId: 'd7', designation: 'SR' as const },
        { name: 'Anis Rahman', districtId: 'd8', designation: 'SR' as const },
    ];

    return srData.map((sr, i) => {
        const dist = districts.find(d => d.id === sr.districtId)!;
        const statuses: RTSR['status'][] = ['active', 'active', 'active', 'idle', 'offline'];
        return {
            id: `sr-${i + 1}`,
            name: sr.name,
            phone: `+880-181${String(1000000 + i + 1).slice(1)}`,
            designation: sr.designation,
            districtId: sr.districtId,
            status: pick(statuses),
            location: {
                lat: jitter(dist.center.lat, 0.03),
                lng: jitter(dist.center.lng, 0.03),
            },
            dealerCount: 5 + Math.floor(rand() * 10),
            monthlySales: 100000 + Math.floor(rand() * 500000),
            target: 300000 + Math.floor(rand() * 300000),
        };
    });
}

// Pre-generate for stable reference
export const rtDealers: RTDealer[] = generateDealers();
export const rtSRs: RTSR[] = generateSRs();

// ─── HELPERS ──────────────────────────────────────────────────
export function getDistrictById(id: string) { return districts.find(d => d.id === id); }
export function getUpazilasForDistrict(districtId: string) { return upazilas.filter(u => u.districtId === districtId); }
export function getBazarsForUpazila(upazilaId: string) { return bazars.filter(b => b.upazilaId === upazilaId); }
export function getBazarsForDistrict(districtId: string) { return bazars.filter(b => b.districtId === districtId); }
export function getDealersForBazar(bazarId: string) { return rtDealers.filter(d => d.bazarId === bazarId); }
export function getDealersForUpazila(upazilaId: string) { return rtDealers.filter(d => d.upazilaId === upazilaId); }
export function getDealersForDistrict(districtId: string) { return rtDealers.filter(d => d.districtId === districtId); }

export function getDealerStats() {
    const total = rtDealers.length;
    const active = rtDealers.filter(d => d.type === 'active').length;
    const prospect = rtDealers.filter(d => d.type === 'prospect').length;
    const inactive = rtDealers.filter(d => d.type === 'inactive').length;
    const declining = rtDealers.filter(d => d.type === 'declining').length;
    const totalSales = rtDealers.reduce((s, d) => s + d.monthlyOrder, 0);
    return { total, active, prospect, inactive, declining, totalSales };
}

export function getSRStats() {
    const total = rtSRs.length;
    const active = rtSRs.filter(s => s.status === 'active').length;
    const totalSales = rtSRs.reduce((s, sr) => s + sr.monthlySales, 0);
    const totalTarget = rtSRs.reduce((s, sr) => s + sr.target, 0);
    return { total, active, totalSales, totalTarget };
}
