/* =====================================================================
 *  BUILT-IN BANGLADESH LOCATIONS  (works with no internet, no downloads)
 *  Used automatically if the online/downloaded list is not available.
 *
 *  Format:   # Division      @ District      (plain line) Upazila
 *  Each line is   English|বাংলা
 *  To fix a spelling or add a missing upazila: edit here, OR use
 *  Admin → Representatives → Administrative Areas (no code needed).
 * ===================================================================== */
const RAW = `
#Dhaka|ঢাকা
@Dhaka|ঢাকা
Dhamrai|ধামরাই
Dohar|দোহার
Keraniganj|কেরানীগঞ্জ
Nawabganj|নবাবগঞ্জ
Savar|সাভার
@Faridpur|ফরিদপুর
Alfadanga|আলফাডাঙ্গা
Bhanga|ভাঙ্গা
Boalmari|বোয়ালমারী
Charbhadrasan|চরভদ্রাসন
Faridpur Sadar|ফরিদপুর সদর
Madhukhali|মধুখালী
Nagarkanda|নগরকান্দা
Sadarpur|সদরপুর
Saltha|সালথা
@Gazipur|গাজীপুর
Gazipur Sadar|গাজীপুর সদর
Kaliakair|কালিয়াকৈর
Kaliganj|কালীগঞ্জ
Kapasia|কাপাসিয়া
Sreepur|শ্রীপুর
@Gopalganj|গোপালগঞ্জ
Gopalganj Sadar|গোপালগঞ্জ সদর
Kashiani|কাশিয়ানী
Kotalipara|কোটালীপাড়া
Muksudpur|মুকসুদপুর
Tungipara|টুঙ্গিপাড়া
@Kishoreganj|কিশোরগঞ্জ
Austagram|অষ্টগ্রাম
Bajitpur|বাজিতপুর
Bhairab|ভৈরব
Hossainpur|হোসেনপুর
Itna|ইটনা
Karimganj|করিমগঞ্জ
Katiadi|কটিয়াদী
Kishoreganj Sadar|কিশোরগঞ্জ সদর
Kuliarchar|কুলিয়ারচর
Mithamain|মিঠামইন
Nikli|নিকলী
Pakundia|পাকুন্দিয়া
Tarail|তাড়াইল
@Madaripur|মাদারীপুর
Kalkini|কালকিনি
Madaripur Sadar|মাদারীপুর সদর
Rajoir|রাজৈর
Shibchar|শিবচর
@Manikganj|মানিকগঞ্জ
Daulatpur|দৌলতপুর
Ghior|ঘিওর
Harirampur|হরিরামপুর
Manikganj Sadar|মানিকগঞ্জ সদর
Saturia|সাটুরিয়া
Shivalaya|শিবালয়
Singair|সিঙ্গাইর
@Munshiganj|মুন্সীগঞ্জ
Gazaria|গজারিয়া
Lohajang|লৌহজং
Munshiganj Sadar|মুন্সিগঞ্জ সদর
Sirajdikhan|সিরাজদিখান
Sreenagar|শ্রীনগর
Tongibari|টংগীবাড়ী
@Narayanganj|নারায়ণগঞ্জ
Araihazar|আড়াইহাজার
Bandar|বন্দর
Narayanganj Sadar|নারায়ণগঞ্জ সদর
Rupganj|রূপগঞ্জ
Sonargaon|সোনারগাঁ
@Narsingdi|নরসিংদী
Belabo|বেলাব
Monohardi|মনোহরদী
Narsingdi Sadar|নরসিংদী সদর
Palash|পলাশ
Raipura|রায়পুরা
Shibpur|শিবপুর
@Rajbari|রাজবাড়ী
Baliakandi|বালিয়াকান্দি
Goalandaghat|গোয়ালন্দ
Kalukhali|কালুখালী
Pangsha|পাংশা
Rajbari Sadar|রাজবাড়ী সদর
@Shariatpur|শরীয়তপুর
Bhedarganj|ভেদরগঞ্জ
Damudya|ডামুড্যা
Gosairhat|গোসাইরহাট
Naria|নড়িয়া
Shariatpur Sadar|শরীয়তপুর সদর
Zajira|জাজিরা
@Tangail|টাঙ্গাইল
Basail|বাসাইল
Bhuapur|ভূঞাপুর
Delduar|দেলদুয়ার
Dhanbari|ধনবাড়ী
Ghatail|ঘাটাইল
Gopalpur|গোপালপুর
Kalihati|কালিহাতী
Madhupur|মধুপুর
Mirzapur|মির্জাপুর
Nagarpur|নাগরপুর
Sakhipur|সখিপুর
Tangail Sadar|টাঙ্গাইল সদর
#Chattogram|চট্টগ্রাম
@Bandarban|বান্দরবান
Alikadam|আলীকদম
Bandarban Sadar|বান্দরবান সদর
Lama|লামা
Naikhongchhari|নাইক্ষ্যংছড়ি
Rowangchhari|রোয়াংছড়ি
Ruma|রুমা
Thanchi|থানচি
@Brahmanbaria|ব্রাহ্মণবাড়িয়া
Akhaura|আখাউড়া
Ashuganj|আশুগঞ্জ
Bancharampur|বাঞ্ছারামপুর
Bijoynagar|বিজয়নগর
Brahmanbaria Sadar|ব্রাহ্মণবাড়িয়া সদর
Kasba|কসবা
Nabinagar|নবীনগর
Nasirnagar|নাসিরনগর
Sarail|সরাইল
@Chandpur|চাঁদপুর
Chandpur Sadar|চাঁদপুর সদর
Faridganj|ফরিদগঞ্জ
Haimchar|হাইমচর
Haziganj|হাজীগঞ্জ
Kachua|কচুয়া
Matlab Dakshin|মতলব দক্ষিণ
Matlab Uttar|মতলব উত্তর
Shahrasti|শাহরাস্তি
@Chattogram|চট্টগ্রাম
Anwara|আনোয়ারা
Banshkhali|বাঁশখালী
Boalkhali|বোয়ালখালী
Chandanaish|চন্দনাইশ
Fatikchhari|ফটিকছড়ি
Hathazari|হাটহাজারী
Karnaphuli|কর্ণফুলী
Lohagara|লোহাগাড়া
Mirsharai|মীরসরাই
Patiya|পটিয়া
Rangunia|রাঙ্গুনিয়া
Raozan|রাউজান
Sandwip|সন্দ্বীপ
Satkania|সাতকানিয়া
Sitakunda|সীতাকুণ্ড
@Cumilla|কুমিল্লা
Barura|বরুড়া
Brahmanpara|ব্রাহ্মণপাড়া
Burichong|বুড়িচং
Chandina|চান্দিনা
Chauddagram|চৌদ্দগ্রাম
Daudkandi|দাউদকান্দি
Debidwar|দেবিদ্বার
Homna|হোমনা
Cumilla Adarsha Sadar|কুমিল্লা আদর্শ সদর
Laksam|লাকসাম
Lalmai|লালমাই
Manoharganj|মনোহরগঞ্জ
Meghna|মেঘনা
Muradnagar|মুরাদনগর
Nangalkot|নাঙ্গলকোট
Cumilla Sadar Dakshin|কুমিল্লা সদর দক্ষিণ
Titas|তিতাস
@Cox's Bazar|কক্সবাজার
Chakaria|চকরিয়া
Cox's Bazar Sadar|কক্সবাজার সদর
Kutubdia|কুতুবদিয়া
Maheshkhali|মহেশখালী
Pekua|পেকুয়া
Ramu|রামু
Teknaf|টেকনাফ
Ukhia|উখিয়া
@Feni|ফেনী
Chhagalnaiya|ছাগলনাইয়া
Daganbhuiyan|দাগনভূঞা
Feni Sadar|ফেনী সদর
Fulgazi|ফুলগাজী
Parshuram|পরশুরাম
Sonagazi|সোনাগাজী
@Khagrachhari|খাগড়াছড়ি
Dighinala|দীঘিনালা
Guimara|গুইমারা
Khagrachhari Sadar|খাগড়াছড়ি সদর
Lakshmichhari|লক্ষ্মীছড়ি
Mahalchhari|মহালছড়ি
Manikchhari|মানিকছড়ি
Matiranga|মাটিরাঙ্গা
Panchhari|পানছড়ি
Ramgarh|রামগড়
@Lakshmipur|লক্ষ্মীপুর
Kamalnagar|কমলনগর
Lakshmipur Sadar|লক্ষ্মীপুর সদর
Raipur|রায়পুর
Ramganj|রামগঞ্জ
Ramgati|রামগতি
@Noakhali|নোয়াখালী
Begumganj|বেগমগঞ্জ
Chatkhil|চাটখিল
Companiganj|কোম্পানীগঞ্জ
Hatiya|হাতিয়া
Kabirhat|কবিরহাট
Noakhali Sadar|নোয়াখালী সদর
Senbagh|সেনবাগ
Sonaimuri|সোনাইমুড়ী
Subarnachar|সুবর্ণচর
@Rangamati|রাঙ্গামাটি
Baghaichhari|বাঘাইছড়ি
Barkal|বরকল
Belaichhari|বিলাইছড়ি
Juraichhari|জুরাছড়ি
Kaptai|কাপ্তাই
Kawkhali|কাউখালী
Langadu|লংগদু
Naniarchar|নানিয়ারচর
Rajasthali|রাজস্থলী
Rangamati Sadar|রাঙ্গামাটি সদর
#Rajshahi|রাজশাহী
@Bogura|বগুড়া
Adamdighi|আদমদীঘি
Bogura Sadar|বগুড়া সদর
Dhunat|ধুনট
Dhupchanchia|দুপচাঁচিয়া
Gabtali|গাবতলী
Kahaloo|কাহালু
Nandigram|নন্দীগ্রাম
Sariakandi|সারিয়াকান্দি
Shajahanpur|শাজাহানপুর
Sherpur|শেরপুর
Shibganj|শিবগঞ্জ
Sonatala|সোনাতলা
@Joypurhat|জয়পুরহাট
Akkelpur|আক্কেলপুর
Joypurhat Sadar|জয়পুরহাট সদর
Kalai|কালাই
Khetlal|ক্ষেতলাল
Panchbibi|পাঁচবিবি
@Naogaon|নওগাঁ
Atrai|আত্রাই
Badalgachhi|বদলগাছী
Dhamoirhat|ধামইরহাট
Manda|মান্দা
Mohadevpur|মহাদেবপুর
Naogaon Sadar|নওগাঁ সদর
Niamatpur|নিয়ামতপুর
Patnitala|পত্নীতলা
Porsha|পোরশা
Raninagar|রাণীনগর
Sapahar|সাপাহার
@Natore|নাটোর
Bagatipara|বাগাতিপাড়া
Baraigram|বড়াইগ্রাম
Gurudaspur|গুরুদাসপুর
Lalpur|লালপুর
Naldanga|নলডাঙ্গা
Natore Sadar|নাটোর সদর
Singra|সিংড়া
@Chapai Nawabganj|চাঁপাইনবাবগঞ্জ
Bholahat|ভোলাহাট
Gomastapur|গোমস্তাপুর
Nachole|নাচোল
Nawabganj Sadar|চাঁপাইনবাবগঞ্জ সদর
Shibganj|শিবগঞ্জ
@Pabna|পাবনা
Atgharia|আটঘরিয়া
Bera|বেড়া
Bhangura|ভাঙ্গুড়া
Chatmohar|চাটমোহর
Faridpur|ফরিদপুর
Ishwardi|ঈশ্বরদী
Pabna Sadar|পাবনা সদর
Santhia|সাঁথিয়া
Sujanagar|সুজানগর
@Rajshahi|রাজশাহী
Bagha|বাঘা
Bagmara|বাগমারা
Charghat|চারঘাট
Durgapur|দুর্গাপুর
Godagari|গোদাগাড়ী
Mohanpur|মোহনপুর
Paba|পবা
Puthia|পুঠিয়া
Tanore|তানোর
@Sirajganj|সিরাজগঞ্জ
Belkuchi|বেলকুচি
Chauhali|চৌহালী
Kamarkhanda|কামারখন্দ
Kazipur|কাজীপুর
Raiganj|রায়গঞ্জ
Shahjadpur|শাহজাদপুর
Sirajganj Sadar|সিরাজগঞ্জ সদর
Tarash|তাড়াশ
Ullahpara|উল্লাপাড়া
#Khulna|খুলনা
@Bagerhat|বাগেরহাট
Bagerhat Sadar|বাগেরহাট সদর
Chitalmari|চিতলমারী
Fakirhat|ফকিরহাট
Kachua|কচুয়া
Mollahat|মোল্লাহাট
Mongla|মোংলা
Morrelganj|মোড়েলগঞ্জ
Rampal|রামপাল
Sarankhola|শরণখোলা
@Chuadanga|চুয়াডাঙ্গা
Alamdanga|আলমডাঙ্গা
Chuadanga Sadar|চুয়াডাঙ্গা সদর
Damurhuda|দামুড়হুদা
Jibannagar|জীবননগর
@Jashore|যশোর
Abhaynagar|অভয়নগর
Bagherpara|বাঘারপাড়া
Chaugachha|চৌগাছা
Jhikargachha|ঝিকরগাছা
Keshabpur|কেশবপুর
Jashore Sadar|যশোর সদর
Manirampur|মণিরামপুর
Sharsha|শার্শা
@Jhenaidah|ঝিনাইদহ
Harinakunda|হরিণাকুন্ডু
Jhenaidah Sadar|ঝিনাইদহ সদর
Kaliganj|কালীগঞ্জ
Kotchandpur|কোটচাঁদপুর
Maheshpur|মহেশপুর
Shailkupa|শৈলকুপা
@Khulna|খুলনা
Batiaghata|বটিয়াঘাটা
Dacope|দাকোপ
Dighalia|দিঘলিয়া
Dumuria|ডুমুরিয়া
Koyra|কয়রা
Paikgachha|পাইকগাছা
Phultala|ফুলতলা
Rupsha|রূপসা
Terokhada|তেরখাদা
@Kushtia|কুষ্টিয়া
Bheramara|ভেড়ামারা
Daulatpur|দৌলতপুর
Khoksa|খোকসা
Kumarkhali|কুমারখালী
Kushtia Sadar|কুষ্টিয়া সদর
Mirpur|মিরপুর
@Magura|মাগুরা
Magura Sadar|মাগুরা সদর
Mohammadpur|মহম্মদপুর
Shalikha|শালিখা
Sreepur|শ্রীপুর
@Meherpur|মেহেরপুর
Gangni|গাংনী
Meherpur Sadar|মেহেরপুর সদর
Mujibnagar|মুজিবনগর
@Narail|নড়াইল
Kalia|কালিয়া
Lohagara|লোহাগড়া
Narail Sadar|নড়াইল সদর
@Satkhira|সাতক্ষীরা
Assasuni|আশাশুনি
Debhata|দেবহাটা
Kalaroa|কলারোয়া
Kaliganj|কালিগঞ্জ
Satkhira Sadar|সাতক্ষীরা সদর
Shyamnagar|শ্যামনগর
Tala|তালা
#Barishal|বরিশাল
@Barguna|বরগুনা
Amtali|আমতলী
Bamna|বামনা
Barguna Sadar|বরগুনা সদর
Betagi|বেতাগী
Patharghata|পাথরঘাটা
Taltali|তালতলী
@Barishal|বরিশাল
Agailjhara|আগৈলঝাড়া
Babuganj|বাবুগঞ্জ
Bakerganj|বাকেরগঞ্জ
Banaripara|বানারীপাড়া
Gaurnadi|গৌরনদী
Hizla|হিজলা
Barishal Sadar|বরিশাল সদর
Mehendiganj|মেহেন্দিগঞ্জ
Muladi|মুলাদী
Wazirpur|উজিরপুর
@Bhola|ভোলা
Bhola Sadar|ভোলা সদর
Burhanuddin|বোরহানউদ্দিন
Char Fasson|চরফ্যাশন
Daulatkhan|দৌলতখান
Lalmohan|লালমোহন
Manpura|মনপুরা
Tazumuddin|তজুমদ্দিন
@Jhalokati|ঝালকাঠি
Jhalokati Sadar|ঝালকাঠি সদর
Kathalia|কাঁঠালিয়া
Nalchity|নলছিটি
Rajapur|রাজাপুর
@Patuakhali|পটুয়াখালী
Bauphal|বাউফল
Dashmina|দশমিনা
Dumki|দুমকি
Galachipa|গলাচিপা
Kalapara|কলাপাড়া
Mirzaganj|মির্জাগঞ্জ
Patuakhali Sadar|পটুয়াখালী সদর
Rangabali|রাঙ্গাবালী
@Pirojpur|পিরোজপুর
Bhandaria|ভান্ডারিয়া
Kawkhali|কাউখালী
Mathbaria|মঠবাড়িয়া
Nazirpur|নাজিরপুর
Nesarabad|নেছারাবাদ
Pirojpur Sadar|পিরোজপুর সদর
Zianagar|জিয়ানগর
#Sylhet|সিলেট
@Habiganj|হবিগঞ্জ
Ajmiriganj|আজমিরীগঞ্জ
Bahubal|বাহুবল
Baniachong|বানিয়াচং
Chunarughat|চুনারুঘাট
Habiganj Sadar|হবিগঞ্জ সদর
Lakhai|লাখাই
Madhabpur|মাধবপুর
Nabiganj|নবীগঞ্জ
Shaistaganj|শায়েস্তাগঞ্জ
@Moulvibazar|মৌলভীবাজার
Barlekha|বড়লেখা
Juri|জুড়ী
Kamalganj|কমলগঞ্জ
Kulaura|কুলাউড়া
Moulvibazar Sadar|মৌলভীবাজার সদর
Rajnagar|রাজনগর
Sreemangal|শ্রীমঙ্গল
@Sunamganj|সুনামগঞ্জ
Bishwamvarpur|বিশ্বম্ভরপুর
Chhatak|ছাতক
Dakshin Sunamganj|দক্ষিণ সুনামগঞ্জ
Derai|দিরাই
Dharamapasha|ধর্মপাশা
Dowarabazar|দোয়ারাবাজার
Jagannathpur|জগন্নাথপুর
Jamalganj|জামালগঞ্জ
Sullah|শাল্লা
Sunamganj Sadar|সুনামগঞ্জ সদর
Tahirpur|তাহিরপুর
@Sylhet|সিলেট
Balaganj|বালাগঞ্জ
Beanibazar|বিয়ানীবাজার
Bishwanath|বিশ্বনাথ
Companiganj|কোম্পানীগঞ্জ
Dakshin Surma|দক্ষিণ সুরমা
Fenchuganj|ফেঞ্চুগঞ্জ
Golapganj|গোলাপগঞ্জ
Gowainghat|গোয়াইনঘাট
Jaintiapur|জৈন্তাপুর
Kanaighat|কানাইঘাট
Osmani Nagar|ওসমানীনগর
Sylhet Sadar|সিলেট সদর
Zakiganj|জকিগঞ্জ
#Rangpur|রংপুর
@Dinajpur|দিনাজপুর
Birampur|বিরামপুর
Birganj|বীরগঞ্জ
Biral|বিরল
Bochaganj|বোচাগঞ্জ
Chirirbandar|চিরিরবন্দর
Phulbari|ফুলবাড়ী
Ghoraghat|ঘোড়াঘাট
Hakimpur|হাকিমপুর
Kaharole|কাহারোল
Khansama|খানসামা
Dinajpur Sadar|দিনাজপুর সদর
Nawabganj|নবাবগঞ্জ
Parbatipur|পার্বতীপুর
@Gaibandha|গাইবান্ধা
Fulchhari|ফুলছড়ি
Gaibandha Sadar|গাইবান্ধা সদর
Gobindaganj|গোবিন্দগঞ্জ
Palashbari|পলাশবাড়ী
Sadullapur|সাদুল্লাপুর
Saghata|সাঘাটা
Sundarganj|সুন্দরগঞ্জ
@Kurigram|কুড়িগ্রাম
Bhurungamari|ভুরুঙ্গামারী
Char Rajibpur|চর রাজিবপুর
Chilmari|চিলমারী
Phulbari|ফুলবাড়ী
Kurigram Sadar|কুড়িগ্রাম সদর
Nageshwari|নাগেশ্বরী
Rajarhat|রাজারহাট
Raomari|রৌমারী
Ulipur|উলিপুর
@Lalmonirhat|লালমনিরহাট
Aditmari|আদিতমারী
Hatibandha|হাতীবান্ধা
Kaliganj|কালীগঞ্জ
Lalmonirhat Sadar|লালমনিরহাট সদর
Patgram|পাটগ্রাম
@Nilphamari|নীলফামারী
Dimla|ডিমলা
Domar|ডোমার
Jaldhaka|জলঢাকা
Kishoreganj|কিশোরগঞ্জ
Nilphamari Sadar|নীলফামারী সদর
Saidpur|সৈয়দপুর
@Panchagarh|পঞ্চগড়
Atwari|আটোয়ারী
Boda|বোদা
Debiganj|দেবীগঞ্জ
Panchagarh Sadar|পঞ্চগড় সদর
Tetulia|তেঁতুলিয়া
@Rangpur|রংপুর
Badarganj|বদরগঞ্জ
Gangachara|গঙ্গাচড়া
Kaunia|কাউনিয়া
Mithapukur|মিঠাপুকুর
Pirgachha|পীরগাছা
Pirganj|পীরগঞ্জ
Rangpur Sadar|রংপুর সদর
Taraganj|তারাগঞ্জ
@Thakurgaon|ঠাকুরগাঁও
Baliadangi|বালিয়াডাঙ্গী
Haripur|হরিপুর
Pirganj|পীরগঞ্জ
Ranisankail|রাণীশংকৈল
Thakurgaon Sadar|ঠাকুরগাঁও সদর
#Mymensingh|ময়মনসিংহ
@Jamalpur|জামালপুর
Baksiganj|বকশীগঞ্জ
Dewanganj|দেওয়ানগঞ্জ
Islampur|ইসলামপুর
Jamalpur Sadar|জামালপুর সদর
Madarganj|মাদারগঞ্জ
Melandaha|মেলান্দহ
Sarishabari|সরিষাবাড়ী
@Mymensingh|ময়মনসিংহ
Bhaluka|ভালুকা
Dhobaura|ধোবাউড়া
Fulbaria|ফুলবাড়ীয়া
Gaffargaon|গফরগাঁও
Gauripur|গৌরীপুর
Haluaghat|হালুয়াঘাট
Ishwarganj|ঈশ্বরগঞ্জ
Mymensingh Sadar|ময়মনসিংহ সদর
Muktagachha|মুক্তাগাছা
Nandail|নন্দাইল
Phulpur|ফুলপুর
Tarakanda|তারাকান্দা
Trishal|ত্রিশাল
@Netrokona|নেত্রকোণা
Atpara|আটপাড়া
Barhatta|বারহাট্টা
Durgapur|দুর্গাপুর
Khaliajuri|খালিয়াজুরী
Kalmakanda|কলমাকান্দা
Kendua|কেন্দুয়া
Madan|মদন
Mohanganj|মোহনগঞ্জ
Netrokona Sadar|নেত্রকোণা সদর
Purbadhala|পূর্বধলা
@Sherpur|শেরপুর
Jhenaigati|ঝিনাইগাতী
Nakla|নকলা
Nalitabari|নালিতাবাড়ী
Sherpur Sadar|শেরপুর সদর
Sreebardi|শ্রীবরদী
`

/* Turns the text above into the same shape as the online dataset (ids start with "b"). */
export function builtinDataset() {
  const divisions = [], districts = [], upazilas = []
  for (const line of RAW.split('\n')) {
    const s = line.trim(); if (!s) continue
    const kind = s[0] === '#' ? 'div' : s[0] === '@' ? 'dis' : 'upa'
    const [en, bn] = (kind === 'upa' ? s : s.slice(1)).split('|').map((x) => x.trim())
    if (kind === 'div') divisions.push({ id: `b${divisions.length + 1}`, name: en, bn_name: bn })
    else if (kind === 'dis') districts.push({ id: `b${districts.length + 1}`, division_id: divisions.at(-1).id, name: en, bn_name: bn })
    else upazilas.push({ id: `b${upazilas.length + 1}`, district_id: districts.at(-1).id, name: en, bn_name: bn })
  }
  return { divisions, districts, upazilas }
}
