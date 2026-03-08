export interface Wilaya {
  code: string;
  name: string;
  homeDelivery: number;
  stopDesk: number;
  communes: string[];
}

// All 58 wilayas of Algeria with communes and shipping prices
export const WILAYAS: Wilaya[] = [
  { code: "01", name: "Adrar", homeDelivery: 1200, stopDesk: 800, communes: ["Adrar", "Tamest", "Charouine", "Reggane", "In Zghmir", "Tit", "Ksar Kaddour", "Tsabit", "Timimoun", "Ouled Ahmed Timmi", "Bouda", "Aoulef"] },
  { code: "02", name: "Chlef", homeDelivery: 700, stopDesk: 400, communes: ["Chlef", "Ténès", "Boukadir", "El Karimia", "Oued Fodda", "Ain Merane", "Ouled Fares", "Chettia", "Sidi Akacha", "Taougrite", "Beni Haoua", "Oued Goussine"] },
  { code: "03", name: "Laghouat", homeDelivery: 900, stopDesk: 600, communes: ["Laghouat", "Ksar El Hirane", "Oued Morra", "Hassi Delaa", "Hassi R'Mel", "Ain Mahdi", "Tadjemout", "El Ghicha", "Brida", "Gueltat Sidi Saad", "Aflou"] },
  { code: "04", name: "Oum El Bouaghi", homeDelivery: 800, stopDesk: 500, communes: ["Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ksar Sbahi", "Sigus", "El Amiria", "Dhalaa", "Ain Fakroun", "Ain Kercha", "Meskiana", "Fkirina", "Souk Naamane"] },
  { code: "05", name: "Batna", homeDelivery: 700, stopDesk: 400, communes: ["Batna", "Barika", "N'gaous", "Merouana", "Arris", "Ain Touta", "Tazoult", "El Madher", "Chemora", "Timgad", "Seriana", "Menaa", "Ouyoun El Assafir"] },
  { code: "06", name: "Béjaïa", homeDelivery: 700, stopDesk: 400, communes: ["Béjaïa", "Akbou", "Sidi Aich", "El Kseur", "Amizour", "Tichy", "Aokas", "Kherrata", "Souk El Ténine", "Tazmalt", "Adekar", "Seddouk", "Barbacha"] },
  { code: "07", name: "Biskra", homeDelivery: 800, stopDesk: 500, communes: ["Biskra", "El Kantara", "Tolga", "Sidi Okba", "Ouled Djellal", "Sidi Khaled", "Djamorah", "Foughala", "Zeribet El Oued", "M'chounèche", "El Outaya", "Lioua"] },
  { code: "08", name: "Béchar", homeDelivery: 1200, stopDesk: 800, communes: ["Béchar", "Kenadsa", "Abadla", "Beni Ounif", "Taghit", "Lahmar", "Meridja", "Igli", "Tabelbala", "Beni Abbes"] },
  { code: "09", name: "Blida", homeDelivery: 500, stopDesk: 300, communes: ["Blida", "Boufarik", "Bouinan", "Mouzaia", "El Affroun", "Chréa", "Oued El Alleug", "Beni Mered", "Bougara", "Guerrouaou", "Chiffa", "Larbaâ"] },
  { code: "10", name: "Bouira", homeDelivery: 600, stopDesk: 400, communes: ["Bouira", "Lakhdaria", "Sour El Ghozlane", "Ain Bessem", "M'chedallah", "Bechloul", "El Hachimia", "Bordj Okhriss", "El Asnam", "Haizer", "Kadiria"] },
  { code: "11", name: "Tamanrasset", homeDelivery: 1500, stopDesk: 1000, communes: ["Tamanrasset", "In Guezzam", "In Salah", "Abalessa", "Tazrouk", "Tin Zaouatine", "Idles", "In Amguel"] },
  { code: "12", name: "Tébessa", homeDelivery: 800, stopDesk: 500, communes: ["Tébessa", "Bir El Ater", "Cheria", "El Aouinet", "Morsott", "El Kouif", "Ouenza", "Hammamet", "Boulhaf Dyr", "Negrine", "Bekkaria"] },
  { code: "13", name: "Tlemcen", homeDelivery: 800, stopDesk: 500, communes: ["Tlemcen", "Maghnia", "Ghazaouet", "Nedroma", "Remchi", "Hennaya", "Sebdou", "Mansourah", "Beni Snous", "Ain Tallout", "Honaïne", "Ouled Mimoun"] },
  { code: "14", name: "Tiaret", homeDelivery: 800, stopDesk: 500, communes: ["Tiaret", "Sougueur", "Frenda", "Mahdia", "Ksar Chellala", "Ain Deheb", "Oued Lilli", "Rahouia", "Mechraa Sfa", "Hamadia", "Dahmouni"] },
  { code: "15", name: "Tizi Ouzou", homeDelivery: 600, stopDesk: 400, communes: ["Tizi Ouzou", "Azazga", "Ain El Hammam", "Draa El Mizan", "Larbaa Nath Irathen", "Ouadhias", "Boghni", "Tigzirt", "Beni Douala", "Iferhounène", "Makouda", "Mekla", "Ouacifs"] },
  { code: "16", name: "Alger", homeDelivery: 400, stopDesk: 250, communes: ["Alger Centre", "Sidi M'hamed", "El Madania", "Belouizdad", "Bab El Oued", "Bologhine", "Casbah", "Oued Smar", "Bourouba", "Hussein Dey", "Kouba", "Bachdjerrah", "El Harrach", "Baraki", "Birtouta", "Bab Ezzouar", "Ben Aknoun", "Birkhadem", "El Biar", "Dely Ibrahim", "Hydra", "Cheraga", "Draria", "Ouled Fayet", "Ain Benian", "Zeralda", "Bordj El Kiffan", "Rouiba", "Dar El Beida", "Mohammadia", "Reghaia", "Ain Taya", "Bordj El Bahri"] },
  { code: "17", name: "Djelfa", homeDelivery: 800, stopDesk: 500, communes: ["Djelfa", "Messaad", "Ain Oussera", "Hassi Bahbah", "Moudjebara", "El Idrissia", "Birine", "Sidi Ladjel", "Charef", "Had Sahary", "Dar Chioukh", "Faidh El Botma"] },
  { code: "18", name: "Jijel", homeDelivery: 700, stopDesk: 400, communes: ["Jijel", "El Milia", "Taher", "Settara", "El Ancer", "Sidi Maarouf", "Texenna", "Chekfa", "Ziama Mansouriah", "Djimla", "Kaous", "El Aouana"] },
  { code: "19", name: "Sétif", homeDelivery: 600, stopDesk: 400, communes: ["Sétif", "El Eulma", "Ain Arnat", "Ain Oulmène", "Bougaa", "Ain El Kebira", "Ain Azel", "Bouandas", "Guenzet", "Amoucha", "Beni Aziz", "Babor", "Hammam Guergour"] },
  { code: "20", name: "Saïda", homeDelivery: 900, stopDesk: 600, communes: ["Saïda", "Ain El Hadjar", "Youb", "Ouled Khaled", "Hassasna", "Sidi Ahmed", "Doui Thabet", "Moulay Larbi", "Sidi Boubekeur"] },
  { code: "21", name: "Skikda", homeDelivery: 700, stopDesk: 400, communes: ["Skikda", "El Harrouch", "Azzaba", "Collo", "Ain Bouziane", "Tamalous", "Ben Azzouz", "Ramadane Djamel", "Sidi Mezghiche", "Oum Toub", "Filfila"] },
  { code: "22", name: "Sidi Bel Abbès", homeDelivery: 800, stopDesk: 500, communes: ["Sidi Bel Abbès", "Ain El Berd", "Telagh", "Sfisef", "Ras El Ma", "Ben Badis", "Tessala", "Moulay Slissen", "Tenira", "Sidi Ali Boussidi", "Marhoum"] },
  { code: "23", name: "Annaba", homeDelivery: 700, stopDesk: 400, communes: ["Annaba", "El Bouni", "El Hadjar", "Berrahal", "Seraïdi", "Ain El Berda", "Chetaïbi", "Cheurfa", "Oued El Aneb", "Treat", "El Eulma", "Sidi Amar"] },
  { code: "24", name: "Guelma", homeDelivery: 700, stopDesk: 400, communes: ["Guelma", "Oued Zenati", "Bouchegouf", "Héliopolis", "Ain Ben Beida", "Hammam Debagh", "Ain Sandel", "Khezaras", "Nechmaya", "Ain Makhlouf", "Houari Boumediene"] },
  { code: "25", name: "Constantine", homeDelivery: 600, stopDesk: 400, communes: ["Constantine", "El Khroub", "Ain Smara", "Hamma Bouziane", "Zighoud Youcef", "Didouche Mourad", "Ibn Ziad", "Ain Abid", "Beni Hamidene", "Ouled Rahmoun"] },
  { code: "26", name: "Médéa", homeDelivery: 600, stopDesk: 400, communes: ["Médéa", "Berrouaghia", "Ksar El Boukhari", "Tablat", "Ain Boucif", "Chahbounia", "El Omaria", "Ouamri", "Mihoub", "Beni Slimane", "Aziz", "Seghouane"] },
  { code: "27", name: "Mostaganem", homeDelivery: 700, stopDesk: 400, communes: ["Mostaganem", "Ain Nouissy", "Hassi Maméche", "Ain Tedles", "Sidi Ali", "Achaacha", "Bouguirat", "Kheir Eddine", "Sirat", "Mesra", "Mazagran"] },
  { code: "28", name: "M'sila", homeDelivery: 700, stopDesk: 400, communes: ["M'sila", "Bou Saâda", "Ain El Hadjel", "Sidi Aissa", "Hammam Dalaa", "Magra", "Berhoum", "Ouled Derradj", "Khoubana", "M'cif", "Chellal", "Ouled Sidi Brahim"] },
  { code: "29", name: "Mascara", homeDelivery: 800, stopDesk: 500, communes: ["Mascara", "Sig", "Tighennif", "Ain Fares", "Ghriss", "Bouhanifia", "Mohammadia", "Oggaz", "Oued Taria", "Ain Fekan", "Hachem", "El Bordj"] },
  { code: "30", name: "Ouargla", homeDelivery: 1000, stopDesk: 700, communes: ["Ouargla", "Hassi Messaoud", "Touggourt", "Temacine", "Taibet", "El Hadjira", "Megarine", "Ain Beida", "N'goussa", "El Alia", "Sidi Khouiled", "Rouissat"] },
  { code: "31", name: "Oran", homeDelivery: 600, stopDesk: 400, communes: ["Oran", "Es Sénia", "Bir El Djir", "Ain El Turk", "Arzew", "Bethioua", "Gdyel", "Bousfer", "Ain El Kerma", "Oued Tlelat", "Boutlelis", "Mers El Kébir", "Hassi Bounif", "Sidi Chahmi"] },
  { code: "32", name: "El Bayadh", homeDelivery: 1100, stopDesk: 700, communes: ["El Bayadh", "Brezina", "Rogassa", "Boualem", "El Abiodh Sidi Cheikh", "Bougtoub", "Stitten", "Ain El Orak", "Bougtob", "Chellala"] },
  { code: "33", name: "Illizi", homeDelivery: 1500, stopDesk: 1000, communes: ["Illizi", "Djanet", "In Amenas", "Bordj Omar Driss", "Debdeb", "In Aménas"] },
  { code: "34", name: "Bordj Bou Arréridj", homeDelivery: 700, stopDesk: 400, communes: ["Bordj Bou Arréridj", "Ras El Oued", "Bir Kasdali", "El Achir", "Medjana", "Ain Taghrout", "Bordj Ghedir", "Mansoura", "Bordj Zemoura", "Djaafra", "El Hamadia", "Hasnaoua"] },
  { code: "35", name: "Boumerdès", homeDelivery: 500, stopDesk: 300, communes: ["Boumerdès", "Bordj Menaïel", "Dellys", "Naciria", "Thénia", "Corso", "Si Mustapha", "Khemis El Khechna", "Boudouaou", "Ouled Moussa", "Hammadi", "Issers", "Baghlia", "Tidjelabine"] },
  { code: "36", name: "El Tarf", homeDelivery: 800, stopDesk: 500, communes: ["El Tarf", "El Kala", "Bouhadjar", "Ben M'hidi", "Besbes", "Dréan", "Bouteldja", "Lac des Oiseaux", "Aïn El Assel", "Zerizer", "Chihani"] },
  { code: "37", name: "Tindouf", homeDelivery: 1500, stopDesk: 1000, communes: ["Tindouf", "Oum El Assel"] },
  { code: "38", name: "Tissemsilt", homeDelivery: 800, stopDesk: 500, communes: ["Tissemsilt", "Theniet El Had", "Bordj Bounâama", "Lardjem", "Ammari", "Khemisti", "Ouled Bessam", "Layoune", "Beni Chaib", "Lazharia"] },
  { code: "39", name: "El Oued", homeDelivery: 900, stopDesk: 600, communes: ["El Oued", "Bayadha", "Guemar", "Kouinine", "Robbah", "Magrane", "Djamaa", "Oued El Alenda", "El Meghaier", "Trifaoui", "Still", "Hassani Abdelkrim"] },
  { code: "40", name: "Khenchela", homeDelivery: 800, stopDesk: 500, communes: ["Khenchela", "Kais", "Ain Touila", "Babar", "El Hamma", "Bouhmama", "El Mahmal", "Chechar", "Ouled Rechache", "Tamza", "Mtoussa", "Ensigha"] },
  { code: "41", name: "Souk Ahras", homeDelivery: 800, stopDesk: 500, communes: ["Souk Ahras", "Sedrata", "M'daourouch", "Hanancha", "Merahna", "Taoura", "Mechroha", "Oued Kebrit", "Bir Bouhouche", "Ouled Driss", "Ain Zana"] },
  { code: "42", name: "Tipaza", homeDelivery: 500, stopDesk: 300, communes: ["Tipaza", "Koléa", "Hadjout", "Cherchell", "Bou Ismaïl", "Fouka", "Ahmer El Ain", "Sidi Rached", "Gouraya", "Damous", "Nador", "Chaïba", "Attatba", "Douaouda"] },
  { code: "43", name: "Mila", homeDelivery: 700, stopDesk: 400, communes: ["Mila", "Ferdjioua", "Chelghoum Laïd", "Oued Athmania", "Ain Tine", "Grarem Gouga", "Tassadane Haddada", "Sidi Merouane", "Teleghma", "Rouached", "Terrai Baïnen"] },
  { code: "44", name: "Aïn Defla", homeDelivery: 600, stopDesk: 400, communes: ["Aïn Defla", "Miliana", "El Attaf", "Khemis Miliana", "Djelida", "Boumedfaa", "El Abadia", "Hammam Righa", "Mekhatria", "Bathia", "Ain Lechiakh", "Rouina"] },
  { code: "45", name: "Naâma", homeDelivery: 1100, stopDesk: 700, communes: ["Naâma", "Mecheria", "Ain Sefra", "Moghrar", "Tiout", "Sfissifa", "Djenien Bourezg", "Asla"] },
  { code: "46", name: "Aïn Témouchent", homeDelivery: 800, stopDesk: 500, communes: ["Aïn Témouchent", "El Malah", "Hammam Bouhadjar", "Beni Saf", "El Amria", "Ain Kihal", "Ain El Arbaa", "Oulhaça", "Aghlal", "Chentouf", "Sidi Ben Adda"] },
  { code: "47", name: "Ghardaïa", homeDelivery: 1000, stopDesk: 700, communes: ["Ghardaïa", "Metlili", "El Ménéa", "Berriane", "Guerrara", "Dhayet Bendhahoua", "Zelfana", "Bounoura", "El Atteuf", "Mansoura"] },
  { code: "48", name: "Relizane", homeDelivery: 700, stopDesk: 400, communes: ["Relizane", "Oued Rhiou", "Mazouna", "Zemmoura", "Ain Tarek", "Djidioua", "Yellel", "Ammi Moussa", "Mendes", "Ramka", "El Matmar", "Sidi M'hamed Benali"] },
  { code: "49", name: "El M'ghair", homeDelivery: 1000, stopDesk: 700, communes: ["El M'ghair", "Djamaa", "Sidi Khaled", "Still", "Oum El Tiour", "M'rara"] },
  { code: "50", name: "El Meniaa", homeDelivery: 1100, stopDesk: 700, communes: ["El Meniaa", "Hassi El Gara", "Hassi Lefhal"] },
  { code: "51", name: "Ouled Djellal", homeDelivery: 900, stopDesk: 600, communes: ["Ouled Djellal", "Sidi Khaled", "Doucen", "Chaiba", "Ras El Miad", "Besbes"] },
  { code: "52", name: "Bordj Badji Mokhtar", homeDelivery: 1500, stopDesk: 1000, communes: ["Bordj Badji Mokhtar", "Timiaouine"] },
  { code: "53", name: "Béni Abbès", homeDelivery: 1300, stopDesk: 900, communes: ["Béni Abbès", "El Ouata", "Tamtert", "Beni Ikhlef", "Kerzaz", "Ksabi"] },
  { code: "54", name: "In Salah", homeDelivery: 1500, stopDesk: 1000, communes: ["In Salah", "In Ghar", "Foggaret Ezzouaoua", "Ain El Hadjel"] },
  { code: "55", name: "In Guezzam", homeDelivery: 1500, stopDesk: 1000, communes: ["In Guezzam", "Tin Zaouatine"] },
  { code: "56", name: "Touggourt", homeDelivery: 900, stopDesk: 600, communes: ["Touggourt", "Temacine", "Taibet", "Megarine", "Blidet Amor", "Nezla", "Zaouia El Abidia", "El Hadjira"] },
  { code: "57", name: "Djanet", homeDelivery: 1500, stopDesk: 1000, communes: ["Djanet", "Bordj El Haouès"] },
  { code: "58", name: "El Meghaier", homeDelivery: 1000, stopDesk: 700, communes: ["El Meghaier", "Djamaa", "Oum El Tiour", "M'rara", "Sidi Amrane", "Sidi Khelil"] },
];

export function getWilayaByCode(code: string): Wilaya | undefined {
  return WILAYAS.find((w) => w.code === code);
}

export function getShippingPrice(wilayaCode: string, deliveryType: "home" | "stop_desk"): number {
  const wilaya = getWilayaByCode(wilayaCode);
  if (!wilaya) return 0;
  return deliveryType === "home" ? wilaya.homeDelivery : wilaya.stopDesk;
}
