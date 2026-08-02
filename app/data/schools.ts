export type School = {
  serial: number;
  name: string;
  emisCode: string;
  headTeacher: string;
  legacyMobile: string;
  dailyDemand: number;
  areaName: string;
  areaCode: string;
};

export type Area = {
  code: string;
  name: string;
  schoolCount: number;
  dailyDemand: number;
  managerName: string | null;
  managerMobile: string | null;
};

export const areas: Area[] = [
  {
    "code": "AR-CND-71",
    "name": "চন্ডিগড়",
    "schoolCount": 17,
    "dailyDemand": 2135,
    "managerName": "ছাদেক আহমেদ (সোহেল)",
    "managerMobile": "01762598041"
  },
  {
    "code": "AR-PSV-24",
    "name": "পৌরসভা",
    "schoolCount": 12,
    "dailyDemand": 1989,
    "managerName": "মোঃ মারুফ মিয়া",
    "managerMobile": "01764530725"
  },
  {
    "code": "AR-DGP-83",
    "name": "দুর্গাপুর",
    "schoolCount": 13,
    "dailyDemand": 1954,
    "managerName": "মোঃ জালাল উদ্দিন",
    "managerMobile": "01345726989"
  },
  {
    "code": "AR-GKD-46",
    "name": "গাঁওকান্দিয়া",
    "schoolCount": 18,
    "dailyDemand": 1655,
    "managerName": "মোঃ আঃ সেলিম",
    "managerMobile": "01624405829"
  },
  {
    "code": "AR-JNJ-59",
    "name": "ঝাঞ্জাইল",
    "schoolCount": 20,
    "dailyDemand": 3742,
    "managerName": "মোঃ নজরুল ইসলাম",
    "managerMobile": "01710510546"
  },
  {
    "code": "AR-SBG-32",
    "name": "শিবগঞ্জ",
    "schoolCount": 18,
    "dailyDemand": 2199,
    "managerName": "মোঃ আলী হোসেন",
    "managerMobile": "01717692232"
  },
  {
    "code": "AR-BRS-68",
    "name": "বিরিশিরি",
    "schoolCount": 10,
    "dailyDemand": 1242,
    "managerName": "আবুল বাসার বাদসা",
    "managerMobile": "01834554703"
  },
  {
    "code": "AR-BKJ-17",
    "name": "বাকলজোড়া",
    "schoolCount": 18,
    "dailyDemand": 2474,
    "managerName": "শহিদুল ইসালাম (সোহাগ)",
    "managerMobile": "01301101531"
  }
];

