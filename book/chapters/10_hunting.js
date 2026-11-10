/* Chapter 10 - Hunting (Al-Maqnas), cars and garage. Facts: Docs/Systems/10_hunting.md.
   Numbers come from data.js through B.D() (extra.hunting_* and extra.car_rules). Animal habitats and best hours are the
   designer's own words (Docs/Systems/10_hunting.md), written by hand here because the data file holds them as curves. */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var HX = "extra.", shop = D(HX + "hunting_shop"), onl = D(HX + "hunting_online"), mp = D(HX + "hunting_map"), cg = D(HX + "hunting_courage");
  var lure = D(HX + "hunting_lure"), ev = D(HX + "hunting_events"), rules = D(HX + "car_rules"), animals = D(HX + "hunting_animals.Animals");
  var cr = cg.courage, cond = cg.conditions, sp = cg.species, lost = shop.lost, trip = shop.trip, gear = shop.gear, wk = ev.weekly;
  function an(id) { return animals.filter(function (a) { return a.Id === id; })[0]; }
  function usd(x) { return "$" + N(x); }
  var DAYS = [{ ar: "الأحد", en: "Sunday" }, { ar: "الاثنين", en: "Monday" }, { ar: "الثلاثاء", en: "Tuesday" }, { ar: "الأربعاء", en: "Wednesday" }, { ar: "الخميس", en: "Thursday" }, { ar: "الجمعة", en: "Friday" }, { ar: "السبت", en: "Saturday" }];
  var NAMES = {
    pigeon: { ar: "حمام", en: "Pigeon" }, rabbit: { ar: "أرنب", en: "Rabbit" }, seagull: { ar: "طاير الحريش", en: "Seagull" },
    houbara: { ar: "حبارى", en: "Houbara" }, houbara_male: { ar: "خرب (ذكر الحبارى)", en: "Khurb (male houbara)" }
  };
  var DIFF = { easy: { ar: "سهل", en: "easy" }, medium: { ar: "متوسط", en: "medium" }, hard: { ar: "صعب", en: "hard" }, veryHard: { ar: "صعب جدًا", en: "very hard" } };
  var ids = ["pigeon", "rabbit", "seagull", "houbara", "houbara_male"];
  var WHERE = {
    pigeon: { ar: "أشجار الغاف والواحات والصخور", en: "ghaf trees, oases, rocks" },
    rabbit: { ar: "أرض الشجيرات والجحور", en: "bush flats and burrows" },
    seagull: { ar: "الواحة والبركة", en: "the oasis and the pool" },
    houbara: { ar: "السهول الحصوية، بعيدًا " + N(an("houbara").MinFromCampM) + " م عن مخيمك على الأقل", en: "gravel plains, at least " + N(an("houbara").MinFromCampM) + " m from your camp" },
    houbara_male: { ar: "أعمق السهول، بعيدًا " + N(an("houbara_male").MinFromCampM) + " م عن المخيم على الأقل", en: "the deepest plains, at least " + N(an("houbara_male").MinFromCampM) + " m from camp" }
  };
  var HOURS = {
    pigeon: { ar: "طوال اليوم، وأكثر من 05:30 إلى 08:00 وعند 16:00", en: "all day; busiest 05:30 to 08:00 and at 16:00" },
    rabbit: { ar: "الفجر والغروب، وأكثر من 18:00 إلى 20:00", en: "dawn and dusk; busiest 18:00 to 20:00" },
    seagull: { ar: "من 06:30 إلى 18:00، وأكثر من 09:00 إلى 15:00", en: "06:30 to 18:00; busiest 09:00 to 15:00" },
    houbara: { ar: "غالبًا من 05:00 إلى 10:00، وأكثر عند 06:00", en: "mostly 05:00 to 10:00; busiest at 06:00" },
    houbara_male: { ar: "من 05:00 إلى 09:00، وأكثر عند 06:00", en: "05:00 to 09:00; busiest at 06:00" }
  };
  function group(a) { return a.GroupMin === a.GroupMax ? String(a.GroupMin) : a.GroupMin + "–" + a.GroupMax; }
  function animalTable(l) {
    var A = l === "ar";
    return H.table(A ? ["الحيوان", "أين", "أفضل ساعات (توقيت الخليج)", "العدد", "سرعة / تحمل / مراوغة / يقظة / قتال", "مسافة الفرار", "الصعوبة"] : ["Animal", "Where", "Best hours (Gulf time)", "Group", "Speed / Stamina / Evasion / Vigilance / Fight", "Flush distance", "Difficulty"],
      ids.map(function (id) { var a = an(id); return ["<b>" + B.T(NAMES[id]) + "</b>", WHERE[id][l], HOURS[id][l], group(a), [a.Speed, a.Stamina, a.Evasion, a.Vigilance, a.Fight].join(" / "), N(a.FlushM) + " " + (A ? "م" : "m"), B.T(DIFF[sp[id].difficulty])]; }));
  }
  function rewardTable(l) {
    var A = l === "ar";
    return H.table(A ? ["الحيوان", "نقاط الشجاعة", "العملات", "السمعة", "عملات الكأس في سعر الصقر"] : ["Animal", "Courage XP", "Coins", "Prestige", "Trophy coins in the price"],
      ids.map(function (id) { var s = sp[id]; return [B.T(NAMES[id]), N(s.xp), N(s.coins), N(s.prestige), s.trophyCoins ? N(s.trophyCoins) : (A ? "لا شيء" : "none")]; }));
  }
  var CARS = [
    { id: "sierra26", n: { ar: "سهم 26", en: "Sahm 26" }, how: { ar: "مجانية للجميع", en: "free for everyone" } },
    { id: "lc79", n: { ar: "شاص 79", en: "Shass 79" }, how: { ar: usd(D("shop.offers[car_lc79].usd")), en: usd(D("shop.offers[car_lc79].usd")) } },
    { id: "patrol_vtc", n: { ar: "وافي VTC", en: "Wafi VTC" }, how: { ar: usd(D("shop.offers[car_patrol_vtc].usd")), en: usd(D("shop.offers[car_patrol_vtc].usd")) } }
  ];
  function speed(c) { return Math.round(rules.speedKmhAtZero + rules.speedKmhPerPower * rules.cars[c].power); }
  function carTable(l) {
    var A = l === "ar";
    return H.table(A ? ["السيارة", "كيف تحصل عليها", "القوة", "التماسك", "الثبات", "الارتفاع", "الوزن (كغ)", "أقصى سقف للصفة"] : ["Car", "How you get it", "Power", "Grip", "Stability", "Clearance", "Weight (kg)", "Max for any stat"],
      CARS.map(function (c) { var s = rules.cars[c.id]; return ["<b>" + B.T(c.n) + "</b>", c.how[l], s.power, s.grip, s.stability, s.clearance, N(s.weightKg), s.max]; }));
  }
  var PARTS = { engine: { ar: "المحرك", en: "Engine" }, filter: { ar: "فلتر الهواء", en: "Air filter" }, exhaust: { ar: "العادم", en: "Exhaust" }, tyres: { ar: "الإطارات", en: "Tyres" }, shocks: { ar: "المساعدات", en: "Shocks" } };
  var STAT = { power: { ar: "القوة", en: "power" }, grip: { ar: "التماسك", en: "grip" }, stability: { ar: "الثبات", en: "stability" }, clearance: { ar: "الارتفاع", en: "clearance" } };
  function partCell(lvl, l) { return Object.keys(lvl).filter(function (k) { return k !== "price"; }).map(function (k) { return STAT[k][l] + " +" + lvl[k]; }).join("، ").replace(/، /g, l === "ar" ? "، " : ", "); }
  function partTable(l) {
    var A = l === "ar";
    var pr = rules.parts.engine.map(function (x) { return N(x.price); });
    return H.table([A ? "القطعة" : "Part"].concat(rules.parts.engine.map(function (x, i) { return (A ? "المستوى " : "Level ") + (i + 1) + " (" + N(x.price) + (A ? " عملة)" : " coins)"); })),
      rules.slots.map(function (s) { return [B.T(PARTS[s])].concat(rules.parts[s].map(function (lvl) { return partCell(lvl, l); })); }));
  }
  var allParts = rules.slots.reduce(function (a, s) { return a + rules.parts[s].reduce(function (b, x) { return b + x.price; }, 0); }, 0);
  var prey = shop.prey.items;

  B.chapter({
    id: "hunting", order: 10, icon: "icons/hunt_binoculars.png",
    title: { ar: "المقناص", en: "Hunting" },
    blurb: { ar: "تقود سيارتك في الصحراء، ترصد الطيور، وتطلق صقرك لمطاردة حقيقية. الشجاعة والسيارات والمرآب وبطولات المقناص.", en: "Drive your car through the desert, spot wild birds and release your falcon for a real chase. Courage, cars, the garage and hunting tournaments." },
    sections: function () {
      return [
        {
          id: "how", title: { ar: "كيف تعمل رحلة الصيد", en: "How a hunt works" },
          html: {
            ar: H.next("<b>المقناص يصل مع تحديث 0.1.2.</b> حتى ذلك الحين يبقى زر \"اذهب للصيد\" مخفيًا. <b>المرآب والسيارات يعملان الآن</b>. كل ما يلي يصف إصدار الصيد.") +
              "<p>المقناص صحراء كبيرة مشتركة. تقود فيها سيارة، وترصد الطيور البرية، وتطلق صقرك لمطاردة حقيقية.</p>" +
              H.steps([
                "افتح <b>المرآب</b> (مبنى المقناص في قريتك)، اختر سيارتك، واضغط زر <b>اذهب للصيد</b> الذهبي.",
                "اختر <b>صقرًا بالغًا واحدًا</b> للرحلة. هو وحده يذهب. تدفع رسم الرحلة. رحلة واحدة مفتوحة في كل مرة، وأطولها <b>" + N(trip.maxMinutes) + " دقيقة</b>.",
                "اختر <b>واحدة من " + N(onl.deserts) + " صحارى</b>. في كل صحراء حتى <b>" + N(onl.shardMax) + " لاعبًا</b>، والصحراء الممتلئة لا تُختار. الكل في صحراء واحدة يرى الحيوانات والطقس والساعة نفسها.",
                "<b>قُد وابحث.</b> الصحراء " + N(mp.SizeM / 1000) + " كم × " + N(mp.SizeM / 1000) + " كم، وساعتها هي ساعة الخليج الحقيقية (UTC+4). الفجر والعصر أفضل الأوقات.",
                "<b>الرصد:</b> من السيارة يرى صقرك حتى " + N(mp.Seeing.CarM) + " م في قوس " + N(mp.Seeing.CarHalfDeg * 2) + "° أمامك. من القفاز يرى حتى " + N(mp.Seeing.FistM) + " م في قوس " + N(mp.Seeing.FistHalfDeg * 2) + "°. تظهر قائمة بحد أقصى " + N(mp.Seeing.ListMax) + " حيوانات، الأقرب أولًا. اضغط واحدًا لتختاره.",
                "<b>الإطلاق:</b> الهدوء والبطء يقرّبانك أكثر. لكل حيوان مسافة فرار: إن قدت نحوه مباشرة طار قبل أن تقترب.",
                "<b>شاهد المطاردة.</b> الخادم يقرر النتيجة من صفات صقرك وشجاعته وحالته أمام الحيوان.",
                "<b>النتيجة:</b> صيدة، أو هروب، أو صقر خائف، أو صقر ضائع. الصقر يصيد حتى <b>" + N(onl.killsPerFalcon) + " صيدة في الرحلة</b> ثم ينتهي دوره.",
                "<b>التلواح على الأقدام:</b> امشِ حتى " + N(lure.RangeM) + " م من صقرك. حلقة ذهبية تنغلق على التلواح كل " + N(lure.PassSeconds) + " ثانية: اضغط عند انغلاقها. خلال " + N(lure.PerfectWindow) + " ثانية من الإغلاق = ممتاز، وخلال " + N(lure.GoodWindow) + " ثانية = جيد. تحتاج " + N(lure.NeedHits) + " ضغطات جيدة. خلال " + N(lure.FastRings) + " حلقات ينزل الصقر مباشرة، وبعد " + N(lure.MaxRings) + " ينزل على أي حال. الخطأ يكلفك حلقة فقط، وزر التلواح يعود بعد " + N(lure.RetrySeconds) + " ثوانٍ.",
                "<b>أنهِ الرحلة</b> لتعود إلى بيتك."
              ]) +
              H.tip("صقر يُترك ينتظر " + N(lure.WaitLostSeconds / 60) + " دقائق بعد الإطلاق يضيع. استدعِه بالتلواح قبل ذلك.") +
              H.shots([["hunt/hunt_01_camp", "في المقناص: سيارتك في الصحراء"], ["lure/lure_03_run", "لعبة التلواح (نسخة التدريب): الحلقة الذهبية تنغلق على التلواح"]]),
            en: H.next("<b>Hunting arrives with update 0.1.2.</b> Until then the \"Go hunting\" button stays hidden. <b>The garage and the cars already work</b>. Everything below describes the hunting release.") +
              "<p>Hunting is a big shared desert. You drive a car, spot wild birds and release your falcon for a real chase.</p>" +
              H.steps([
                "Open the <b>Garage</b> (the Hunting building in your village), pick your car and tap the gold <b>Go hunting</b> button.",
                "Pick <b>one grown falcon</b> for the trip. Only that falcon goes. You pay the trip fee. One open trip at a time, and a trip lasts <b>" + N(trip.maxMinutes) + " minutes</b> at most.",
                "Choose <b>one of " + N(onl.deserts) + " deserts</b>. Each desert holds up to <b>" + N(onl.shardMax) + " players</b>, and a full desert cannot be picked. Everyone in a desert sees the same animals, weather and clock.",
                "<b>Drive and search.</b> The desert is " + N(mp.SizeM / 1000) + " km by " + N(mp.SizeM / 1000) + " km, and its clock is the real Gulf clock (UTC+4). Dawn and late afternoon are the best hours.",
                "<b>Spot:</b> from the car your falcon sees up to " + N(mp.Seeing.CarM) + " m in a " + N(mp.Seeing.CarHalfDeg * 2) + "° arc in front. From the glove it sees up to " + N(mp.Seeing.FistM) + " m in a " + N(mp.Seeing.FistHalfDeg * 2) + "° arc. A list of up to " + N(mp.Seeing.ListMax) + " animals shows, closest first. Tap one to pick it.",
                "<b>Release:</b> slow and quiet gets you closer. Each animal has a flush distance: if you drive straight at it, it flies before you are close.",
                "<b>Watch the chase.</b> The server decides the result from your falcon's stats, courage and condition against the animal.",
                "<b>Result:</b> a kill, an escape, a scared falcon, or a lost falcon. A falcon makes up to <b>" + N(onl.killsPerFalcon) + " kills a trip</b>, then it is done for the trip.",
                "<b>Lure on foot:</b> walk to within " + N(lure.RangeM) + " m of your falcon. A gold ring closes on the lure every " + N(lure.PassSeconds) + " seconds: tap when it closes. Within " + N(lure.PerfectWindow) + " s of the close is perfect, within " + N(lure.GoodWindow) + " s is good. You need " + N(lure.NeedHits) + " good taps. Within " + N(lure.FastRings) + " rings it comes straight in; after " + N(lure.MaxRings) + " it comes anyway. A miss only costs a ring, and the lure button is back after " + N(lure.RetrySeconds) + " seconds.",
                "<b>End the trip</b> to go home."
              ]) +
              H.tip("A falcon left waiting " + N(lure.WaitLostSeconds / 60) + " minutes after release is lost. Call it in with the lure before then.") +
              H.shots([["hunt/hunt_01_camp", "Hunting: your car in the desert"], ["lure/lure_03_run", "The lure game (training version): the gold ring closes on the lure"]])
          }
        },
        {
          id: "desert", title: { ar: "الطقس والوقت", en: "Weather and time" },
          html: {
            ar: "<p>طقس اليوم واحد للجميع. الرياح من الشمال الغربي.</p>" +
              H.w("bars", { title: { ar: "طقس اليوم", en: "The day's weather" }, items: [
                { label: { ar: "صافٍ", en: "Clear" }, value: mp.Weather.ClearShare * 100, text: P(mp.Weather.ClearShare) },
                { label: { ar: "رياح", en: "Windy" }, value: mp.Weather.WindyShare * 100, text: P(mp.Weather.WindyShare) },
                { label: { ar: "ضباب", en: "Fog" }, value: mp.Weather.FogShare * 100, text: P(mp.Weather.FogShare) }] }) +
              "<ul><li>الضباب يجلس عند الفجر ويزول قبل الساعة 09:30. ويقصّر الرؤية إلى " + N(mp.Weather.FogViewM) + " م.</li>" +
              "<li>الحيوانات تظهر فقط ضمن نحو " + N(mp.ViewM) + " م منك (\"اذهب وابحث\").</li>" +
              "<li>في الصحراء ثلاث واحات (واحدة كبيرة واثنتان صغيرتان) فيها ماء ونخيل.</li>" +
              "<li>آثار الأقدام في الرمل تدل على حيوانات قريبة، والحبارى والخرب ينادي من بعيد: أوقف المحرك واستمع.</li></ul>" +
              H.tip("اخرج مع الفجر الحقيقي: الحبارى والخرب يظهران غالبًا من 05:00 إلى 10:00 بتوقيت الخليج.") +
              H.shots([["hunt/hunt_11c_morning_fog", "ضباب الصباح"], ["hunt/hunt_12_dawn", "الفجر في الصحراء"], ["hunt/hunt_10b_big_oasis", "الواحة الكبيرة: ماء ونخيل"]]),
            en: "<p>The day's weather is the same for everybody. The wind blows from the north-west.</p>" +
              H.w("bars", { title: { ar: "طقس اليوم", en: "The day's weather" }, items: [
                { label: { ar: "صافٍ", en: "Clear" }, value: mp.Weather.ClearShare * 100, text: P(mp.Weather.ClearShare) },
                { label: { ar: "رياح", en: "Windy" }, value: mp.Weather.WindyShare * 100, text: P(mp.Weather.WindyShare) },
                { label: { ar: "ضباب", en: "Fog" }, value: mp.Weather.FogShare * 100, text: P(mp.Weather.FogShare) }] }) +
              "<ul><li>Fog sits at dawn and is gone before 09:30. It cuts your view to " + N(mp.Weather.FogViewM) + " m.</li>" +
              "<li>Animals show only within about " + N(mp.ViewM) + " m of you (\"go and look\").</li>" +
              "<li>The desert has three oases (one big, two small) with water and palms.</li>" +
              "<li>Tracks in the sand show fresh animals nearby, and houbara and khurb call from far away: stop the engine and listen.</li></ul>" +
              H.tip("Go at real dawn: houbara and khurb are out mostly from 05:00 to 10:00 Gulf time.") +
              H.shots([["hunt/hunt_11c_morning_fog", "Morning fog"], ["hunt/hunt_12_dawn", "Dawn in the desert"], ["hunt/hunt_10b_big_oasis", "The big oasis: water and palms"]])
          }
        },
        {
          id: "animals", title: { ar: "الحيوانات", en: "The animals" },
          html: {
            ar: "<p>في الصحراء خمسة حيوانات. الصفات من 0 إلى 100. <b>مسافة الفرار</b> هي أقرب ما تصل إليه بالسيارة في العراء قبل أن يطير. سيرًا على الأقدام أو خلف كثيب تقترب أكثر.</p>" +
              animalTable("ar") +
              H.w("bars", { title: { ar: "مسافة الفرار (متر)", en: "Flush distance (m)" }, items: ids.map(function (id) { return { label: NAMES[id], value: an(id).FlushM, text: N(an(id).FlushM) + " م" }; }) }) +
              "<ul><li>أعلى فرصة صيد للحبارى <b>" + P(an("houbara").MaxKillChance) + "</b> وللخرب <b>" + P(an("houbara_male").MaxKillChance) + "</b>. الصقر الضعيف فرصته صغيرة جدًا مع الخرب.</li>" +
              "<li>الحبارى تنادي من " + N(an("houbara").CallM) + " م، والخرب من " + N(an("houbara_male").CallM) + " م.</li></ul>" +
              H.tip("الصقر الصغير أو قليل الشجاعة لا يأخذ الخرب. ابدأ بالحمام والأرانب.") +
              H.shots([["hunt/hunt_24_fresh_tracks", "آثار طازجة في الرمل"], ["hunt/hunt_22_pigeons_flush_on_foot", "حمام يطير عند الاقتراب"]]),
            en: "<p>The desert holds five animals. Stats go from 0 to 100. The <b>flush distance</b> is how close you can come in the open with a car before it flies. On foot or behind a dune you can come closer.</p>" +
              animalTable("en") +
              H.w("bars", { title: { ar: "مسافة الفرار (متر)", en: "Flush distance (m)" }, items: ids.map(function (id) { return { label: NAMES[id], value: an(id).FlushM, text: N(an(id).FlushM) + " m" }; }) }) +
              "<ul><li>The top kill chance is <b>" + P(an("houbara").MaxKillChance) + "</b> for a houbara and <b>" + P(an("houbara_male").MaxKillChance) + "</b> for a khurb. A weak falcon has only a tiny chance at a khurb.</li>" +
              "<li>A houbara calls from " + N(an("houbara").CallM) + " m, a khurb from " + N(an("houbara_male").CallM) + " m.</li></ul>" +
              H.tip("A young or low-courage falcon cannot take a khurb. Start with pigeons and rabbits.") +
              H.shots([["hunt/hunt_24_fresh_tracks", "Fresh tracks in the sand"], ["hunt/hunt_22_pigeons_flush_on_foot", "Pigeons flush as you come close"]])
          }
        },
        {
          id: "cost", title: { ar: "تكلفة الرحلة والمعدات", en: "Trip cost and gear" },
          html: {
            ar: H.kpis([[N(trip.feeCoins), "عملة رسم الرحلة"], [N(trip.vipFeeCoins), "عملة لعضو VIP"], [N(trip.maxMinutes) + " د", "أطول رحلة"]]) +
              H.table(["الغرض", "السعر", "ملاحظة"], [
                ["ريشة الإرسال", N(gear.featherPearls) + " لؤلؤة <b>أو</b> " + N(gear.featherCoins) + " عملة", "واحدة لكل صقر، دائمة بعد التركيب. بدونها لا تراه أجهزة التتبع."],
                ["جهاز GPS", N(gear.gpsPearls) + " لؤلؤة، مرة واحدة", "يفتح الخريطة الحية: صقرك وأنت واللاعبون الآخرون. بدونه تصيد \"عمياء\"."],
                ["اللاقط", N(gear.receiverCoins) + " عملة، مرة واحدة", "بلا نقطة على الخريطة: تسرع الصفارات وتعلو كلما وجّهته نحو صقرك."],
                ["فريسة مشتراة: حمامة", N(prey[0].coins) + " عملة", ""],
                ["فريسة مشتراة: أرنب", N(prey[1].coins) + " عملة", ""],
                ["فريسة مشتراة: حبارى", N(prey[2].coins) + " عملة", "لا تُحسب في حبارى اليوم"]]) +
              "<p>تشتري حتى " + N(shop.prey.buyQtyMax) + " دفعة واحدة. المعدات تُباع في المخزن، لا في المتجر.</p>" +
              "<h3>الفريسة المشتراة والشارة</h3><p>الفريسة المشتراة أضعف من البرية: تعطي " + N(cr.boughtPercent) + "% من نقاط الشجاعة و" + N(cg.rewards.boughtPercent) + "% من العملات. تطلقها <b>لنفسك</b> أو <b>للجميع</b>. وإن أطلقتها للجميع فقد تضع عليها <b>شارة</b> (جائزة) من " + N(onl.bought.sharahMin) + " إلى " + N(onl.bought.sharahMax) + " عملة، حتى " + N(onl.bought.sharahPerDay) + " شارات في اليوم. من يصيدها يأخذها، وإن لم يصدها أحد عادت إليك.</p>" +
              H.next("<b>مع تحديث 0.1.2:</b> الاسم في كل النصوص صار <b>الشارة</b>، والفريسة المشتراة أضعف: <b>نصف قوة</b> الفريسة البرية. وإذا أطلقتها للجميع تصير <b>طابورًا</b>:") +
              H.steps([
                "من حولها يضغط <b>«أبي أحاول»</b> ويدخل الطابور. الأول يأتي أولًا، ولكل لاعب <b>محاولة واحدة</b>.",
                "صاحب الدور وحده يطارد، ودوره <b>" + N(onl.bought.turnSeconds / 60) + " دقائق</b>. من لم يستعمل دوره يضيع عليه ويمر الدور للتالي.",
                "إذا فشلت المطاردة تهرب الفريسة <b>" + N(onl.reflushM) + " م</b> أبعد ويبدأ دور التالي فورًا.",
                "تعيش الفريسة المطلقة <b>" + N(onl.bought.liveMin) + " دقيقة</b>. من يصيدها يأخذ الشارة، وإن صادها صاحبها عادت إليه.",
                "الشارة ترجع إلى صاحبها إذا انتهت الساعة أو لم يبقَ أحد في الطابور."
              ]) +
              H.next("<b>مع تحديث 0.1.2 أيضًا:</b> يمشي الصقّار في الصحراء أسرع <b>1.5 مرة</b> (" + N(mp.Walk.ForwardMs) + " م/ث)."),
            en: H.kpis([[N(trip.feeCoins), "coins, the trip fee"], [N(trip.vipFeeCoins), "coins for a VIP member"], [N(trip.maxMinutes) + " min", "longest trip"]]) +
              H.table(["Item", "Price", "Note"], [
                ["Electronic feather", N(gear.featherPearls) + " Pearls <b>or</b> " + N(gear.featherCoins) + " coins", "One per falcon, permanent once fitted. Without it the trackers see nothing."],
                ["GPS", N(gear.gpsPearls) + " Pearls, once", "Opens the live map: your falcon, you and the other players. Without it you hunt \"blind\"."],
                ["Wave receiver", N(gear.receiverCoins) + " coins, once", "No dot on the map: the beeps get faster and louder as you point at your falcon."],
                ["Bought prey: pigeon", N(prey[0].coins) + " coins", ""],
                ["Bought prey: rabbit", N(prey[1].coins) + " coins", ""],
                ["Bought prey: houbara", N(prey[2].coins) + " coins", "Does not count for the daily houbara"]]) +
              "<p>You can buy up to " + N(shop.prey.buyQtyMax) + " at once. Gear is sold in the Inventory, not in the Store.</p>" +
              "<h3>Bought prey and the Sharah</h3><p>Bought prey is weaker than wild prey: it gives " + N(cr.boughtPercent) + "% of the courage XP and " + N(cg.rewards.boughtPercent) + "% of the coins. You release it <b>for yourself</b> or <b>for everyone</b>. Released for everyone, you may put a <b>Sharah</b> (a reward pool) on it, from " + N(onl.bought.sharahMin) + " to " + N(onl.bought.sharahMax) + " coins, up to " + N(onl.bought.sharahPerDay) + " a day. Whoever kills it takes it; if nobody does, it comes back to you.</p>" +
              H.next("<b>With update 0.1.2:</b> the prize is named the <b>Sharah badge</b> everywhere, and a bought animal is weaker: <b>half as strong</b> as a wild one. Released for everyone it becomes a <b>queue</b>:") +
              H.steps([
                "Players near it press <b>\"Abi ahawel\" (I want to try)</b> to join the queue. First come, first served, and <b>one try</b> per player.",
                "Only the player whose turn it is may chase, for <b>" + N(onl.bought.turnSeconds / 60) + " minutes</b>. An unused turn is lost and passes on.",
                "If the chase fails the animal flees <b>" + N(onl.reflushM) + " m</b> farther and the next turn starts at once.",
                "A released animal lives <b>" + N(onl.bought.liveMin) + " minutes</b>. The killer takes the Sharah badge prize; if the owner kills it himself, it goes back to him.",
                "The Sharah goes back to the owner if the hour ends or nobody is left in the queue."
              ]) +
              H.next("<b>Also with update 0.1.2:</b> the falconer walks <b>1.5 times faster</b> in the desert (" + N(mp.Walk.ForwardMs) + " m/s)."),
          }
        },
        {
          id: "courage", title: { ar: "الشجاعة والمكافآت", en: "Courage and rewards" },
          html: {
            ar: "<p><b>الشجاعة</b> صفة دائمة جديدة لكل صقر. كل نقطة شجاعة تزيد <b>كل صفاته الخمس</b> بنسبة " + N(cr.statPercentPerPoint) + "%، وفي كل مكان، حتى في السباقات.</p>" +
              H.kpis([["0–" + N(cr.maxPoints), "نقطة شجاعة"], [N(cr.xpPerPoint), "نقطة خبرة لكل نقطة شجاعة"], ["+" + N(cr.maxPoints * cr.statPercentPerPoint) + "%", "كل الصفات عند الحد الأقصى"], ["+" + N(cg.valuation.percentPerCouragePoint) + "%", "سعر الصقر لكل نقطة"]]) +
              "<h3>مكافآت الصيدة البرية</h3>" + rewardTable("ar") +
              H.table(["القاعدة", "القيمة"], [
                ["أول صيدة برية من كل حيوان", "خبرة ×" + N(cr.firstWildKillMultiplier)],
                ["بعد " + N(cr.farmKillsPerDay) + " صيدات من نفس الحيوان في اليوم", "تنزل الخبرة إلى " + N(cr.farmPercent) + "% حتى اليوم التالي"],
                ["مطاردة شريفة فاشلة", "1 خبرة كل " + N(cr.honestChaseSecondsPerXp) + " ثانية، حتى " + N(cr.honestChaseXpMax) + "، وحتى " + N(cr.honestChasesPerDay) + " مطاردات في اليوم"],
                ["سعر الصقر", "+" + N(cg.valuation.percentPerCouragePoint) + "% لكل نقطة شجاعة، ومعها عملات الكأس لأول " + N(cg.valuation.trophyKillsCounted) + " صيدات حبارى"]]) +
              "<p>الألقاب: <b>صائد الحبارى</b> (صيدة برية واحدة من الحبارى أو الخرب)، <b>صائد الخرب</b> (خرب بري واحد)، و<b>سيد الحبارى</b> (" + N(cg.titles[0].wildKills) + " صيدات).</p>" +
              H.tip("العملات صغيرة عن قصد. المكافأة الحقيقية هي الشجاعة والسمعة وسعر الصقر. وبعد " + N(cr.farmKillsPerDay) + " صيدات من حيوان واحد تنخفض الخبرة، فنوّع صيدك."),
            en: "<p><b>Courage</b> is a new permanent stat of every falcon. Each courage point adds " + N(cr.statPercentPerPoint) + "% to <b>all five of its stats</b>, everywhere, even in races.</p>" +
              H.kpis([["0–" + N(cr.maxPoints), "courage points"], [N(cr.xpPerPoint), "XP for one point"], ["+" + N(cr.maxPoints * cr.statPercentPerPoint) + "%", "all stats at the maximum"], ["+" + N(cg.valuation.percentPerCouragePoint) + "%", "falcon price per point"]]) +
              "<h3>Rewards for a wild kill</h3>" + rewardTable("en") +
              H.table(["Rule", "Value"], [
                ["First wild kill of each animal", "XP ×" + N(cr.firstWildKillMultiplier)],
                ["After " + N(cr.farmKillsPerDay) + " kills of the same animal in one day", "XP drops to " + N(cr.farmPercent) + "% until the next day"],
                ["An honest chase that fails", "1 XP per " + N(cr.honestChaseSecondsPerXp) + " seconds, at most " + N(cr.honestChaseXpMax) + ", and at most " + N(cr.honestChasesPerDay) + " chases a day"],
                ["Falcon price", "+" + N(cg.valuation.percentPerCouragePoint) + "% per courage point, plus trophy coins for the first " + N(cg.valuation.trophyKillsCounted) + " houbara kills"]]) +
              "<p>Titles: <b>Houbara hunter</b> (one wild houbara or khurb), <b>Khurb hunter</b> (one wild khurb) and <b>Houbara master</b> (" + N(cg.titles[0].wildKills) + " kills).</p>" +
              H.tip("Coins are small on purpose. The real rewards are courage, prestige and falcon price. After " + N(cr.farmKillsPerDay) + " kills of one animal the XP drops, so mix your game.")
          }
        },
        {
          id: "fear", title: { ar: "الخوف والإصابة والصقر الضائع", en: "Fear, injury and the lost falcon" },
          html: {
            ar: "<ul><li><b>الخوف:</b> قد يخاف الصقر فتنقص صفاته " + N(cond.scaredStatPercent) + "% ويرفض الفريسة الصعبة. بعد " + N(cond.waryAfterScares) + " مرات يصبح حذرًا. العلاج: " + N(cond.fearCureCoins) + " عملة و" + N(cond.fearCureHours) + " ساعة.</li>" +
              "<li><b>الرش:</b> الحبارى أو الخرب قد يرش الصقر فتنقص صفاته " + N(cond.sprayedStatPercent) + "% حتى يُغسل. الغسل: " + N(cond.washCoins) + " عملة و" + N(cond.washHours) + " ساعات.</li>" +
              "<li><b>الصحة:</b> كل مطاردة تكلف صحة: " + N(cond.chaseHealthBase) + " + " + N(cond.chaseHealthPerMinute) + " لكل دقيقة. التحمل العالي يخفّضها " + N(cond.staminaShieldPercent) + "%. علاج الإصابة في المستشفى.</li>" +
              "<li>الصقر المتعب والجائع يطارد أسوأ. أعده إلى البيت.</li></ul>" +
              "<h3>الصقر الضائع</h3><p>إن طار صقرك خلف الأفق صار طائرًا حيًا على الخريطة لمدة <b>" + N(lost.hours) + " ساعة</b>. بعدها يضيع للأبد.</p>" +
              H.table(["القاعدة", "القيمة"], [
                ["كيف تجده", "ريشة + GPS (نقطة على الخريطة)، أو ريشة + لاقط (صفارات)، أو بالبحث"],
                ["اللاعبون الآخرون", "في حدود " + N(lost.seeM) + " م يرونه، وفي حدود " + N(lost.reportM) + " م يبلغونك عنه. <b>لا يستطيعون الاحتفاظ به أبدًا.</b>"],
                ["الاسترجاع", "اقترب حتى " + N(lost.recoverM) + " م ببطء. القيادة السريعة تخيفه: في حدود " + N(lost.disturbM) + " م يطير، ثم " + N(lost.disturbGapS) + " ثانية هدوء."],
                ["مكافأة من يجده", N(lost.rescuePrestige) + " سمعة لكل إنقاذ، حتى " + N(lost.rescuesPaidPerDay) + " في اليوم، ويُحسب في قاعة الأبطال"],
                ["الصقر المسترجَع", "يعود متعبًا وجائعًا"]]) +
              H.tip("ركّب ريشة الإرسال <b>قبل</b> أن تجرّب الحبارى."),
            en: "<ul><li><b>Fear:</b> a falcon can get scared: its stats drop " + N(cond.scaredStatPercent) + "% and it refuses hard prey. After " + N(cond.waryAfterScares) + " scares it becomes wary. The cure costs " + N(cond.fearCureCoins) + " coins and " + N(cond.fearCureHours) + " hours.</li>" +
              "<li><b>Spray:</b> a houbara or khurb can spray the falcon: its stats drop " + N(cond.sprayedStatPercent) + "% until it is washed. A wash costs " + N(cond.washCoins) + " coins and " + N(cond.washHours) + " hours.</li>" +
              "<li><b>Health:</b> every chase costs health: " + N(cond.chaseHealthBase) + " + " + N(cond.chaseHealthPerMinute) + " per minute. High stamina cuts it by " + N(cond.staminaShieldPercent) + "%. Injuries are treated at the hospital.</li>" +
              "<li>A tired, hungry falcon chases worse. Take it home.</li></ul>" +
              "<h3>The lost falcon</h3><p>If your falcon flies off over the horizon, it becomes a live bird on the map for <b>" + N(lost.hours) + " hours</b>. After that it is gone for ever.</p>" +
              H.table(["Rule", "Value"], [
                ["How you find it", "Feather + GPS (a dot on the map), or feather + receiver (beeps), or by searching"],
                ["Other players", "Within " + N(lost.seeM) + " m they can see it, and within " + N(lost.reportM) + " m they can report it to you. <b>They can never keep it.</b>"],
                ["Recovering it", "Get within " + N(lost.recoverM) + " m, slowly. Fast driving spooks it: within " + N(lost.disturbM) + " m it flies off, then " + N(lost.disturbGapS) + " seconds of calm."],
                ["Finder's reward", N(lost.rescuePrestige) + " prestige per rescue, up to " + N(lost.rescuesPaidPerDay) + " a day, and it counts in the Hall of Champions"],
                ["A recovered falcon", "Comes back tired and hungry"]]) +
              H.tip("Fit the electronic feather <b>before</b> you try a houbara.")
          }
        },
        {
          id: "cars", title: { ar: "السيارات والمرآب", en: "Cars and the garage" },
          html: {
            ar: H.info("<b>المرآب والسيارات يعملان الآن</b> في اللعبة.") +
              "<p>سيارتك تغيّر <b>قيادة الصحراء فقط</b>. لا تغيّر سباق الصقور أبدًا، فلا تربح سيارة مدفوعة سباقًا لك.</p>" +
              carTable("ar") +
              H.w("bars", { title: { ar: "السرعة القصوى في الصحراء (كم/ساعة)", en: "Top speed in the desert (km/h)" }, items: CARS.map(function (c) { return { label: c.n, value: speed(c.id), text: String(speed(c.id)) }; }) }) +
              "<p>السرعة القصوى = " + N(rules.speedKmhAtZero) + " + " + N(rules.speedKmhPerPower) + " × القوة. ولا تتجاوز أي صفة سقف سيارتها مهما ركّبت.</p>" +
              H.shots([["village/village", "قريتك، ومبنى المقناص (المرآب) بين مبانيها"]]) +
              "<h3>قطع التطوير (بالعملات فقط)</h3><p>خمس خانات، لكل قطعة 3 مستويات. الأرقام هي <b>المجموع</b> الذي تعطيه القطعة في ذلك المستوى (لا يُضاف إلى المستوى الأدنى).</p>" +
              partTable("ar") +
              "<ul><li>كل القطع الخمس عشرة معًا تكلف " + N(allParts) + " عملة.</li><li>تُركَّب فورًا، وتبقى بعد الترقية، وتُبدَّل مجانًا. لا بد من المستوى الأدنى قبل الأعلى.</li><li>القطعة غير المركّبة تُباع بـ " + N(rules.sellPercent) + "% من سعرها.</li><li>أسعار ثابتة بلا حظ.</li><li>ألوان الطلاء: أبيض، فضي، بيج، أسود. للشكل فقط.</li></ul>" +
              "<h3>إذا تغرّزت (التغريز)</h3>" +
              H.table(["طريقة الخروج", "التكلفة", "ملاحظة"], [
                ["هزّ السيارة (أمام وخلف)", "مجانًا", "مهارة"],
                ["أنقص هواء الإطارات (الزر في 0.1.2: «نزل هوا التواير»)", "مجانًا", "تماسك أفضل على الرمل وسرعة أقل على الأرض الصلبة"],
                ["احفر بالمجرفة", "مجانًا، نحو 15 ثانية", "موجودة دائمًا في السيارة"],
                ["ألواح الرمل", N(rules.boards.price) + " عملة لحزمة من " + N(rules.boards.uses) + " استخدامات", "تستطيع حمل 100 استخدام"],
                ["حبل السحب", "مجانًا للاثنين", "لاعب آخر في الصحراء نفسها وفي سيارته، ضمن " + N(onl.tow.rangeM) + " م، يسحبك " + N(onl.tow.pullM) + " م. لا بد أن تطلب أولًا. المساعد لا يأخذ عملات ولا سمعة."]]) +
              H.next("حبل السحب يصل مع تحديث 0.1.2.") +
              H.tip("قل نعم عندما يتغرّز صياد قريب منك: الحبل لا يكلف شيئًا."),
            en: H.info("<b>The garage and the cars already work</b> in the game.") +
              "<p>Your car changes <b>desert driving only</b>. It never changes a falcon race, so a paid car never wins a race for you.</p>" +
              carTable("en") +
              H.w("bars", { title: { ar: "السرعة القصوى في الصحراء (كم/ساعة)", en: "Top speed in the desert (km/h)" }, items: CARS.map(function (c) { return { label: c.n, value: speed(c.id), text: String(speed(c.id)) }; }) }) +
              "<p>Top speed = " + N(rules.speedKmhAtZero) + " + " + N(rules.speedKmhPerPower) + " × power. No stat can go above its car's max, whatever you fit.</p>" +
              H.shots([["village/village", "Your village, with the Hunting building (the garage) among the others"]]) +
              "<h3>Upgrade parts (coins only)</h3><p>Five slots, three levels each. The numbers are the <b>total</b> a part gives at that level (not added on top of the lower level).</p>" +
              partTable("en") +
              "<ul><li>All 15 parts together cost " + N(allParts) + " coins.</li><li>Parts are fitted at once, kept after an upgrade, and swapped for free. You need the lower level before the next.</li><li>A part that is not on the car sells back for " + N(rules.sellPercent) + "% of its price.</li><li>Fixed prices, no luck.</li><li>Paint colours: white, silver, beige, black. Looks only.</li></ul>" +
              "<h3>If you get stuck</h3>" +
              H.table(["Way out", "Cost", "Note"], [
                ["Rock the car (forward and back)", "free", "skill"],
                ["Let air out of the tyres (the button reads \"Let air out\" in 0.1.2)", "free", "better sand grip, lower top speed on hard ground"],
                ["Dig with the shovel", "free, about 15 seconds", "always in the car"],
                ["Sand boards", N(rules.boards.price) + " coins for a pack of " + N(rules.boards.uses) + " uses", "You can hold up to 100 uses"],
                ["Tow rope", "free for both players", "Another player in the same desert, in his car, within " + N(onl.tow.rangeM) + " m, pulls you " + N(onl.tow.pullM) + " m. You must ask first. The helper gets no coins and no prestige."]]) +
              H.next("The tow rope arrives with update 0.1.2.") +
              H.tip("Say yes when a hunter near you is stuck: the rope costs nothing.")
          }
        },
        {
          id: "daily", title: { ar: "حبارى اليوم وخرب اليوم", en: "The daily houbara and khurb" },
          html: {
            ar: "<p>في كل يوم خليجي، في <b>الصحارى الست كلها معًا</b>، يوجد بالضبط <b>حبارى بري واحد وخرب بري واحد</b>. يوضع كل منهما في صحراء عشوائية.</p>" +
              H.kpis([["1", "حبارى في اليوم"], ["1", "خرب في اليوم"], [N(onl.daily.barMinutes) + " د", "سطر ذهبي على الشريط الحي"]]) +
              "<ul><li>أول لاعب تتحقق صيدته في الخادم يفوز به. من خسر السباق عليه يُحسب هروبًا.</li><li>إن لم يُصد اليوم، يبقى غدًا واحد فقط من كل نوع. لا يتراكم.</li><li>الحبارى المشترى لا يُحسب أبدًا.</li><li>سطر ذهبي على الشريط الحي لمدة " + N(onl.daily.barMinutes) + " دقيقة يعلن للجميع من صاده.</li><li>الحيوان يوضع عند الساعة 0" + N(onl.daily.placeHour) + ":00 بتوقيت الخليج ويبقى اليوم كله.</li></ul>",
            en: "<p>On each Gulf day, across <b>all " + N(onl.deserts) + " deserts together</b>, there is exactly <b>one wild houbara and one wild khurb</b>. Each is placed in a random desert.</p>" +
              H.kpis([["1", "houbara a day"], ["1", "khurb a day"], [N(onl.daily.barMinutes) + " min", "gold line on the live bar"]]) +
              "<ul><li>The first player whose server-checked kill gets it wins it. A lost claim counts as an escape.</li><li>If it is not caught today, tomorrow there is still only one of each. No stacking.</li><li>A bought houbara never counts.</li><li>A gold line on the live bar for " + N(onl.daily.barMinutes) + " minutes tells everyone who caught it.</li><li>The animal is placed at 0" + N(onl.daily.placeHour) + ":00 Gulf time and stays out the whole day.</li></ul>"
          }
        },
        {
          id: "tournaments", title: { ar: "بطولات المقناص", en: "Hunting tournaments" },
          html: {
            ar: "<p>كل أسبوع بطولة مقناص تلقائية: من <b>" + B.T(DAYS[wk.startDay]) + " 00:00</b> بتوقيت الخليج إلى " + B.T(DAYS[wk.startDay]) + " 00:00 التالي. النقاط = خبرة الشجاعة من <b>صيداتك البرية</b> في الأسبوع. الفريسة المشتراة لا تُحسب. التعادل لمن وصل أولًا.</p>" +
              H.w("bars", { title: { ar: "جوائز العملات (المراكز 1 إلى 5)", en: "Coin prizes (places 1 to 5)" }, items: wk.coins.map(function (c, i) { return { label: { ar: "المركز " + (i + 1), en: "Place " + (i + 1) }, value: c, text: N(c) }; }) }) +
              H.table(["المركز", "عملات", "لآلئ", "سمعة"], wk.coins.map(function (c, i) { return [String(i + 1), N(c), N(wk.pearls[i]), N(wk.prestige[i])]; })) +
              "<ul><li>كؤوس ذهبية وفضية وبرونزية للمراكز 1 إلى 3.</li><li>تُدفع الجوائز فقط إذا سجّل <b>" + N(wk.minPlayers) + " صقارين</b> على الأقل نقاطًا.</li><li>تُدفع بعد النهاية بدقيقة تقريبًا، مرة واحدة.</li></ul>" +
              "<h3>مطاردات خاصة</h3><p>يصنعها الفريق: اسم ونافذة وقت وحيوانات محددة (أو كلها) ومقياس (الشجاعة أو عدد الصيدات) وساعات خليجية ورسم دخول اختياري وجوائز عملات ولآلئ وسمعة. إن كان هناك رسم فلا تُحسب إلا الصيدات بعد دفعه، وتعود الرسوم إذا لم يفز أحد أو أُلغيت المطاردة.</p>" +
              "<h3>لوحات الصيد في قاعة الأبطال</h3><p>بطولة المقناص الأسبوعية، كل مطاردة خاصة، أفضل صقور الصيد، أندر الصيدات، ومنقذو الصقور. وزن الصيدة في لوحة أفضل الصقور: سهلة " + N(ev.boards.weights.easy) + "، متوسطة " + N(ev.boards.weights.medium) + "، صعبة " + N(ev.boards.weights.hard) + "، صعبة جدًا " + N(ev.boards.weights.veryHard) + ".</p>" +
              H.tip("قاعة الأبطال وبطولات الصيد تُشرح بالتفصيل في فصل البطولات والأبطال."),
            en: "<p>Every week there is an automatic hunting tournament: from <b>" + B.T(DAYS[wk.startDay]) + " 00:00</b> Gulf time to the next " + B.T(DAYS[wk.startDay]) + " 00:00. The score is the courage XP of your <b>wild kills</b> in the week. Bought prey never counts. Ties go to whoever got there first.</p>" +
              H.w("bars", { title: { ar: "جوائز العملات (المراكز 1 إلى 5)", en: "Coin prizes (places 1 to 5)" }, items: wk.coins.map(function (c, i) { return { label: { ar: "المركز " + (i + 1), en: "Place " + (i + 1) }, value: c, text: N(c) }; }) }) +
              H.table(["Place", "Coins", "Pearls", "Prestige"], wk.coins.map(function (c, i) { return [String(i + 1), N(c), N(wk.pearls[i]), N(wk.prestige[i])]; })) +
              "<ul><li>Gold, silver and bronze trophies for places 1 to 3.</li><li>Prizes are paid only if at least <b>" + N(wk.minPlayers) + " falconers</b> scored.</li><li>They are paid about a minute after the end, once.</li></ul>" +
              "<h3>Special hunts</h3><p>Made by the team: a name, a time window, chosen animals (or all), a metric (courage or number of catches), set Gulf hours, an optional entry fee, and prizes in coins, Pearls and prestige. If there is a fee, only catches after you pay count, and fees come back if nobody wins or the hunt is cancelled.</p>" +
              "<h3>Hunting boards in the Hall of Champions</h3><p>The weekly hunting tournament, each special hunt, Top hunting falcons, Rarest catches and Falcon rescuers. A kill's weight on the Top falcons board: easy " + N(ev.boards.weights.easy) + ", medium " + N(ev.boards.weights.medium) + ", hard " + N(ev.boards.weights.hard) + ", very hard " + N(ev.boards.weights.veryHard) + ".</p>" +
              H.tip("The Hall of Champions and the hunting tournaments are explained in full in the Tournaments & champions chapter.")
          }
        }
      ];
    }
  });
})(window.Book);
