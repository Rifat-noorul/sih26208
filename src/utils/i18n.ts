export type Language = 'en' | 'hi' | 'ta' | 'mr';

export interface Translations {
  wave: string;
  stones: string;
  time: string;
  getStone: string;
  returnToThrow: string;
  readyToThrow: string;
  targetInRange: string;
  adjustAim: string;
  waitVanguard: string;
  pressE: string;
  victory: string;
  failed: string;
  carryingStone: string;
  carryingNone: string;
  stoneSupply: string;
  throwPoint: string;
  scoutHidden: string;
  scoutExposed: string;
  sentryDetecting: string;
  minimapTitle: string;
  scoutLabel: string;
  vanguardLabel: string;
  impactZoneLabel: string;
  fortLabel: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    wave: 'WAVE',
    stones: 'STONES',
    time: 'TIME',
    getStone: 'GET THE STONE',
    returnToThrow: 'RETURN TO THROW POINT',
    readyToThrow: 'READY TO THROW',
    targetInRange: 'TARGET IN RANGE — PRESS E',
    adjustAim: 'ADJUST AIM — WAIT FOR ENEMY',
    waitVanguard: 'WAIT FOR VANGUARD',
    pressE: 'PRESS E',
    victory: 'AMBUSH SUCCESSFUL — ALL WAVES WIPED OUT!',
    failed: 'AMBUSH FAILED',
    carryingStone: 'CARRYING: STONE',
    carryingNone: 'CARRYING: NONE',
    stoneSupply: 'STONE SUPPLY',
    throwPoint: 'THROW POINT',
    scoutHidden: 'HIDDEN',
    scoutExposed: 'EXPOSED',
    sentryDetecting: 'SENTRY DETECTING',
    minimapTitle: 'TACTICAL RADAR',
    scoutLabel: 'SCOUT',
    vanguardLabel: 'VANGUARD',
    impactZoneLabel: 'IMPACT ZONE',
    fortLabel: 'FORT',
  },

  hi: {
    wave: 'तरंग',
    stones: 'पत्थर',
    time: 'समय',
    getStone: 'पत्थर उठाएँ',
    returnToThrow: 'फेंकने की जगह पर लौटें',
    readyToThrow: 'फेंकने के लिए तैयार',
    targetInRange: 'निशाना सीमा में है — दबाएँ E',
    adjustAim: 'निशाना समायोजित करें — दुश्मन का इंतज़ार करें',
    waitVanguard: 'दुश्मन के आने का इंतज़ार करें',
    pressE: 'दबाएँ E',
    victory: 'अंबुश सफल — सभी सेना नष्ट!',
    failed: 'अंबुश असफल',
    carryingStone: 'पास में: पत्थर',
    carryingNone: 'पास में: कोई नहीं',
    stoneSupply: 'पत्थर का ढेर',
    throwPoint: 'फेंकने का स्थान',
    scoutHidden: 'गुप्त (छिपा)',
    scoutExposed: 'दिख रहा है',
    sentryDetecting: 'पहरेदार देख रहा है',
    minimapTitle: 'सामरिक नक्शा',
    scoutLabel: 'स्काउट',
    vanguardLabel: 'दुश्मन',
    impactZoneLabel: 'प्रहार क्षेत्र',
    fortLabel: 'किला',
  },

  ta: {
    wave: 'அலை',
    stones: 'கற்கள்',
    time: 'நேரம்',
    getStone: 'கல்லை எடுக்கவும்',
    returnToThrow: 'எறியும் இடத்திற்குத் திரும்பவும்',
    readyToThrow: 'எறியத் தயாராக உள்ளது',
    targetInRange: 'இலக்கு தாக்கும் வரம்பில் உள்ளது — E அழுத்தவும்',
    adjustAim: 'குறியை சரிசெய்யவும் — பகைவனுக்கு காத்திருக்கவும்',
    waitVanguard: 'பகைவனுக்கு காத்திருக்கவும்',
    pressE: 'E அழுத்தவும்',
    victory: 'தாக்குதல் வெற்றி — படை அழிக்கப்பட்டது!',
    failed: 'தாக்குதல் தோல்வி',
    carryingStone: 'கையில்: கல்',
    carryingNone: 'கையில்: எதுவுமில்லை',
    stoneSupply: 'கல் குவியல்',
    throwPoint: 'எறியும் இடம்',
    scoutHidden: 'பதுங்கிய நிலை',
    scoutExposed: 'வெளிப்படை',
    sentryDetecting: 'காவலாளி கவனிக்கிறார்',
    minimapTitle: 'வரைபடம்',
    scoutLabel: 'சாரணர்',
    vanguardLabel: 'பகைப்படை',
    impactZoneLabel: 'தாக்குதல் இடம்',
    fortLabel: 'கோட்டை',
  },

  mr: {
    wave: 'लाट',
    stones: 'दगड',
    time: 'वेळ',
    getStone: 'दगड घ्या',
    returnToThrow: 'दगड टाकण्याच्या जागेवर जा',
    readyToThrow: 'दगड टाकण्यास तयार',
    targetInRange: 'लक्ष्य टप्प्यात आहे — E दाबा',
    adjustAim: 'लक्ष्य साधा — शत्रूची वाट पहा',
    waitVanguard: 'शत्रूची वाट पहा',
    pressE: 'E दाबा',
    victory: 'गनिमी कावा यशस्वी — शत्रूचा संहार!',
    failed: 'मोहीम अपयशी',
    carryingStone: 'हातात: दगड',
    carryingNone: 'हातात: काहीही नाही',
    stoneSupply: 'दगडांचा साठा',
    throwPoint: 'दगड टाकण्याची जागा',
    scoutHidden: 'गुप्त (लपलेला)',
    scoutExposed: 'उघडा पडला',
    sentryDetecting: 'पहरेकरी पाहत आहे',
    minimapTitle: 'रणशास्त्र नकाशा',
    scoutLabel: 'हेर (मावळा)',
    vanguardLabel: 'मुघल फौज',
    impactZoneLabel: 'प्रहार क्षेत्र',
    fortLabel: 'किल्ला',
  },
};
