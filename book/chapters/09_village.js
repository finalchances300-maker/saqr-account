/* Chapter 9 - Village & buildings. Facts: Docs/Systems/09_village_buildings.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var list = D("buildings.list"), vil = D("online.village"), lay = D("village.layout");
  var costs = list[0].costs, minL = list[0].minLevels, steps = costs.length;
  var oneBuilding = costs.reduce(function (a, c) { return a + c; }, 0);
  var maxVillage = 1 + list.length * steps;

  var NAMES = {
    mews: { ar: "المقر", en: "My falcons" }, training: { ar: "التدريب", en: "Training" }, hospital: { ar: "مستشفى الصقور", en: "Hospital" },
    breeding: { ar: "التزاوج", en: "Breeding" }, souq: { ar: "سوق الصقور", en: "Falcon Market" }, majlis: { ar: "المجلس", en: "Majlis" },
    post: { ar: "البريد", en: "Inbox" }, pearls: { ar: "المتجر", en: "Store" }, fire: { ar: "المساء", en: "Evening fire" },
    tournament: { ar: "البطولات", en: "Tournaments" }, car: { ar: "المقناص", en: "Hunting" }
  };
  var USE = {
    mews: { ar: "صقورك وإطعامها", en: "your falcons and feeding" }, training: { ar: "جلسات التدريب", en: "training sessions" },
    hospital: { ar: "علاج الصقور", en: "treatment" }, breeding: { ar: "التزاوج والأعشاش والبيض", en: "pairing, nests and eggs" },
    souq: { ar: "صقور السوق اليومية", en: "the daily market falcons" }, majlis: { ar: "ضيوف المساء والاجتماع والكلانات", en: "evening guests, social, clans" },
    post: { ar: "المهام اليومية والبريد", en: "daily tasks and mail" }, pearls: { ar: "متجر اللآلئ وطعام ريجيم السباق الصباحي", en: "the Pearl store and the morning race-diet food" },
    fire: { ar: "ضيف المساء", en: "the evening guest" }, tournament: { ar: "قاعة البطولات", en: "the tournament hall" },
    car: { ar: "المرآب والطريق إلى المقناص", en: "the garage and the way to hunting" }
  };
  var fixed = ["fire", "tournament", "car"];
  var PERK = {
    feedCostPercent: { ar: "الإطعام أرخص", en: "Feeding costs less", unit: "%" },
    trainingCostPercent: { ar: "التدريب أرخص", en: "Training costs less", unit: "%" },
    hospitalCostPercent: { ar: "العلاج أرخص", en: "Treatment costs less", unit: "%" },
    hospitalTimePercent: { ar: "العلاج أسرع", en: "Treatment is faster", unit: "%" },
    hatchTimePercent: { ar: "البيض يفقس أسرع", en: "Eggs hatch faster", unit: "%" },
    stockAdd: { ar: "صقور إضافية للبيع", en: "Extra falcons for sale", unit: "+" },
    eveningGiftPercent: { ar: "هدايا المساء أكبر", en: "Evening gifts are bigger", unit: "%" },
    taskRerollsAdd: { ar: "تبديلات مهام إضافية يوميًا", en: "Extra task rerolls a day", unit: "+" },
    weighingCostPercent: { ar: "ريجيم السباق (الوزن الصباحي) أرخص", en: "Race diet (morning weighing) costs less", unit: "%" }
  };
  var perkRows = [];
  list.forEach(function (b) { Object.keys(b.perks).forEach(function (k) { perkRows.push({ b: b.id, k: k, v: b.perks[k] }); }); });
  function perkCell(unit, x) { return unit === "+" ? "+" + N(x) : N(x) + "%"; }
  function perkTable(l) {
    return H.table([l === "ar" ? "المبنى" : "Building", l === "ar" ? "الفائدة" : "Perk"].concat([2, 3, 4, 5].map(function (n) { return (l === "ar" ? "المستوى " : "Level ") + n; })),
      perkRows.map(function (r) { var pk = PERK[r.k]; return [B.T(NAMES[r.b]), pk[l]].concat(r.v.map(function (x) { return perkCell(pk.unit, x); })); }));
  }

  /* worked examples: base number from the config, the same formulas as the game */
  var tr = D("training.sessions[lure]");
  var perkOf = function (b, k) { return list.filter(function (x) { return x.id === b; })[0].perks[k]; };
  function costRow(label, base, b, k) { return [label, N(base)].concat(perkOf(b, k).map(function (p) { return N(Math.floor(base * (100 - p) / 100)); })); }
  function timeRow(label, base, b, k) { return [label, N(base) + " h"].concat(perkOf(b, k).map(function (p) { return N(base * (100 - p) / 100, 2) + " h"; })); }
  var port = D("weighing.portions");
  function exampleTable(l) {
    var A = l === "ar";
    return H.table([A ? "الرقم الأساسي" : "Base number", A ? "الأساس" : "Base"].concat([2, 3, 4, 5].map(function (n) { return (A ? "المستوى " : "Level ") + n; })), [
      costRow(A ? "إطعام صقر" : "Feeding a falcon", D("care.feedCost"), "mews", "feedCostPercent"),
      costRow(A ? "تدريب التلواح" : "Lure training", tr.cost, "training", "trainingCostPercent"),
      costRow(A ? "المستشفى: الرسم الثابت" : "Hospital: base fee", D("care.hospitalCostBase"), "hospital", "hospitalCostPercent"),
      costRow(A ? "المستشفى: لكل نقطة صحة ناقصة" : "Hospital: per missing health point", D("care.hospitalCostPerMissingHealth"), "hospital", "hospitalCostPercent"),
      timeRow(A ? "مدة المستشفى" : "Hospital stay", D("care.hospitalHours"), "hospital", "hospitalTimePercent"),
      timeRow(A ? "فقس البيضة" : "Egg hatching", D("nests.hatchHours"), "breeding", "hatchTimePercent"),
      [A ? "صقور السوق في اليوم" : "Market falcons a day", N(D("market.stockSize"))].concat(perkOf("souq", "stockAdd").map(function (p) { return N(Math.min(20, D("market.stockSize") + p)); })),
      [A ? "تاجر القماش مساء الجمعة" : "Friday cloth merchant", N(D("evening.guests[5].amount"))].concat(perkOf("majlis", "eveningGiftPercent").map(function (p) { return N(Math.floor(D("evening.guests[5].amount") * (100 + p) / 100)); })),
      [A ? "تبديلات المهام" : "Task rerolls", N(D("tasks.rerollsPerDay"))].concat(perkOf("post", "taskRerollsAdd").map(function (p) { return N(Math.min(10, D("tasks.rerollsPerDay") + p)); })),
      [A ? "وجبات ريجيم السباق" : "Race diet portions", port.map(function (x) { return N(x.cost); }).join(" / ")].concat([0, 1, 2, 3].map(function (i) { var p = perkOf("pearls", "weighingCostPercent")[i]; return port.map(function (x) { return N(Math.floor(x.cost * (100 - p) / 100)); }).join(" / "); }))
    ]);
  }

  var DECOR = {
    car_shade: { ar: "مظلة السيارة", en: "Car shade" }, palm_garden: { ar: "حديقة النخيل", en: "Palm garden" }, guest_camp: { ar: "مخيم الضيوف", en: "Guest camp" },
    lanterns: { ar: "الفوانيس", en: "Lanterns" }, water_well: { ar: "بئر الماء", en: "Water well" }, coffee_corner: { ar: "ركن القهوة", en: "Coffee corner" },
    clan_banner: { ar: "راية الكلان", en: "Clan banner" }, trophy_plinth: { ar: "منصة الكؤوس", en: "Trophy plinth" }, freedom_monument: { ar: "نصب الحرية", en: "Freedom monument" },
    perch_row: { ar: "صف المجاثم", en: "Perch row" }, flight_pen: { ar: "قفص الطيران", en: "Flight pen" }, season_banner: { ar: "راية الموسم", en: "Season banner" }
  };
  function decorWhen(g, l) {
    var A = l === "ar";
    if (g.rule === "level") return (A ? "المستوى " : "Player level ") + g.min;
    if (g.rule === "clan") return A ? "أن تكون في كلان" : "You are in a clan";
    if (g.rule === "trophies") return A ? "أن تملك " + g.min + " كأسًا" : "You own " + g.min + " trophy";
    if (g.rule === "released") return A ? "أن تطلق صقرًا للبرية" : "You released " + g.min + " falcon to the wild";
    if (g.rule === "falcons") return A ? "أن تملك " + g.min + " صقور" : "You own " + g.min + " falcons";
    return A ? "أن تملك وسام موسم" : "You own a Season badge";
  }
  var growth = D("village.growth.items");
  var PHR = [["ما شاء الله!", "Masha'Allah!"], ["صقر جميل", "Beautiful falcon"], ["قرية رائعة", "Great village"], ["نلتقي في السباق", "See you at the race"], ["أهلاً يا جار", "Welcome, neighbour"], ["تحية من كلاني", "Respect from my clan"]];

  B.chapter({
    id: "village", order: 9, icon: "icons/bar_level.png",
    title: { ar: "القرية والمباني", en: "Village & buildings" },
    blurb: { ar: "مباني قريتك وترقياتها وفوائدها، تحريك المباني، خريطة الخليج، زيارة القرى، سجل الزوار، والمخزن.", en: "Your village's buildings, upgrades and perks, moving buildings, the Gulf map, visiting villages, the guest book and the Inventory." },
    sections: function () {
      return [
        {
          id: "buildings", title: { ar: "مباني القرية", en: "The buildings" },
          html: {
            ar: "<p>قريتك فيها <b>" + N(Object.keys(NAMES).length) + " مبنى</b>. " + N(list.length) + " منها تستطيع ترقيتها بالعملات، والباقي ثابتة المستوى.</p>" +
              H.table(["المبنى", "لماذا؟", "يُرقّى؟"], Object.keys(NAMES).map(function (id) { return [B.T(NAMES[id]), USE[id].ar, fixed.indexOf(id) < 0 ? "نعم" : "لا"]; })) +
              H.next("الصيد نفسه يصل مع تحديث 0.1.2. المرآب والسيارات يعملان الآن (انظر فصل المقناص).") +
              H.shots([["village/village", "قريتك: كل مبنى باسمه ومستواه"], ["village/building_sheet", "بطاقة المبنى: مستواه وما يحتاجه للترقية"]]),
            en: "<p>Your village holds <b>" + N(Object.keys(NAMES).length) + " buildings</b>. " + N(list.length) + " of them can be upgraded with coins; the rest have a fixed level.</p>" +
              H.table(["Building", "What it is for", "Upgradable?"], Object.keys(NAMES).map(function (id) { return [B.T(NAMES[id]), USE[id].en, fixed.indexOf(id) < 0 ? "Yes" : "No"]; })) +
              H.next("Hunting itself arrives with update 0.1.2. The garage and the cars already work (see the Hunting chapter).") +
              H.shots([["village/village", "Your village: every building with its name and level"], ["village/building_sheet", "The building card: its level and what the upgrade needs"]])
          }
        },
        {
          id: "levels", title: { ar: "مستويات الترقية وتكلفتها", en: "Upgrade levels and costs" },
          html: {
            ar: "<p>كل مبنى يصعد من المستوى 1 إلى " + N(steps + 1) + " في " + N(steps) + " خطوات. السعر وشرط مستواك هما نفسهما لكل المباني.</p>" +
              H.w("bars", { title: { ar: "سعر كل خطوة (عملات)", en: "Cost of each step (coins)" }, items: costs.map(function (c, i) { return { label: { ar: "من " + (i + 1) + " إلى " + (i + 2) + " (يلزم مستواك " + minL[i] + ")", en: "Level " + (i + 1) + " → " + (i + 2) + " (you need level " + minL[i] + ")" }, value: c, text: N(c) }; }) }) +
              H.kpis([[N(oneBuilding), "عملة لمبنى واحد حتى المستوى " + (steps + 1)], [N(oneBuilding * list.length), "لكل المباني الـ " + list.length], [N(maxVillage), "أعلى مستوى للقرية"]]) +
              "<ul><li>الترقية بـ<b>العملات فقط</b>، ولا تحتاج لآلئ. وهي تدوم للأبد.</li>" +
              "<li><b>لا يوجد وقت بناء.</b> يتغير المستوى فورًا عند الدفع.</li>" +
              "<li>الترقيات توفّر عملات أو وقتًا فقط. لا تغيّر نتيجة سباق ولا صفات صقر.</li>" +
              "<li><b>مستوى القرية</b> = 1 + مجموع (مستوى كل مبنى − 1). يظهر في ملفك وبطاقة قريتك.</li></ul>" +
              H.tip("ابدأ بالمباني التي توفّر لك أكثر: التدريب وسوق الصقور. والمستشفى يعطيك فائدتين (سعر ووقت) بنفس سعر غيره."),
            en: "<p>Each building climbs from level 1 to " + N(steps + 1) + " in " + N(steps) + " steps. The price and your player-level gate are the same for every building.</p>" +
              H.w("bars", { title: { ar: "سعر كل خطوة (عملات)", en: "Cost of each step (coins)" }, items: costs.map(function (c, i) { return { label: { ar: "من " + (i + 1) + " إلى " + (i + 2) + " (يلزم مستواك " + minL[i] + ")", en: "Level " + (i + 1) + " → " + (i + 2) + " (you need level " + minL[i] + ")" }, value: c, text: N(c) }; }) }) +
              H.kpis([[N(oneBuilding), "coins for one building to level " + (steps + 1)], [N(oneBuilding * list.length), "for all " + list.length + " buildings"], [N(maxVillage), "highest village level"]]) +
              "<ul><li>Upgrades cost <b>coins only</b>, never Pearls. They last for ever.</li>" +
              "<li><b>There is no build timer.</b> The level changes the moment you pay.</li>" +
              "<li>Upgrades only save coins or time. They never change a race result or a falcon's stats.</li>" +
              "<li><b>Village level</b> = 1 + the sum of (each building's level − 1). It shows on your profile and village card.</li></ul>" +
              H.tip("Start with the buildings that save you most: Training and the Falcon Market. The Hospital gives two perks (cost and time) for the same price as the others.")
          }
        },
        {
          id: "perks", title: { ar: "فوائد كل مستوى", en: "Perks per level" },
          html: {
            ar: "<p>الفائدة هي قيمتها <b>عند ذلك المستوى</b>:</p>" + perkTable("ar") +
              "<h3>أمثلة بالأرقام الحقيقية</h3>" + exampleTable("ar") +
              H.tip("هدية المساء لا تزيد عن 100 شبع أو 70,000 عملة. وتبديلات المهام لا تتجاوز 10 في اليوم."),
            en: "<p>The perk is its value <b>at that level</b>:</p>" + perkTable("en") +
              "<h3>Examples with the real numbers</h3>" + exampleTable("en") +
              H.tip("An evening gift is never bigger than 100 satiety or 70,000 coins, and task rerolls never go above 10 a day.")
          }
        },
        {
          id: "growth", title: { ar: "زينة القرية: القرية تكبر", en: "Village decorations: the village grows" },
          html: {
            ar: "<p>تظهر قطع الزينة عندما تحقق هدفها. هي للمظهر فقط.</p>" +
              H.table(["الزينة", "متى تظهر"], growth.map(function (g) { return [B.T(DECOR[g.id]), decorWhen(g, "ar")]; })),
            en: "<p>Decorations appear when you reach their goal. They are for looks only.</p>" +
              H.table(["Decoration", "Appears when"], growth.map(function (g) { return [B.T(DECOR[g.id]), decorWhen(g, "en")]; }))
          }
        },
        {
          id: "move", title: { ar: "تحريك المباني", en: "Moving buildings" },
          html: {
            ar: "<p>ضع مبانيك حيث تحب. كل لاعب يستطيع تحريك أي مبنى من المباني الـ " + N(lay.items.length) + ".</p>" +
              H.steps([
                "افتح وضع التحريك، واسحب المبنى.",
                "المواقع تلتصق بشبكة (كل " + N(lay.snap) + " وحدات)، فيبقى الترتيب مرتبًا.",
                "لا يُسمح بالوضع خارج أرض القرية أو فوق أماكن ممنوعة، ولا فوق مبنى آخر.",
                "يُحفظ الترتيب كله دفعة واحدة. ترتيب فارغ يعيد كل المباني إلى أماكنها الأصلية."
              ]) +
              H.info("الزوار يرون ترتيبك أنت. لا يوجد سعر للتحريك: جرّب كما تشاء ثم أعد الترتيب الأصلي إن لم يعجبك.") +
              H.shots([["village/move_ok", "مكان صالح: المبنى باللون الأخضر"]]),
            en: "<p>Place your buildings where you like. Every player can move any of the " + N(lay.items.length) + " village buildings.</p>" +
              H.steps([
                "Open move mode and drag a building.",
                "Positions snap to a grid (every " + N(lay.snap) + " units), so the layout stays tidy.",
                "You cannot drop a building outside the village ground, on blocked spots, or on another building.",
                "The whole layout is saved at once. An empty layout puts every building back in its first place."
              ]) +
              H.info("Visitors see your own arrangement. Moving costs nothing: try what you like, then reset if you don't.") +
              H.shots([["village/move_ok", "A valid spot: the building shows green"]])
          }
        },
        {
          id: "map", title: { ar: "خريطة الخليج", en: "The Gulf map" },
          html: {
            ar: "<p>لكل لاعب <b>مكان ثابت</b> على الخريطة: دولة، فحي، فقطعة أرض.</p>" +
              H.table(["القاعدة", "القيمة"], [
                ["دول الأماكن", "الإمارات، السعودية، الكويت، قطر، البحرين، عُمان. من دولة أخرى تشاهد الخريطة بلا مكان."],
                ["قطع الأرض في الحي", N(vil.hoodSize)],
                ["كيف تُعطى الأماكن", "بحسب ترتيب الانضمام: أول قطعة فارغة في دولتك"],
                ["ماذا تُري الخريطة", "كل دولة وعدد لاعبيها وأفضل لاعب فيها (أعلى سمعة)"],
                ["القوائم", "الأصدقاء، الكلان، الأفضل، القريبون. حتى " + N(vil.listLimit) + " اسمًا"]]) +
              H.shots([["map/map_gulf", "خريطة الخليج"], ["map/map_hood_mine", "حيّك: كل بيت لاعب"]]),
            en: "<p>Every player has a <b>fixed place</b> on the map: a country, a neighbourhood and a plot.</p>" +
              H.table(["Rule", "Value"], [
                ["Countries with places", "UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman. From another country you can see the map but have no place."],
                ["Plots in a neighbourhood", N(vil.hoodSize)],
                ["How places are given", "In join order: the first free plot in your country"],
                ["What the map shows", "Each country, how many players it has, and its top player (highest prestige)"],
                ["Lists", "Friends, clan, top, near. Up to " + N(vil.listLimit) + " names"]]) +
              H.shots([["map/map_gulf", "The Gulf map"], ["map/map_hood_mine", "Your neighbourhood: each house is a player"]])
          }
        },
        {
          id: "visit", title: { ar: "زيارة القرى وسجل الزوار", en: "Visiting villages and the guest book" },
          html: {
            ar: "<p>افتح قرية أي لاعب لتراها: اسمه ومستواه وكلانه وسيارته وكؤوسه وصقوره المطلقة وأفضل صقوره. الجينات المخفية لا تظهر أبدًا.</p>" +
              H.kpis([[N(vil.likesPerDay), "إعجابات تعطيها يوميًا"], [N(vil.guestbookPerDay), "قرى تكتب فيها يوميًا"], [N(vil.guestbookDays) + " أيام", "مدة بقاء سجل زوارك"]]) +
              "<ul><li><b>الإعجاب:</b> واحد لكل قرية في اليوم. لا يعطي عملات ولا سمعة، هو ابتسامة فقط.</li>" +
              "<li><b>سجل الزوار:</b> تختار <b>كلمة جاهزة</b> (بلا كتابة)، كلمة واحدة لكل قرية في اليوم.</li>" +
              "<li><b>سباق الشبح:</b> سابق أفضل جولة لصاحب القرية. لا تأخذ منه ولا تدفع شيئًا.</li></ul>" +
              H.table(["الكلمات الجاهزة"], PHR.map(function (p) { return [p[0]]; })) +
              H.tip("لمهمة \"زُر 3 قرى\": افتح ثلاث قرى مختلفة في يوم المهام. زيارة القرية نفسها مرتين لا تضيف شيئًا.") +
              H.shots([["visit/visit_profile", "ملف لاعب: زيارة قريته أو إضافته صديقًا"], ["map/life_book_sheet", "اختيار كلمة لسجل الزوار"], ["map/life_guestbook", "سجل زوارك"]]),
            en: "<p>Open any player's village to see it: his name, level, clan, car, trophies, released falcons and best falcons. Hidden genes are never shown.</p>" +
              H.kpis([[N(vil.likesPerDay), "likes you can give a day"], [N(vil.guestbookPerDay), "villages you can write in a day"], [N(vil.guestbookDays) + " days", "how long your guest book keeps"]]) +
              "<ul><li><b>Like:</b> one per village per day. It gives no coins and no prestige; it is a smile.</li>" +
              "<li><b>Guest book:</b> you pick one <b>ready-made word</b> (no typing), one word per village per day.</li>" +
              "<li><b>Ghost race:</b> race the best run of the village's owner. It costs and gives nothing.</li></ul>" +
              H.table(["The ready-made words"], PHR.map(function (p) { return [p[1]]; })) +
              H.tip("For the \"Visit 3 villages\" task, open three different villages in one task day. Visiting the same village twice adds nothing.") +
              H.shots([["visit/visit_profile", "A player's profile: visit his village or add him as a friend"], ["map/life_book_sheet", "Picking a word for the guest book"], ["map/life_guestbook", "Your guest book"]])
          }
        },
        {
          id: "inventory", title: { ar: "المخزن", en: "The Inventory" },
          html: {
            ar: "<p>المخزن يعرض كل ما تملكه ما عدا الصقور. تفتحه من شريط القرية (بجانب المهام) ومن ملفك ومن المتجر.</p>" +
              H.table(["المجموعة", "ما فيها"], [
                ["المال", "اللآلئ، العملات، الساعات الرملية"], ["العناية", "المقوّي، مساعد الشفاء، معزّز راحة الأنثى، معزّز التزاوج، حليب الفرخ"],
                ["بطاقات", "بطاقات تغيير الاسم (صقر، صقّار، مزرعة)، بطاقة النداء"],
                ["المقتنيات", "الأشكال، ثيمات المجلس، مستشار التزاوج، الشهادة الذهبية، العلامة التجارية، الأوسمة، الخانات الإضافية، الأعمدة"]]) +
              H.next("<b>مع تحديث 0.1.2:</b> صف جديد لمعدات المقناص: ريشة الإرسال، الـ GPS، اللاقط، والفريسة المشتراة.") +
              "<p>لكل غرض زر <b>استخدم</b> (يأخذك للشاشة المناسبة) وزر <b>احصل على المزيد</b> (يفتح المتجر أو الصيدلية).</p>" +
              H.shots([["inventory/all", "المخزن"], ["inventory/village", "زر المخزن على شريط القرية"]]),
            en: "<p>The Inventory shows everything you own except falcons. Open it from the village bar (next to Tasks), from your profile and from the Store.</p>" +
              H.table(["Group", "What is in it"], [
                ["Money", "Pearls, coins, sand-glasses"], ["Care", "Tonic, Recovery aid, Female rest booster, Breeding booster, Chick formula"],
                ["Cards", "Rename cards (falcon, falconer, farm), the Shout card"],
                ["Collection", "Looks, Majlis themes, Pairing Advisor, Gold certificate, Farm Brand, badges, extra slots, perches"]]) +
              H.next("<b>With update 0.1.2:</b> a new row for hunting gear: the electronic feather, GPS, wave receiver and bought prey.") +
              "<p>Each item has a <b>Use</b> button (it takes you to the right screen) and a <b>Get more</b> button (it opens the Store or the Pharmacy).</p>" +
              H.shots([["inventory/all", "The Inventory"], ["inventory/village", "The Inventory button on the village bar"]])
          }
        }
      ];
    }
  });
})(window.Book);
