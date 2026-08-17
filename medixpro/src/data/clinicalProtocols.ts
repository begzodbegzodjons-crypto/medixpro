import { ClinicalProtocol } from '../types';

export const DEFAULT_CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: 'proto_hyp',
    name: 'Gipertoniya Kasalligi (II-bosqich, O\'rtacha xavf)',
    category: 'Kardiologiya',
    icdCode: 'I10',
    complaints: 'Boshning ensa sohasida og\'riq, bosh aylanishi, quloqda shovqin, ko\'z oldida qora dog\'lar paydo bo\'lishi, umumiy holsizlik.',
    anamnesis: 'Qon bosimi oxirgi 1-2 yil davomida 150-160/95 mm sim.ust. gacha ko\'tarilib turadi. Doimiy gipotenziv dorilar qabul qilmagan yoki tartibsiz ichgan.',
    diagnosis: 'Gipertoniya kasalligi II-bosqich, 2-darajali arterial gipertenziya, o\'rtacha/yuqori xavf guruhi.',
    treatmentPlan: 'Osh tuzini sutkasiga 4-5 g gacha cheklash (Stol № 10). Jismoniy faollik (kuniga 30 daqiqa piyoda yurish). Qon bosimini ertalab va kechqurun qayd etib borish (kundalik tutish).',
    dietNumber: 'Stol № 10 (Gipoxolesterin, tuzsiz parhez)',
    followUpDays: 14,
    recommendedLabTests: ['Umumiy qon tahlili', 'Biokimyoviy tahlil (Kreatinin, Mochevina, Lipidogramma)', 'EKG xulosasi', 'Koagulogramma'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Amlodipin (Norvasc)',
        dosage: '5 mg tabletka',
        frequency: 'Kuniga 1 mahal ertalab',
        duration: '30 kun',
        instructions: 'Ovqatdan qat\'i nazar, har kuni bir vaqtda ichilsin'
      },
      {
        id: 'p2',
        drugName: 'Telmisartan (Mikardis)',
        dosage: '40 mg tabletka',
        frequency: 'Kuniga 1 mahal kechqurun',
        duration: '30 kun',
        instructions: 'Har kuni soat 20:00 da ichilsin'
      },
      {
        id: 'p3',
        drugName: 'Indapamid retard (Arifon)',
        dosage: '1.5 mg tabletka',
        frequency: 'Kuniga 1 mahal ertalab och qoringa',
        duration: '20 kun',
        instructions: 'Ko\'p miqdorda suv bilan chaynashsiz ichilsin'
      },
      {
        id: 'p4',
        drugName: 'Magnelis B6 / Magne B6',
        dosage: '1 tabletkadan',
        frequency: 'Kuniga 2 mahal',
        duration: '15 kun',
        instructions: 'Ovqat paytida 1 stakan suv bilan'
      }
    ]
  },
  {
    id: 'proto_orvi',
    name: 'O\'tkir Respirator Virusli Infeksiya (O\'RVI / Gripp)',
    category: 'Terapiya / Pediatriya',
    icdCode: 'J06.9',
    complaints: 'Tana haroratining 38.2°C gacha ko\'tarilishi, burun bitishi va oqishi, tomoqda qichishish va og\'riq, quruq yo\'tal, butun tanada va bo\'g\'imlarda qaqshash.',
    anamnesis: 'Kasallik 2 kun oldin sovqotishdan so\'ng to\'satdan boshlangan. Uyda mustaqil paratsetamol qabul qilgan.',
    diagnosis: 'O\'tkir yuqori nafas yo\'llari kataral infeksiyasi (O\'RVI), o\'rtacha og\'ir kechishi.',
    treatmentPlan: 'Yotoq rejimi (3-5 kun). Ko\'p miqdorda iliq suyuqlik ichish (kuniga 2.5-3 litr: morse, limonli va malinali choy, itburnu damlamasi). Xonani tez-tez shamollatib turish.',
    dietNumber: 'Stol № 13 (Yengil hazm bo\'luvchi vitaminlarga boy parhez)',
    followUpDays: 4,
    recommendedLabTests: ['Umumiy qon tahlili (leykotsitar formula bilan)', 'Umumiy siydik tahlili'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Ergoferon / Kagocel',
        dosage: '1 tabletkadan',
        frequency: '1-kuni 5 mahal, keyingi kunlari 3 mahal',
        duration: '5 kun',
        instructions: 'Ovqatdan 30 daqiqa oldin og\'izda so\'rib eriting'
      },
      {
        id: 'p2',
        drugName: 'Paratsetamol / Ibuprofen',
        dosage: '500 mg tabletka',
        frequency: 'Tana harorati 38.5°C dan oshganda',
        duration: '3 kun',
        instructions: 'Ovqatdan keyin 1 stakan suv bilan (sutkasiga 3 martadan oshmasin)'
      },
      {
        id: 'p3',
        drugName: 'Ksometazolin / Otrivin 0.1%',
        dosage: '1-2 tomchidan har burun katagiga',
        frequency: 'Kuniga 2-3 mahal',
        duration: '4-5 kun',
        instructions: 'Burunni sho\'r suv (Akva Maris) bilan yuvgandan so\'ng'
      },
      {
        id: 'p4',
        drugName: 'Septolete Total / Lizobakt',
        dosage: '1 tabletkadan',
        frequency: 'Kuniga 3-4 mahal',
        duration: '5-7 kun',
        instructions: 'Tomoqda asta-sekin so\'rib ichilsin, so\'ng 30 daqiqa suv ichilmasin'
      },
      {
        id: 'p5',
        drugName: 'Vitamin C (Askorbin kislotasi) 1000 mg',
        dosage: '1 suvda eruvchi shipildoq tabletka',
        frequency: 'Kuniga 1 mahal ertalab',
        duration: '7 kun',
        instructions: '1 stakan iliq suvda eritib, nonushtadan keyin ichilsin'
      }
    ]
  },
  {
    id: 'proto_bronchit',
    name: 'O\'tkir Obstruktiv Bronxit',
    category: 'Pulmonologiya',
    icdCode: 'J20.9',
    complaints: 'Ko\'krak qafasida qisilishi, qiyin ajraluvchi yiringli-shilimshiqli balg\'amli yo\'tal, tana harorati 37.8°C, nafas qisishi.',
    anamnesis: '1 haftadan beri davom etayotgan shamollash fonida yo\'tal kuchaygan va balg\'am paydo bo\'lgan.',
    diagnosis: 'O\'tkir bronxit, o\'rtacha og\'irlik darajasi, nafas yetishmovchiligi 0-I daraja.',
    treatmentPlan: 'Iliq nam ingalyatsiyalar (Nebulayzer). Ko\'krak qafasi vibratsion massaji. Chekishni qat\'iyan to\'xtatish.',
    dietNumber: 'Stol № 15 (Umumiy to\'yimli ratsion)',
    followUpDays: 7,
    recommendedLabTests: ['Umumiy qon tahlili', 'Ko\'krak qafasi Rentgenografiyasi', 'Balg\'am umumiy tahlili'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Amoksitsillin + Klavulanat (Augmentin)',
        dosage: '875/125 mg tabletka',
        frequency: 'Kuniga 2 mahal (har 12 soatda)',
        duration: '7 kun',
        instructions: 'Ovqatlanish boshida ichilsin'
      },
      {
        id: 'p2',
        drugName: 'Ambroksol (Lazolvan) 30 mg / Ingalyatsiya',
        dosage: '1 tabletkadan',
        frequency: 'Kuniga 3 mahal',
        duration: '7-10 kun',
        instructions: 'Ovqatdan keyin ko\'p miqdorda suyuqlik bilan ichilsin'
      },
      {
        id: 'p3',
        drugName: 'Berodual (Nebulayzer eritmasi)',
        dosage: '15-20 tomchi + 2 ml Natriy xlorid 0.9%',
        frequency: 'Kuniga 2 mahal nebulayzer orqali nafas olish',
        duration: '5 kun',
        instructions: 'Ingalyatsiya qilingandan so\'ng og\'iz chayilsin'
      },
      {
        id: 'p4',
        drugName: 'Probiotik (Latsidofil / Lineks)',
        dosage: '1 kapsuladan',
        frequency: 'Kuniga 2 mahal',
        duration: '10 kun',
        instructions: 'Antibiotikdan 2 soat keyin ovqat paytida'
      }
    ]
  },
  {
    id: 'proto_gastrit',
    name: 'Surunkali Gastrit / Me\'da Shilliq Qavati Yallig\'lanishi',
    category: 'Gastroenterologiya',
    icdCode: 'K29.7',
    complaints: 'Epigastral sohada ovqatdan so\'ng 30-40 daqiqa o\'tgach simillovchi og\'riq, jig\'ildon qaynashi (izjoga), nordon kekirish, qorin dam bo\'lishi, ko\'ngil aynishi.',
    anamnesis: 'Ko\'p yillardan beri noto\'g\'ri va quruq ovqatlanish, achchiq va sho\'r taomlar iste\'molidan so\'ng kuchayadi.',
    diagnosis: 'Surunkali gastrit (Helicobacter pylori assotsiatsiyalangan), giperatsid forma, zo\'rayish bosqichi.',
    treatmentPlan: 'Parhezga qat\'iy amal qilish (Stol № 1). Qovurilgan, dudlangan, achchiq, nordon, gazli ichimliklar va kofe butunlay taqiqlanadi. Ovqatni kuniga 5-6 marta kam-kamdan iliq holda iste\'mol qilish.',
    dietNumber: 'Stol № 1 (Mexanik va kimyoviy tejamkor parhez)',
    followUpDays: 14,
    recommendedLabTests: ['FGDS (Gastroskopiya)', 'Helicobacter Pylori ekspress-testi', 'Qorin bo\'shlig\'i UZI', 'Biokimyoviy tahlil (ALT, AST, Bilirubin)'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Pantoprazol / Omeprazol (Nolpaza)',
        dosage: '40 mg kapsula',
        frequency: 'Kuniga 1 mahal ertalab och qoringa',
        duration: '28 kun',
        instructions: 'Nonushtadan 30 daqiqa oldin butunligicha yutilsin'
      },
      {
        id: 'p2',
        drugName: 'Gaviscon / Almagel Neo',
        dosage: '1 qoshiq (10 ml) / suspenziya',
        frequency: 'Kuniga 3 mahal ovqatdan 1 soat keyin va uyqudan oldin',
        duration: '14 kun',
        instructions: 'Jig\'ildon qaynashi va og\'riq bo\'lganda ichilsin'
      },
      {
        id: 'p3',
        drugName: 'De-Nol (Vismut tripotriy disitrat)',
        dosage: '120 mg tabletka',
        frequency: 'Kuniga 2 mahal 2 tabletkadan',
        duration: '14 kun',
        instructions: 'Ovqatdan 30 daqiqa oldin suv bilan ichilsin'
      },
      {
        id: 'p4',
        drugName: 'Mezim Forte / Kreon 10000',
        dosage: '1 kapsuladan',
        frequency: 'Har asosiy ovqatlanish vaqtida',
        duration: '14 kun',
        instructions: 'Chaynashsiz ovqat bilan birga yutilsin'
      }
    ]
  },
  {
    id: 'proto_diabet',
    name: 'Qandli Diabet (2-tip, O\'rtacha og\'irlik)',
    category: 'Endokrinologiya',
    icdCode: 'E11.9',
    complaints: 'Og\'iz qurishi, chanqoqlik (kuniga 3-4 litr suv ichish), tez-tez siyish (ayniqsa tunda), terida qichishish, holsizlik va tez toliqish.',
    anamnesis: 'Qon tahlilida och qoringa glyukoza miqdori 8.8 mmol/l, glikirlangan gemoglobin (HbA1c) 7.8% aniqlangan.',
    diagnosis: 'Qandli diabet 2-tip, subkompensatsiya bosqichi, ortiqcha tana vazni (BMI 29 kg/m²).',
    treatmentPlan: 'Qandli diabet parhezi (Stol № 9). Tez hazm bo\'luvchi uglevodlar (shakar, non, xamir taomlar, shirin mevalar) keskin cheklanadi. Glyukometr yordamida qon qandini muntazam o\'lchash.',
    dietNumber: 'Stol № 9 (Uglevodlari cheklangan diabetik parhez)',
    followUpDays: 30,
    recommendedLabTests: ['Qonda glyukoza (och qoringa va ovqatdan keyin)', 'Glikirlangan gemoglobin (HbA1c)', 'Siydik umumiy tahlili (ketonlar va oqsil)', 'Lipid spektri'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Metformin XR (Glucophage Long)',
        dosage: '1000 mg tabletka',
        frequency: 'Kuniga 1 mahal kechki ovqat paytida',
        duration: 'Doimiy qabul',
        instructions: 'Kechki ovqat paytida yoki darhol undan so\'ng yutilsin'
      },
      {
        id: 'p2',
        drugName: 'Empagliflozin (Jardiance)',
        dosage: '10 mg tabletka',
        frequency: 'Kuniga 1 mahal ertalab',
        duration: '30 kun',
        instructions: 'Nonushta paytida 1 stakan suv bilan'
      },
      {
        id: 'p3',
        drugName: 'Alfa-lipoik kislota (Tioktatsid 600 HR)',
        dosage: '600 mg tabletka',
        frequency: 'Kuniga 1 mahal ertalab och qoringa',
        duration: '30 kun',
        instructions: 'Nonushtadan 30 daqiqa oldin ichilsin (diabetik polineyropatiya profilaktikasi)'
      }
    ]
  },
  {
    id: 'proto_osteo',
    name: 'Bel-Dumg\'aza Osteoxondrozi / Lyumboishialgiya',
    category: 'Nevrologiya',
    icdCode: 'M42.9',
    complaints: 'Bel sohasida o\'tkir sanchuvchi og\'riq, og\'riqning o\'ng/chap oyoq orqa yuzasiga uzatilishi, harakatlanishning cheklanishi, egilganda va o\'tirganda og\'riq kuchayishi.',
    anamnesis: 'Og\'ir yuk ko\'tarish yoki noqulay harakatdan so\'ng belda to\'satdan qattiq og\'riq paydo bo\'lgan.',
    diagnosis: 'Umurtqa pog\'onasi bel-dumg\'aza sohasi osteoxondrozi, L4-L5 disk protruziyasi, o\'tkir lyumboishialgiya sindromi.',
    treatmentPlan: 'O\'tkir davrda qat\'iy to\'shak rejimi (qattiq ortopedik matras). Og\'ir jismoniy zo\'riqishlar taqiqlanadi. Og\'riq pasaygach LFK va fizioterapiya.',
    dietNumber: 'Stol № 15',
    followUpDays: 10,
    recommendedLabTests: ['Umurtqa pog\'onasi Bel sohasi MRT tekshiruvi', 'Umumiy qon tahlili'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Meloksikam / Ksefokam (Kserodol)',
        dosage: '15 mg tabletka',
        frequency: 'Kuniga 1 mahal ovqatdan keyin',
        duration: '7 kun',
        instructions: 'Ovqatdan so\'ng 1 stakan suv bilan ichilsin'
      },
      {
        id: 'p2',
        drugName: 'Middokalim (Tolperizon)',
        dosage: '150 mg tabletka',
        frequency: 'Kuniga 2 mahal (ertalab va kechqurun)',
        duration: '14 kun',
        instructions: 'Mushak spazmini yo\'qotish uchun ovqatdan so\'ng'
      },
      {
        id: 'p3',
        drugName: 'Milgamma / Kombilipen (B-guruhi vitaminlari)',
        dosage: '2.0 ml mushak ichiga ukol (in\'yeksiya)',
        frequency: 'Kuniga 1 mahal',
        duration: '5 kun',
        instructions: 'Ketma-ket 5 kun mushak orasiga chuqur qilinsin'
      },
      {
        id: 'p4',
        drugName: 'Diklofenak / Voltaren Emulgel 2%',
        dosage: 'Og\'riyotgan bel sohasiga surtma',
        frequency: 'Kuniga 3 mahal',
        duration: '10 kun',
        instructions: 'Bel sohasiga yengil massaj qilib surtilsin'
      }
    ]
  },
  {
    id: 'proto_anemiya',
    name: 'Temir Tanqisligi Anemiyasi (O\'rtacha og\'irlik)',
    category: 'Gematologiya / Terapiya',
    icdCode: 'D50.9',
    complaints: 'Bosh aylanishi, umumiy holsizlik, tez toliqish, yurak tez urishi, terining oqarishi va quruqlashishi, tirnoqlarning sinuvchanligi, soch to\'kilishi.',
    anamnesis: 'Qon tahlilida Gemoglobin 86 g/l, Eritrotsitlar 3.2 x 10^12/l, Rang ko\'rsatkich 0.76, Qon zardobidagi Ferritin 8 ng/ml aniqlangan.',
    diagnosis: 'Temir tanqisligi anemiyasi, o\'rtacha og\'irlik darajasi, gipoxrom mikrositar.',
    treatmentPlan: 'Temirga boy mahsulotlar (mol go\'shti, jigar, til, tuxum sarig\'i, grechka, anor, olma). Qora choy va kofeni ovqatdan keyin darhol ichmaslik.',
    dietNumber: 'Stol № 11 (Oqsil va temirga boy to\'yimli parhez)',
    followUpDays: 30,
    recommendedLabTests: ['Umumiy qon tahlili (Eritrotsitar indekslar bilan)', 'Qon zardobidagi Ferritin va Temir', 'Najasda yashirin qon tahlili'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Totema / Sorbifer Durules',
        dosage: '1 tabletka / 1 ampula ichishga',
        frequency: 'Kuniga 2 mahal ovqatdan 30 daqiqa oldin',
        duration: '60 kun',
        instructions: '1 stakan apelsin yoki anor sharbati bilan ichilsin (choy yoki sut bilan ichilmasin!)'
      },
      {
        id: 'p2',
        drugName: 'Foliy kislotasi (Folic acid)',
        dosage: '1 mg tabletka',
        frequency: 'Kuniga 2 mahal',
        duration: '30 kun',
        instructions: 'Ovqatdan keyin ichilsin'
      },
      {
        id: 'p3',
        drugName: 'Vitamin C 500 mg',
        dosage: '1 tabletkadan',
        frequency: 'Kuniga 1 mahal',
        duration: '30 kun',
        instructions: 'Temir dori bilan birga ichilsin'
      }
    ]
  },
  {
    id: 'proto_sistit',
    name: 'O\'tkir Bakterial Sistit (Siydik Yo\'llari Infeksiyasi)',
    category: 'Urologiya / Terapiya',
    icdCode: 'N30.0',
    complaints: 'Tez-tez va og\'riqli siyish, qovug\' sohasida achishish va qizish hissi, siydik rangining loyqalanishi, tana haroratining 37.4°C gacha ko\'tarilishi.',
    anamnesis: 'Sovuq suvda yuvinish yoki oyoqlardan sovqotishdan so\'ng belgilari paydo bo\'lgan.',
    diagnosis: 'O\'tkir kataral sistit, o\'rtacha og\'irlik darajasi.',
    treatmentPlan: 'Mo\'l iliq suyuqlik ichish (klyukva morselari, brusnika bargi damlamasi). Spirtli ichimliklar, achchiq va sho\'r taomlar taqiqlanadi. Qorin pastiga issiq qo\'ymaslik.',
    dietNumber: 'Stol № 7 (Siydik ayirish tizimini tejamkor parhez)',
    followUpDays: 7,
    recommendedLabTests: ['Umumiy siydik tahlili (OAM)', 'Siydik Nechiporenko tahlili', 'Qovuq va buyraklar UZI'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Fosfomitsin (Monural)',
        dosage: '3 g granulalar paketda',
        frequency: 'Bir martalik qabul (kechqurun uyqudan oldin)',
        duration: '1 kun',
        instructions: '1/3 stakan suvda eritib, qovuqni bo\'shatgandan so\'ng ichilsin'
      },
      {
        id: 'p2',
        drugName: 'Kanefron N',
        dosage: '2 draje / 50 tomchi',
        frequency: 'Kuniga 3 mahal',
        duration: '20 kun',
        instructions: 'Ko\'p miqdorda iliq suv bilan ovqatdan so\'ng'
      },
      {
        id: 'p3',
        drugName: 'No-Shpa (Drotaverin)',
        dosage: '40 mg tabletka',
        frequency: 'Qovug\'da kuchli spazm va og\'riq bo\'lganda (kuniga 2 mahal)',
        duration: '3-5 kun',
        instructions: 'Ovqatdan so\'ng ichilsin'
      }
    ]
  },
  {
    id: 'proto_tonzillit',
    name: 'O\'tkir Lakunar Tonzillit (Angina)',
    category: 'LOR / Pediatriya',
    icdCode: 'J03.9',
    complaints: 'Yutinganda tomoqda o\'tkir pichoq urgandek og\'riq, tana harorati 39.0°C, qaltirash, jag\' osti limfa tugunlarining kattalashishi va og\'rishi, quloqqa uzatiluvchi og\'riq.',
    anamnesis: 'Muzdek suv ichishdan so\'ng to\'satdan yuqori isitma va tomoq og\'rig\'i boshlangan.',
    diagnosis: 'O\'tkir lakunar angina, streptokokk etiologiyali, og\'ir intoksikatsiya sindromi.',
    treatmentPlan: 'Yotoq rejimi. Tomoqni har 2 soatda antiseptik eritmalar (Furatsilin, Xlorgeksidin, Romashka) bilan chayish. Yumshoq, iliq pyure ko\'rinishidagi ovqatlar.',
    dietNumber: 'Stol № 13',
    followUpDays: 7,
    recommendedLabTests: ['Umumiy qon tahlili', 'Tomoqdan flora va antibiotiklarga sezuvchanlik ekmasi', 'EKG tekshiruvi'],
    prescriptions: [
      {
        id: 'p1',
        drugName: 'Azitromitsin (Azitro / Sumamed)',
        dosage: '500 mg kapsula',
        frequency: 'Kuniga 1 mahal (har kuni bir vaqtda)',
        duration: '3-5 kun',
        instructions: 'Ovqatdan 1 soat oldin yoki 2 soat keyin butunlay yutilsin'
      },
      {
        id: 'p2',
        drugName: 'Tantum Verde / Ingalipt sprey',
        dosage: '2-3 purkash tomoq orqa devoriga',
        frequency: 'Kuniga 4 mahal',
        duration: '6 kun',
        instructions: 'Tomoq chayilgandan keyin purkalsin, 30 daqiqa hech narsa yemang'
      },
      {
        id: 'p3',
        drugName: 'Nimesil / Ibuprofen',
        dosage: '1 paket (100 mg)',
        frequency: 'Kuniga 2 mahal kuchli og\'riq va haroratda',
        duration: '3-4 kun',
        instructions: 'Iliq suvda eritib, ovqatdan so\'ng ichilsin'
      },
      {
        id: 'p4',
        drugName: 'Loratadin / Tsetirizin',
        dosage: '10 mg tabletka',
        frequency: 'Kuniga 1 mahal kechqurun',
        duration: '5 kun',
        instructions: 'Tomoq shishini kamaytirish uchun'
      }
    ]
  }
];
