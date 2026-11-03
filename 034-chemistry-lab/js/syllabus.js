/* =====================================================================
   完整課程地圖（Roadmap）
   - modules：已開放嘅實驗模組 id（對應 modules/ 入面嘅檔案）
   - next：下一批會做嘅實驗（顯示「下一批」）
   新增模組：喺 js/modules.js 加一行，再喺呢度對應課題加 id
   ===================================================================== */
export const SYLLABUS = [
  { n: 1, color: '#0ea5e9', icon: '🌍', zh: '地球', en: 'Planet Earth', subs: [
    { code: '1.1', zh: '大氣', en: 'Atmosphere', modules: ['airoxygen'],
      items: { zh: ['空氣的組成', '常見氣體的用途', '空氣的分餾'], en: ['Composition of air', 'Uses of some common gases', 'Fractional distillation of air'] } },
    { code: '1.2', zh: '海洋', en: 'The ocean', modules: ['salt'],
      items: { zh: ['海水的組成', '從海水提取食鹽及淨化水', '測試鈉離子和氯離子'], en: ['Composition of the ocean', 'Extraction of salt and purification of water', 'Tests for sodium ions and chloride ions'] } },
    { code: '1.3', zh: '岩石和礦物', en: 'Rocks and minerals', modules: ['limestone'],
      items: { zh: ['岩石和寶石', '粉筆、石灰石和大理石', '鈣鹽', '碳酸鈣的侵蝕'], en: ['Rocks and gemstones', 'Chalk, limestone and marble', 'Calcium salts', 'Erosion of calcium carbonate'] } },
  ] },
  { n: 2, color: '#8b5cf6', icon: '⚛️', zh: '微觀世界', en: 'The microscopic world', subs: [
    { code: '2.1', zh: '原子結構', en: 'Atomic structure', modules: ['atoms'],
      items: { zh: ['相對原子質量和相對同位素質量', '首 20 個元素的電子排佈'], en: ['Relative atomic mass and relative isotopic mass', 'Electronic arrangement of the first 20 elements'] } },
    { code: '2.2', zh: '周期表', en: 'The Periodic Table', modules: ['periodic'], items: { zh: ['元素的排列方法'], en: ['How the elements are arranged'] } },
    { code: '2.3', zh: '離子鍵和共價鍵', en: 'Ionic and covalent bonding', modules: ['bonding'],
      items: { zh: ['離子的顏色', '常見離子的電荷和名稱', '離子結構', '共價結構', '分子結構'], en: ['Colours of ions', 'Charges and names of common ions', 'Ionic structure', 'Covalent structure', 'Molecular structure'] } },
  ] },
  { n: 3, color: '#ea580c', icon: '🔩', zh: '金屬', en: 'Metals', subs: [
    { code: '3.1', zh: '金屬的存在和提取', en: 'Occurrence and extraction of metals', modules: ['extract'], items: { zh: ['金屬喺大自然點樣存在、點樣提取'], en: ['Where metals are found and how we extract them'] } },
    { code: '3.2', zh: '金屬的活潑性', en: 'Reactivity of metals', modules: ['metalrace'],
      items: { zh: ['金屬與稀酸反應', '金屬與氧反應生成氧化物', '金屬與冷水反應', '受熱金屬與蒸汽反應', '金屬與稀氫氯酸的反應', '金屬活潑性序列及電化序', '金屬氧化物的穩定性', '置換反應'],
        en: ['Treating metals with dilute acid', 'Metals reacting with oxygen to form oxides', 'Metals reacting with cold water', 'Heated metals reacting with steam', 'Reactions of metals with dilute hydrochloric acid', 'Reactivity series and electrochemical series', 'Stability of metal oxides', 'Displacement reactions'] } },
    { code: '3.3', zh: '反應質量', en: 'Reacting masses', modules: ['balance'], items: { zh: ['化合物中元素的質量百分比'], en: ['Percentage by mass of an element in a compound'] } },
    { code: '3.4', zh: '金屬的腐蝕及其防護', en: 'Corrosion of metals and their protection', modules: ['rust'],
      items: { zh: ['影響金屬生鏽的因素', '防止生鏽的方法', '鋁的陽極電鍍', '常見合金的成分', '保護金屬資源'], en: ['Factors affecting the rusting of metals', 'Methods of preventing rusting', 'Aluminium anodisation', 'Composition of common alloys', 'Conservation of metals'] } },
  ] },
  { n: 4, color: '#a855f7', icon: '🧪', zh: '酸和鹼', en: 'Acids and alkalis', subs: [
    { code: '4.1', zh: '酸', en: 'Acids', modules: ['acidprops'], items: { zh: ['家居常見的酸和鹼', '酸的性質'], en: ['Domestic acids and alkalis', 'Properties of acids'] } },
    { code: '4.2', zh: '鹼', en: 'Alkalis', modules: ['alkali'], items: { zh: ['鹼的性質', '鹼與金屬離子的沉澱反應'], en: ['Properties of alkalis', 'Precipitation with alkalis'] } },
    { code: '4.3', zh: '指示劑和 pH', en: 'Indicators and pH', modules: ['indicators'], items: { zh: ['常見的酸鹼指示劑', 'pH 值'], en: ['Common acid–base indicators', 'The pH scale'] } },
    { code: '4.4', zh: '中和作用和鹽的製備', en: 'Neutralisation and preparation of salts', modules: ['neutral'], items: { zh: ['中和作用', '製備鹽'], en: ['Neutralisation', 'Preparing salts'] } },
  ] },
  { n: 5, color: '#eab308', icon: '🔋', zh: '化學電池和電解', en: 'Chemical cells and electrolysis', subs: [
    { code: '5.1', zh: '簡單化學電池', en: 'Simple chemical cells', modules: ['lemon'],
      items: { zh: ['簡單化學電池', '化學電池與電解池的比較'], en: ['Simple chemical cells', 'Comparing chemical cells and electrolytic cells'] } },
    { code: '5.2', zh: '氧化還原反應', en: 'Redox reactions', modules: ['displace'], items: { zh: ['氧化和還原的分別', '常見的氧化劑', '常見的還原劑'], en: ['Differences between oxidation and reduction', 'Common oxidising agents', 'Common reducing agents'] } },
    { code: '5.3', zh: '化學電池中的反應', en: 'Reactions in chemical cells', modules: ['drycell'], items: { zh: ['鋅碳電池的結構', '鋅碳電池的化學', '不同乾電池的比較'], en: ['Structure of a zinc–carbon cell', 'Chemistry of a zinc–carbon cell', 'Comparing different dry cells'] } },
    { code: '5.4', zh: '電解', en: 'Electrolysis', modules: ['plating'], items: { zh: ['電解熔融溴化鉛(II)', '電解中離子的優先放電', '電解的應用'], en: ['Electrolysis of molten lead(II) bromide', 'Preferential discharge of ions', 'Applications of electrolysis'] } },
  ] },
  { n: 6, color: '#14b8a6', icon: '🏭', zh: '重要工業過程的產品', en: 'Products from important processes', subs: [
    { code: '6.1', zh: '氯和次氯酸鹽', en: 'Chlorine and hypochlorite', modules: ['chlorine'], items: { zh: ['氯的製造', '氯的化學性質'], en: ['Manufacture of chlorine', 'Chemical properties of chlorine'] } },
    { code: '6.2', zh: '硫酸和二氧化硫', en: 'Sulphuric acid and sulphur dioxide', modules: ['acidsugar'], items: { zh: ['硫酸的製造', '濃硫酸的性質', '二氧化硫的還原性', '氯和二氧化硫的用途'], en: ['Manufacture of sulphuric acid', 'Properties of concentrated sulphuric acid', 'Reducing properties of sulphur dioxide', 'Uses of chlorine and sulphur dioxide'] } },
    { code: '6.3', zh: '漂白劑', en: 'Bleach', modules: ['bleach'], items: { zh: ['漂白溶液的製造', '漂白劑的作用'], en: ['Manufacture of bleaching solution', 'Action of bleach'] } },
  ] },
  { n: 7, color: '#64748b', icon: '🛢️', zh: '化石燃料和碳化合物', en: 'Fossil fuels and carbon compounds', subs: [
    { code: '7.1', zh: '化石燃料', en: 'Fossil fuels', modules: ['oilfrac'], items: { zh: ['石油不同餾分的用途', '原油餾分的性質', '油餾分的裂解'], en: ['Uses of different fractions of petroleum', 'Properties of crude oil fractions', 'Cracking of oil fractions'] } },
    { code: '7.2', zh: '同系列、結構式和命名', en: 'Homologous series, structural formulae and naming', modules: ['carbonchain'], items: { zh: ['碳化合物的同系列、結構式和命名'], en: ['Homologous series, structural formulae and naming of carbon compounds'] } },
    { code: '7.3', zh: '烷和烯', en: 'Alkanes and alkenes', modules: ['bromine'], items: { zh: ['烷和烯的化學性質'], en: ['Chemical properties of alkanes and alkenes'] } },
    { code: '7.4', zh: '使用化石燃料的後果', en: 'Consequences of using fossil fuels', modules: ['acidrain'], items: { zh: ['酸雨的形成', '酸雨對建築材料的影響', '催化轉換器'], en: ['Formation of acid rain', 'Effects of acid rain on building materials', 'Catalytic converters'] } },
    { code: '7.5', zh: '醇', en: 'Alcohols', modules: ['yeast'], items: { zh: ['烷醇的化學性質', '發酵', '醋的製造'], en: ['Chemical properties of alkanols', 'Fermentation', 'Production of vinegar'] } },
  ] },
  { n: 8, color: '#ec4899', icon: '🧴', zh: '塑膠和清潔劑', en: 'Plastics and detergents', subs: [
    { code: '8.1', zh: '塑膠', en: 'Plastics', modules: ['slime'], items: { zh: ['加成聚合', '縮合聚合'], en: ['Addition polymerisation', 'Condensation polymerisation'] } },
    { code: '8.2', zh: '清潔劑', en: 'Detergents', modules: ['soap'], items: { zh: ['皂化作用', '肥皂的問題和解決方法'], en: ['Saponification', 'Soap problems and solutions'] } },
  ] },
  { n: 9, color: '#22c55e', icon: '🔍', zh: '檢測和分析', en: 'Detection and analysis', subs: [
    { code: '9.1', zh: '分離混合物', en: 'Separation of mixtures', modules: ['salt'], items: { zh: ['過濾、蒸發、結晶等分離方法'], en: ['Filtering, evaporating, crystallising and other separation methods'] } },
    { code: '9.2', zh: '物質的檢測', en: 'Detection of substances', modules: ['flametest'],
      items: { zh: ['焰色試驗', '實驗室常見物質的測試'], en: ['Flame test', 'Tests for common substances in the laboratory'] } },
  ] },
];
export const ALL_SUBS = SYLLABUS.flatMap((t) => t.subs);