export const schools: School[] = [
  {
    "serial": 1,
    "name": "ভাদুয়া সপ্রাবি",
    "emisCode": "91304040102",
    "headTeacher": "মোঃ তোফায়েল হোসেন",
    "legacyMobile": "1710586342",
    "dailyDemand": 138,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 2,
    "name": "মুন্সিপাড়া সপ্রাবি",
    "emisCode": "91304040101",
    "headTeacher": "মোঃ শফিকুল ইসলাম",
    "legacyMobile": "1711026017",
    "dailyDemand": 82,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 3,
    "name": "শংকরপুর সপ্রাবি",
    "emisCode": "91304040109",
    "headTeacher": "মোঃ মোতাহার হোসেন(চঃদাঃ)",
    "legacyMobile": "1716944909",
    "dailyDemand": 232,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 4,
    "name": "দুবরাজপুর সপ্রাবি",
    "emisCode": "91304040104",
    "headTeacher": "সোহানা খোশনিহার(ভার)",
    "legacyMobile": "1731909314",
    "dailyDemand": 113,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 5,
    "name": "জাগিরপাড়া সপ্রাবি",
    "emisCode": "91304040103",
    "headTeacher": "মোঃ সেলিম (ভার)",
    "legacyMobile": "1712386441",
    "dailyDemand": 94,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 6,
    "name": "দক্ষিণ জাগিরপাড়া সপ্রাবি",
    "emisCode": "91304040113",
    "headTeacher": "মো: এনামোল হক(ভার)",
    "legacyMobile": "1303804451",
    "dailyDemand": 72,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 7,
    "name": "গাঁওকান্দিয়া সপ্রাবি",
    "emisCode": "91304040116",
    "headTeacher": "মুহাম্মদ হযরত আলী(চঃদাঃ)",
    "legacyMobile": "1719913066",
    "dailyDemand": 149,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 8,
    "name": "মুন্সিপাড়া ভাদুয়া সপ্রাবি",
    "emisCode": "91304040115",
    "headTeacher": "মো: আফজাল হোসেন(ভার)",
    "legacyMobile": "1911691515",
    "dailyDemand": 73,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 9,
    "name": "বন্দকাটুয়ারী সপ্রাবি",
    "emisCode": "91304040609",
    "headTeacher": "দুলাল মিয়া",
    "legacyMobile": "1913871991",
    "dailyDemand": 100,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 10,
    "name": "কাকড়াকান্দা সপ্রাবি",
    "emisCode": "91304040610",
    "headTeacher": "আজহারুল হক (ভারঃ)",
    "legacyMobile": "1924818919",
    "dailyDemand": 88,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 11,
    "name": "শশারপাড় সপ্রাবি,",
    "emisCode": "91304040611",
    "headTeacher": "সঞ্জয় চন্দ্র সরকার(ভারঃ)",
    "legacyMobile": "1911563470",
    "dailyDemand": 76,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 12,
    "name": "১২ নং কুল্লাগড়া সপ্রাবি",
    "emisCode": "91304040603",
    "headTeacher": "রমা রাণী সরকার",
    "legacyMobile": "1729587160",
    "dailyDemand": 236,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 13,
    "name": "রাণীখং সপ্রাবি,",
    "emisCode": "91304040612",
    "headTeacher": "তাহমিনা বেগম(ভার)",
    "legacyMobile": "1984798890",
    "dailyDemand": 175,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 14,
    "name": "কাঁঠালখালী সপ্রাবি",
    "emisCode": "91304040601",
    "headTeacher": "মাজহারুল আনোয়ার",
    "legacyMobile": "1710672758",
    "dailyDemand": 95,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 15,
    "name": "নন্দের গোপ সপ্রাবি",
    "emisCode": "91304040613",
    "headTeacher": "মোঃ মুসলেম উদ্দিন",
    "legacyMobile": "1818876543",
    "dailyDemand": 136,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 16,
    "name": "ফারংপাড়া সপ্রাবি",
    "emisCode": "91304040205",
    "headTeacher": "শামছুন্নাহার বেগম",
    "legacyMobile": "1721860102",
    "dailyDemand": 180,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 17,
    "name": "দুর্গাপুর সপ্রাবি",
    "emisCode": "91304040206",
    "headTeacher": "শামছুন্নাহার বেগম",
    "legacyMobile": "1818837497",
    "dailyDemand": 427,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 18,
    "name": "সুসং সপ্রাবি",
    "emisCode": "91304040208",
    "headTeacher": "এমদাদ হোসেন চৌধুরী(চঃদাঃ)",
    "legacyMobile": "1865028959",
    "dailyDemand": 233,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 19,
    "name": "মাকড়াইল সপ্রাবি",
    "emisCode": "91304040204",
    "headTeacher": "মোঃ মতিউর রহমান",
    "legacyMobile": "1957903454",
    "dailyDemand": 158,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 20,
    "name": "২০ নং মেনকী সপ্রাবি",
    "emisCode": "91304040214",
    "headTeacher": "দুলাল চক্রবর্তী",
    "legacyMobile": "1716987675",
    "dailyDemand": 153,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 21,
    "name": "কালিকাপুর সপ্রাবি",
    "emisCode": "91304040201",
    "headTeacher": "মোঃ নাজমুল হক(চঃদাঃ)",
    "legacyMobile": "1720018092",
    "dailyDemand": 164,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 22,
    "name": "নলুয়াপাড়া সপ্রাবি",
    "emisCode": "91304040209",
    "headTeacher": "স্বপ্না দেবী রায়",
    "legacyMobile": "1718769456",
    "dailyDemand": 212,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 23,
    "name": "গোপালপুর(উত্তর)সঃ প্রাঃ বিঃ",
    "emisCode": "91304040210",
    "headTeacher": "নকুল চন্দ্র কর্মকার",
    "legacyMobile": "1735050848",
    "dailyDemand": 175,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 24,
    "name": "বারমারী সপ্রাবি",
    "emisCode": "91304040211",
    "headTeacher": "নাজমা আক্তার(ভার)",
    "legacyMobile": "1911248036",
    "dailyDemand": 185,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 25,
    "name": "ধানশিরা সপ্রাবি",
    "emisCode": "91304040706",
    "headTeacher": "মাজেদা বেগম",
    "legacyMobile": "1912438465",
    "dailyDemand": 160,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 26,
    "name": "চন্ডিগড় সপ্রাবি",
    "emisCode": "91304040707",
    "headTeacher": "কামরুন্নাহার খানম",
    "legacyMobile": "1986974580",
    "dailyDemand": 192,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 27,
    "name": "মউ সপ্রাবি",
    "emisCode": "91304040703",
    "headTeacher": "আশিষ কুমার দে",
    "legacyMobile": "1761602225",
    "dailyDemand": 78,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 28,
    "name": "নাগেরগাতী সপ্রাবি",
    "emisCode": "91304040708",
    "headTeacher": "সুমন চন্দ্র পন্ডিত (ভারঃ)",
    "legacyMobile": "1722788273",
    "dailyDemand": 154,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 29,
    "name": "২৯ নং ফেচিয়া সপ্রাবি",
    "emisCode": "91304040704",
    "headTeacher": "মোঃ মোফাজ্জল হোসেন",
    "legacyMobile": "1924560880",
    "dailyDemand": 137,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 30,
    "name": "নোয়াগাঁও সপ্রাবি",
    "emisCode": "91304040709",
    "headTeacher": "হাসিনা মমতাজ",
    "legacyMobile": "1747065667",
    "dailyDemand": 137,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 31,
    "name": "সাতাশি সপ্রাবি",
    "emisCode": "91304040710",
    "headTeacher": "মোঃ আবু বকর সিদ্দিক",
    "legacyMobile": "1925032980",
    "dailyDemand": 170,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 32,
    "name": "চৈতাটি সপ্রাবি",
    "emisCode": "91304040403",
    "headTeacher": "মোঃ আমিনুল ইসলাম",
    "legacyMobile": "1718223830",
    "dailyDemand": 108,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 33,
    "name": "দক্ষিণ ভবানীপুর সপ্রাবি",
    "emisCode": "91304040212",
    "headTeacher": "মোঃ রফিকুল ইসলাম",
    "legacyMobile": "1714794557",
    "dailyDemand": 188,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 34,
    "name": "খালিশাপাড়া সপ্রাবি",
    "emisCode": "91304040406",
    "headTeacher": "মোস্তফা কামাল",
    "legacyMobile": "1721436700",
    "dailyDemand": 96,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 35,
    "name": "নওয়াপাড়া সপ্রাবি",
    "emisCode": "91304040407",
    "headTeacher": "দিপীকা রানী বর্মন",
    "legacyMobile": "1710152898",
    "dailyDemand": 142,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 36,
    "name": "রামপুর সপ্রাবি",
    "emisCode": "91304040408",
    "headTeacher": "মো: রফিকুল ইসলাম (ভারঃ)",
    "legacyMobile": "1719961050",
    "dailyDemand": 191,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 37,
    "name": "বিরিশিরি সঃ প্রাঃ বাঃ বিঃ",
    "emisCode": "91304040213",
    "headTeacher": "সাজেদা খাতুন",
    "legacyMobile": "1731403881",
    "dailyDemand": 77,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 38,
    "name": "বিরিশিরি মডেল সঃ প্রাঃ বাঃ বিঃ",
    "emisCode": "91304040401",
    "headTeacher": "মিল্কা দেবী",
    "legacyMobile": "1814787817",
    "dailyDemand": 170,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 39,
    "name": "কৃষ্ণেরচর সপ্রাবি",
    "emisCode": "91304040513",
    "headTeacher": "মির্জা মাসুদুর রহমান বেগ",
    "legacyMobile": "1717114513",
    "dailyDemand": 347,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 40,
    "name": "রামবাড়ী সপ্রাবি",
    "emisCode": "91304040509",
    "headTeacher": "রেজাউল ইসলাম",
    "legacyMobile": "1718915060",
    "dailyDemand": 198,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 41,
    "name": "৪১ নং ঝানজাইল সপ্রাবি",
    "emisCode": "91304040510",
    "headTeacher": "মোঃ বজলুল কাদের",
    "legacyMobile": "1913159453",
    "dailyDemand": 446,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 42,
    "name": "পূর্ব কাকৈর গড়া সপ্রাবি",
    "emisCode": "91304040503",
    "headTeacher": "এ, কে, এম মঞ্জুরুল হক(চঃদাঃ)",
    "legacyMobile": "1754484329",
    "dailyDemand": 266,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 43,
    "name": "দক্ষিণ গোপালপুর সপ্রাবি",
    "emisCode": "91304040511",
    "headTeacher": "সরকার জসীম উদ্দিন",
    "legacyMobile": "1917857554",
    "dailyDemand": 130,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 44,
    "name": "৪৪ নং নগুয়া সপ্রাবি",
    "emisCode": "91304040508",
    "headTeacher": "মোঃ এমদাদুল হক",
    "legacyMobile": "1912533263",
    "dailyDemand": 228,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 45,
    "name": "বায়রাউড়া সপ্রাবি",
    "emisCode": "91304040506",
    "headTeacher": "রৌশন আখতার খানম(চঃদাঃ)",
    "legacyMobile": "1911142350",
    "dailyDemand": 191,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 46,
    "name": "বড়বাট্টা সপ্রাবি",
    "emisCode": "91304040512",
    "headTeacher": "সৈয়দা ফারজানা ইয়াসমিন(ভার)",
    "legacyMobile": "1739915990",
    "dailyDemand": 184,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 47,
    "name": "শ্রীরামখিলা সপ্রাবি",
    "emisCode": "91304040303",
    "headTeacher": "মোঃ আমিনুল ইসলাম",
    "legacyMobile": "1713564054",
    "dailyDemand": 111,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 48,
    "name": "গুজিরকোণা সপ্রাবি",
    "emisCode": "91304040302",
    "headTeacher": "মমতাজ বেগম",
    "legacyMobile": "1913926918",
    "dailyDemand": 311,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 49,
    "name": "কুমুদগঞ্জ সপ্রাবি",
    "emisCode": "91304040306",
    "headTeacher": "মুহাম্মদ তরিকুল ইসলাম (চঃদাঃ)",
    "legacyMobile": "1920610857",
    "dailyDemand": 331,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 50,
    "name": "নগরসিংহা সপ্রাবি",
    "emisCode": "91304040304",
    "headTeacher": "মোছাঃ মাহমুদা খাতুন(চঃদাঃ)",
    "legacyMobile": "1721271275",
    "dailyDemand": 208,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 51,
    "name": "বাকলজোড়া সপ্রাবি",
    "emisCode": "91304040305",
    "headTeacher": "শাহান আরা বেগম(চঃদাঃ)",
    "legacyMobile": "1925002492",
    "dailyDemand": 95,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 52,
    "name": "নয়াপাড়া সপ্রাবি",
    "emisCode": "91304040313",
    "headTeacher": "নূরুন্নাহার(ভার)",
    "legacyMobile": "1736825509",
    "dailyDemand": 147,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 53,
    "name": "পাইকপাড়া সপ্রাবি",
    "emisCode": "91304040301",
    "headTeacher": "মো: সোহরাব হোসেন খান",
    "legacyMobile": "1625489909",
    "dailyDemand": 105,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 54,
    "name": "নলজোড়া সপ্রাবি",
    "emisCode": "91304040604",
    "headTeacher": "নজরুল ইসলাম",
    "legacyMobile": "1916331257",
    "dailyDemand": 87,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 55,
    "name": "কান্দাপাড়া সপ্রাবি",
    "emisCode": "91304040114",
    "headTeacher": "হাবিবুর রহমান(চঃদাঃ)",
    "legacyMobile": "1913832351",
    "dailyDemand": 98,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 56,
    "name": "ফুলপুর সপ্রাবি",
    "emisCode": "91304040711",
    "headTeacher": "মো: আব্দুল হান্নান (ভার)",
    "legacyMobile": "1923902837",
    "dailyDemand": 83,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 57,
    "name": "আড়াপাড়া সপ্রাবি",
    "emisCode": "91304040614",
    "headTeacher": "মো: নজরুল ইসলাম (ভার)",
    "legacyMobile": "1916311597",
    "dailyDemand": 152,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 58,
    "name": "শ্যামনগর সপ্রাবি",
    "emisCode": "91304040307",
    "headTeacher": "দীপিকা দালবৎ(চঃদাঃ)",
    "legacyMobile": "1813621043",
    "dailyDemand": 163,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 59,
    "name": "উত্তর কেট্টা সপ্রাবি।",
    "emisCode": "99304040407",
    "headTeacher": "বিউটি দাস(চঃদাঃ)",
    "legacyMobile": "1838854410",
    "dailyDemand": 88,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 60,
    "name": "গোদারিয়া সপ্রাবি",
    "emisCode": "99304040302",
    "headTeacher": "মুহাম্মদ আসাদুল্লাহ খান(চঃদাঃ)",
    "legacyMobile": "1812147444",
    "dailyDemand": 118,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 61,
    "name": "মাইজপাড়া সপ্রাবি",
    "emisCode": "99304040703",
    "headTeacher": "হীরেন কুমার দাস(চঃদাঃ)",
    "legacyMobile": "1918249529",
    "dailyDemand": 135,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 62,
    "name": "নন্দেরছটি সপ্রাবি",
    "emisCode": "99304040702",
    "headTeacher": "মো: রফিক উদ্দিন",
    "legacyMobile": "1746944419",
    "dailyDemand": 88,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 63,
    "name": "ডেউটুকোন সপ্রাবি",
    "emisCode": "99304040405",
    "headTeacher": "তারা মিয়া তালুকদার(ভারঃ)",
    "legacyMobile": "1724834267",
    "dailyDemand": 120,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 64,
    "name": "কেরনখলা সপ্রাবি",
    "emisCode": "99304040603",
    "headTeacher": "মোঃ শামছুল হক",
    "legacyMobile": "1715732191",
    "dailyDemand": 150,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 65,
    "name": "চাড়িয়া সপ্রাবি",
    "emisCode": "99304040404",
    "headTeacher": "মোঃ জহিরুল হক",
    "legacyMobile": "1713539144",
    "dailyDemand": 204,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 66,
    "name": "আমড়াতলা সপ্রাবি",
    "emisCode": "99304040307",
    "headTeacher": "মর্জিনা বেগম",
    "legacyMobile": "1820558071",
    "dailyDemand": 113,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 67,
    "name": "গৌরাখালীকান্দা সপ্রাবি",
    "emisCode": "99304040604",
    "headTeacher": "হালেমা বেগম",
    "legacyMobile": "1736635121",
    "dailyDemand": 73,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 68,
    "name": "চারিখাল সপ্রাবি",
    "emisCode": "99304040205",
    "headTeacher": "মোঃ শহিদুল ইসলাম (ভার:)",
    "legacyMobile": "1911078860",
    "dailyDemand": 103,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 69,
    "name": "বুরুঙ্গাসঃ প্রাঃ বিঃ",
    "emisCode": "99304040607",
    "headTeacher": "রেহেনা খাতুন (ভার:)",
    "legacyMobile": "1721549027",
    "dailyDemand": 110,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 70,
    "name": "পূর্ব রামনগর সপ্রাবি",
    "emisCode": "99304040304",
    "headTeacher": "মোঃ নজরুল ইসলাম (ভার)",
    "legacyMobile": "1834204900",
    "dailyDemand": 111,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 71,
    "name": "৭১ নং কেট্রা সপ্রাবি",
    "emisCode": "99304040301",
    "headTeacher": "মো: হাবিবুর রহমান (ভার:)",
    "legacyMobile": "1918572674",
    "dailyDemand": 82,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 72,
    "name": "আলমপুর সপ্রাবি",
    "emisCode": "99304040501",
    "headTeacher": "ছাবিকুন্নাহার বেগম",
    "legacyMobile": "1932235582",
    "dailyDemand": 140,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 73,
    "name": "শান্তিপুর সপ্রাবি।",
    "emisCode": "99304040502",
    "headTeacher": "আব্দুল জব্বার (দায়িত্বে আছে)",
    "legacyMobile": "1924818926",
    "dailyDemand": 95,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 74,
    "name": "তেলীপাড়া সপ্রাবি",
    "emisCode": "99304040408",
    "headTeacher": "মুহাম্মদ আবুল কাশেম(চঃদাঃ)",
    "legacyMobile": "1914201730",
    "dailyDemand": 135,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 75,
    "name": "খুজিউড়া সপ্রাবি",
    "emisCode": "99304040602",
    "headTeacher": "সুলতানা নাসরিন",
    "legacyMobile": "1712750935",
    "dailyDemand": 180,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 76,
    "name": "পূর্ব গোদারিয়া সপ্রাবি",
    "emisCode": "99304040706",
    "headTeacher": "মানিক চন্দ্র দে(চঃদাঃ)",
    "legacyMobile": "1733253480",
    "dailyDemand": 205,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 77,
    "name": "গাড়াউন্দ সপ্রাবি",
    "emisCode": "99304040505",
    "headTeacher": "শাহানাজ পারভীন(চঃদাঃ)",
    "legacyMobile": "1725605272",
    "dailyDemand": 86,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 78,
    "name": "বিলাশপুর সপ্রাবি",
    "emisCode": "99304040402",
    "headTeacher": "শেখ নাজিম উদ্দিন",
    "legacyMobile": "1626073550",
    "dailyDemand": 171,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 79,
    "name": "চন্দ্রকোণা মায়ানগর সঃপ্রাঃবিঃ",
    "emisCode": "99304040705",
    "headTeacher": "ছবি রানী সিংহ রায়(চঃদাঃ)",
    "legacyMobile": "1716747483",
    "dailyDemand": 82,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 80,
    "name": "দশাল সপ্রাবি",
    "emisCode": "99304040106",
    "headTeacher": "ইসমত আরা বেগম",
    "legacyMobile": "1920381732",
    "dailyDemand": 97,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 81,
    "name": "হারিয়াউন্দ সপ্রাবি",
    "emisCode": "99304040203",
    "headTeacher": "মো: আবু সাঈদ (ভারঃ)",
    "legacyMobile": "1745416283",
    "dailyDemand": 152,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 82,
    "name": "সাগরদীঘিরপাড় সপ্রাবি",
    "emisCode": "99304040606",
    "headTeacher": "মো: আব্দুল মোতালেব",
    "legacyMobile": "1715625234",
    "dailyDemand": 127,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 83,
    "name": "৮৩ নং নাথপাড়া সপ্রাবি",
    "emisCode": "99304040101",
    "headTeacher": "প্রনব কুমার পন্ডিত(চঃদাঃ)",
    "legacyMobile": "1721083322",
    "dailyDemand": 142,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 84,
    "name": "৮৪ নং কৈলাটি সপ্রাবি",
    "emisCode": "99304040504",
    "headTeacher": "মোঃ আজিজুল ইসলাম খান",
    "legacyMobile": "1718659211",
    "dailyDemand": 159,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 85,
    "name": "বালিচান্দা আলাউদ্দিন সপ্রাবি",
    "emisCode": "99304049001",
    "headTeacher": "মোঃ আঃ বারী",
    "legacyMobile": "1734226492",
    "dailyDemand": 111,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 86,
    "name": "পলাশকান্দি সপ্রাবি",
    "emisCode": "99304040108",
    "headTeacher": "মোঃ মোশারফ হোসেন",
    "legacyMobile": "1813920180",
    "dailyDemand": 104,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 87,
    "name": "বড়ইউন্দ সপ্রাবি",
    "emisCode": "99304040503",
    "headTeacher": "নূরে জান্নাত খানম(চঃদাঃ)",
    "legacyMobile": "1739655166",
    "dailyDemand": 149,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 88,
    "name": "ছোট কাটুরী সপ্রাবি",
    "emisCode": "99304040105",
    "headTeacher": "শাহিদুর রহমান বেগ",
    "legacyMobile": "1924031450",
    "dailyDemand": 85,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 89,
    "name": "জাঙ্গালিয়াকান্দা সপ্রাবি",
    "emisCode": "99304040701",
    "headTeacher": "মোঃ ইদিছ আলী",
    "legacyMobile": "1731208960",
    "dailyDemand": 83,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 90,
    "name": "ছনগড়া টংক শহীদ স্মৃতি সপ্রাবি",
    "emisCode": "99304040403",
    "headTeacher": "আজহারুল হক(চঃদাঃ)",
    "legacyMobile": "1710012506",
    "dailyDemand": 60,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 91,
    "name": "পূর্ব বিলাসপুর সপ্রাবি",
    "emisCode": "99304040712",
    "headTeacher": "মোঃ আমিনুর রহমান তালুকদার",
    "legacyMobile": "1915421344",
    "dailyDemand": 126,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 92,
    "name": "কালিকাবর সপ্রাবি",
    "emisCode": "99304040305",
    "headTeacher": "মোঃ আঃ সাহিদ",
    "legacyMobile": "1739536266",
    "dailyDemand": 109,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 93,
    "name": "শিরবির সপ্রাবি",
    "emisCode": "99304050904",
    "headTeacher": "খলিলুর রহমান",
    "legacyMobile": "1712383576",
    "dailyDemand": 182,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 94,
    "name": "কুলুঞ্জা সপ্রাবি",
    "emisCode": "99304051101",
    "headTeacher": "ববিতা রানী সরকার",
    "legacyMobile": "1706471354",
    "dailyDemand": 122,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 95,
    "name": "পূর্ব নন্দেরছটি সপ্রাবি",
    "emisCode": "99304051302",
    "headTeacher": "শাহজাহান মিয়া(ভারঃ)",
    "legacyMobile": "1791953625",
    "dailyDemand": 99,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 96,
    "name": "গাভিনা শেখ তোফা হো স প্রা বি",
    "emisCode": "99304050402",
    "headTeacher": "চম্পা রানী দে",
    "legacyMobile": "1914070237",
    "dailyDemand": 142,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 97,
    "name": "কৃষ্ণপুর সপ্রাবি",
    "emisCode": "99304050603",
    "headTeacher": "মোঃ মাসুদুজ্জামান",
    "legacyMobile": "1865009558",
    "dailyDemand": 110,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 98,
    "name": "পশ্চিম কোনাপাড়া সপ্রাবি",
    "emisCode": "99304050101",
    "headTeacher": "মনোয়ারা বেগম",
    "legacyMobile": "1761919422",
    "dailyDemand": 118,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 99,
    "name": "বানিয়াপাড়া সপ্রাবি",
    "emisCode": "99304051005",
    "headTeacher": "মাকসুদা বেগম",
    "legacyMobile": "1916255737",
    "dailyDemand": 98,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 100,
    "name": "১০০ নং মাদুরপাড় সপ্রাবি",
    "emisCode": "99304051403",
    "headTeacher": "মোঃ মজিবুর রহমান আকনজি",
    "legacyMobile": "1727718880",
    "dailyDemand": 98,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 101,
    "name": "সুসঙ্গ আদর্শ বিদ্যা স প্রা বি",
    "emisCode": "99304051201",
    "headTeacher": "আলেয়া শারমীন(চঃদাঃ)",
    "legacyMobile": "1981246554",
    "dailyDemand": 144,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 102,
    "name": "পশ্চিম কাকড়াকান্দা সপ্রাবি",
    "emisCode": "99304051505",
    "headTeacher": "মোঃ আনোয়ার হোসেন",
    "legacyMobile": "1947107383",
    "dailyDemand": 69,
    "areaName": "শিবগঞ্জ",
    "areaCode": "AR-SBG-32"
  },
  {
    "serial": 103,
    "name": "১০৩ নং বকেরচর সপ্রাবি",
    "emisCode": "99304041509",
    "headTeacher": "মোঃ আমিনুল ইসলাম(চঃদাঃ)",
    "legacyMobile": "1667365700",
    "dailyDemand": 134,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 104,
    "name": "১০৪ নং সাংসা সপ্রাবি।",
    "emisCode": "99304041506",
    "headTeacher": "আঃ রব চৌধুরী(চঃদাঃ)",
    "legacyMobile": "1726868778",
    "dailyDemand": 126,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 105,
    "name": "উত্তর নোয়াগাঁও সপ্রাবি",
    "emisCode": "99304041508",
    "headTeacher": "আবুল হোসেন আনুয়ারী",
    "legacyMobile": "1729634061",
    "dailyDemand": 112,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 106,
    "name": "দক্ষিণ চারিগাঁওপাড়া সপ্রাবি",
    "emisCode": "99304041507",
    "headTeacher": "নাজমা বেগম",
    "legacyMobile": "1719960233",
    "dailyDemand": 84,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 107,
    "name": "পূর্ব বাকলজোড়া সপ্রাবি",
    "emisCode": "99304041510",
    "headTeacher": "মোঃ ফারুক মোল্লাহ(চঃদাঃ)",
    "legacyMobile": "1713158966",
    "dailyDemand": 135,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 108,
    "name": "বিরিশিরি পৌর সপ্রাবি",
    "emisCode": "99304049201",
    "headTeacher": "খাদিজা আক্তার পাপড়ী(চঃদাঃ)",
    "legacyMobile": "1919288664",
    "dailyDemand": 75,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 109,
    "name": "মাঝিয়াইল সপ্রাবি",
    "emisCode": "99304049202",
    "headTeacher": "মোস্তাক আহাম্মদ(দায়িত্বে)",
    "legacyMobile": "1721144290",
    "dailyDemand": 182,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 110,
    "name": "সাহাপুর সপ্রাবি",
    "emisCode": "99304049203",
    "headTeacher": "মো: রোকন উদ্দিন(ভারঃ)",
    "legacyMobile": "1736837202",
    "dailyDemand": 82,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 111,
    "name": "চুকাইখালী সপ্রাবি",
    "emisCode": "99304049204",
    "headTeacher": "সুমন চন্দ্র পন্ডিত (ভারঃ)",
    "legacyMobile": "1718734701",
    "dailyDemand": 97,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 112,
    "name": "বনগ্রাম সপ্রাবি",
    "emisCode": "99304049205",
    "headTeacher": "রফিক আহাম্মদ(ভারঃ)",
    "legacyMobile": "1834037671",
    "dailyDemand": 95,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 113,
    "name": "পূর্ব জাঙ্গালিয়াকান্দা সঃপ্রাঃবিঃ",
    "emisCode": "99304049206",
    "headTeacher": "উম্মে আছমা(ভার:)",
    "legacyMobile": "1779986726",
    "dailyDemand": 72,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 114,
    "name": "কানাইল সপ্রাবি",
    "emisCode": "99304049207",
    "headTeacher": "আবুল কাশেম(চঃদাঃ)",
    "legacyMobile": "1916621582",
    "dailyDemand": 77,
    "areaName": "বিরিশিরি",
    "areaCode": "AR-BRS-68"
  },
  {
    "serial": 115,
    "name": "আগার সপ্রাবি",
    "emisCode": "99304049208",
    "headTeacher": "মোস্তফা কামালুর রশিদ(চঃদাঃ)",
    "legacyMobile": "1710012321",
    "dailyDemand": 83,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 116,
    "name": "শুকনাকুড়ি সপ্রাবি",
    "emisCode": "99304049209",
    "headTeacher": "প্রীতিলতা দেবনাথ(চঃদাঃ)",
    "legacyMobile": "1715247139",
    "dailyDemand": 199,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 117,
    "name": "নাওদ্বারা সপ্রাবি",
    "emisCode": "99304049210",
    "headTeacher": "মমতাজ বেগম(ভারঃ)",
    "legacyMobile": "1737484128",
    "dailyDemand": 40,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 118,
    "name": "মজিব নগর সপ্রাবি",
    "emisCode": "99304049211",
    "headTeacher": "মো: শাহজাহান মিয়া(দায়িত্বে)",
    "legacyMobile": "1725427495",
    "dailyDemand": 137,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 119,
    "name": "চরমোক্তার পাড়া সপ্রাবি",
    "emisCode": "99304049212",
    "headTeacher": "নাসরিন রহমান(চঃদাঃ)",
    "legacyMobile": "1742779857",
    "dailyDemand": 124,
    "areaName": "পৌরসভা",
    "areaCode": "AR-PSV-24"
  },
  {
    "serial": 120,
    "name": "তিতারজান সপ্রাবি",
    "emisCode": "99304049213",
    "headTeacher": "অনিমা দাস(চ:দা)",
    "legacyMobile": "1718711260",
    "dailyDemand": 102,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 121,
    "name": "উত্তর ফারংপাড়া সপ্রাবি",
    "emisCode": "99304049214",
    "headTeacher": "শিঊলী সোম(চঃদাঃ)",
    "legacyMobile": "1710582311",
    "dailyDemand": 98,
    "areaName": "দুর্গাপুর",
    "areaCode": "AR-DGP-83"
  },
  {
    "serial": 122,
    "name": "হরচাপটাবিল সপ্রাবি",
    "emisCode": "99304049215",
    "headTeacher": "মোঃ অলি উল্লাহ্(ভারঃ)",
    "legacyMobile": "1794609033",
    "dailyDemand": 60,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  },
  {
    "serial": 123,
    "name": "দক্ষিণ ছোট কাঠুরী স প্রা বি",
    "emisCode": "99304049302",
    "headTeacher": "সালমা আক্তার(চঃদাঃ)",
    "legacyMobile": "1981466428",
    "dailyDemand": 113,
    "areaName": "বাকলজোড়া",
    "areaCode": "AR-BKJ-17"
  },
  {
    "serial": 124,
    "name": "লোহারগাঁও সপ্রাবি",
    "emisCode": "99304049301",
    "headTeacher": "সামিনা ইয়াসমিন(চঃদাঃ)",
    "legacyMobile": "1745480941",
    "dailyDemand": 99,
    "areaName": "চন্ডিগড়",
    "areaCode": "AR-CND-71"
  },
  {
    "serial": 125,
    "name": "গন্ডাবেড় সপ্রাবি",
    "emisCode": "99304049303",
    "headTeacher": "শাহানারা সেলিনা(চঃদাঃ)",
    "legacyMobile": "1721858943",
    "dailyDemand": 95,
    "areaName": "ঝাঞ্জাইল",
    "areaCode": "AR-JNJ-59"
  },
  {
    "serial": 126,
    "name": "আটলা সপ্রাবি",
    "emisCode": "99304049304",
    "headTeacher": "ফাহিমা খাতুন্(ভারঃ)",
    "legacyMobile": "1775484621",
    "dailyDemand": 67,
    "areaName": "গাঁওকান্দিয়া",
    "areaCode": "AR-GKD-46"
  }
];
