/* Chapter 8 - Store & VIP. Facts: Docs/Systems/08_shop_vip.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var shop = D("shop"), club = D("shop.club"), sp = D("shop.seasonPass");
  function usd(x) { return "$" + N(x); }
  function off(id) { return D("shop.offers[" + id + "]"); }
  function item(id) { return D("shop.items[" + id + "].pearls"); }
  function sumTrack(track, key) { return track.reduce(function (a, s) { return a + (s[key] || 0); }, 0); }
  function cons(track, id) { return track.reduce(function (a, s) { return a + ((s.consumables && s.consumables[id]) || 0); }, 0); }

  var slots = {
    base: D("mews.baseSlots"), level: D("mews.maxLevelSlots") - D("mews.baseSlots"), paid: shop.paidSlots.length,
    starter: off("starter_pack").slots, vip: club.vipSlots
  };
  slots.total = slots.base + slots.level + slots.paid + slots.starter + slots.vip;
  var paidCost = shop.paidSlots.reduce(function (a, s) { return a + s.pearls; }, 0);
  var paid4 = shop.paidSlots.slice(0, 4).reduce(function (a, s) { return a + s.pearls; }, 0);
  var lastPrice = shop.paidSlots[shop.paidSlots.length - 1].pearls;
  var lastCount = shop.paidSlots.filter(function (s) { return s.pearls === lastPrice; }).length;
  var bigStep = sp.free[sp.free.length - 1], bigPaid = sp.paid[sp.paid.length - 1];
  var weekly = off("weekly_pack"), monthly = off("monthly_pack"), starter = off("starter_pack");
  var perch = shop.aviary.perches;
  var gifts = shop.gifts, inv = shop.invites;

  B.chapter({
    id: "shop", order: 8, icon: "icons/pearl.png",
    title: { ar: "المتجر و VIP", en: "Store & VIP" },
    blurb: { ar: "حزم اللآلئ والعروض، ما تشتريه باللآلئ، عضوية VIP، تصريح الموسم، خانات الصقور، والهدايا.", en: "Pearl packs and offers, what Pearls buy, VIP membership, the Season Pass, falcon slots and gifts." },
    sections: function () {
      return [
        {
          id: "packs", title: { ar: "حزم اللآلئ", en: "Pearl packs" },
          html: {
            ar: "<p>اللآلئ تُشترى بمال حقيقي. كلما كبرت الحزمة زادت اللآلئ لكل دولار. قد يعرض المتجر سعرك المحلي.</p>" +
              H.table(["الحزمة", "اللآلئ", "السعر"], shop.packs.map(function (p) { return [N(p.pearls) + " لؤلؤة", N(p.pearls), usd(p.usd)]; })) +
              H.w("bars", { title: { ar: "لآلئ لكل دولار", en: "Pearls per dollar" }, items: shop.packs.map(function (p) { return { label: { ar: usd(p.usd), en: usd(p.usd) }, value: p.pearls / p.usd, text: N(Math.round(p.pearls / p.usd * 10) / 10) }; }) }) +
              H.info("اللؤلؤة الواحدة تساوي <b>" + N(shop.exchange.coinsPerPearl) + "</b> عملة إذا حوّلتها، وبلا حد يومي. اللآلئ لك وحدك: لا تُباع ولا تُرسل للآخرين إلا ضمن هدايا المتجر.") +
              H.shots([["vip/store_vip", "المتجر: التبويبات في الأعلى"]]),
            en: "<p>Pearls are bought with real money. The bigger the pack, the more Pearls per dollar. The store may show your local price.</p>" +
              H.table(["Pack", "Pearls", "Price"], shop.packs.map(function (p) { return [N(p.pearls) + " Pearls", N(p.pearls), usd(p.usd)]; })) +
              H.w("bars", { title: { ar: "لآلئ لكل دولار", en: "Pearls per dollar" }, items: shop.packs.map(function (p) { return { label: { ar: usd(p.usd), en: usd(p.usd) }, value: p.pearls / p.usd, text: N(Math.round(p.pearls / p.usd * 10) / 10) }; }) }) +
              H.info("One Pearl is worth <b>" + N(shop.exchange.coinsPerPearl) + "</b> coins if you swap it, with no daily limit. Pearls are for you alone: they cannot be sold or sent, except through the shop gifts below.") +
              H.shots([["vip/store_vip", "The Store: the tabs along the top"]])
          }
        },
        {
          id: "offers", title: { ar: "الحزم والعروض", en: "Bundles and offers" },
          html: {
            ar: "<p>حزم جاهزة بسعر واحد:</p>" +
              H.table(["العرض", "السعر", "ماذا تأخذ", "متى"], [
                ["<b>حزمة البداية</b>", usd(starter.usd), N(starter.pearls) + " لؤلؤة، " + N(starter.sandglasses) + " ساعة رملية، و<b>" + N(starter.slots) + " خانات صقور إضافية</b>", "دائمًا"],
                ["<b>حزمة الأعشاش</b>", usd(off("nest_pack").usd), N(off("nest_pack").nests) + " أعشاش إضافية", "دائمًا"],
                ["<b>الحزمة الأسبوعية</b>", usd(weekly.usd), N(weekly.pearls) + " لؤلؤة، " + N(weekly.coins) + " عملة، ساعة رملية، مقوٍّ للصحة", "مرة كل أسبوع"],
                ["<b>الحزمة الشهرية</b>", usd(monthly.usd), N(monthly.pearls) + " لؤلؤة، " + N(monthly.coins) + " عملة، " + N(monthly.sandglasses) + " ساعات رملية، معزّز تزاوج، مقوّيان", "مرة كل شهر"],
                ["<b>حزمة المؤسسين</b>", usd(off("founder_pack").usd), N(off("founder_pack").pearls) + " لؤلؤة، عمود في مجلس الشرف، ألوان الدس الفاخر، وسام المؤسس", "وقت محدود بعد الإطلاق"],
                ["<b>حزمة الإطلاق</b>", usd(off("event_launch").usd), N(off("event_launch").pearls) + " لؤلؤة وألوان النعال الفاخرة", "أول " + N(off("event_launch").window.untilDaysAfterLaunch) + " يومًا بعد الإطلاق"],
                ["8 ساعات رملية", usd(off("glasses_8").usd), N(off("glasses_8").sandglasses) + " ساعات رملية", "دائمًا"],
                ["20 ساعة رملية", usd(off("glasses_20").usd), N(off("glasses_20").sandglasses) + " ساعة رملية", "دائمًا"],
                ["<b>سيارة شاص 79</b>", usd(off("car_lc79").usd), "السيارة (انظر فصل المقناص)", "دائمًا"],
                ["<b>سيارة وافي VTC</b>", usd(off("car_patrol_vtc").usd), "السيارة (انظر فصل المقناص)", "دائمًا"]]) +
              "<h3>حزم المناسبات</h3>" +
              H.table(["المناسبة", "السعر", "ماذا تأخذ", "من – إلى"], [
                ["اليوم الوطني الإماراتي", usd(off("event_uae_national_day_2026").usd), N(off("event_uae_national_day_2026").pearls) + " لؤلؤة + ألوان الكندورة الملكية", off("event_uae_national_day_2026").window.from + " – " + off("event_uae_national_day_2026").window.to],
                ["رمضان", usd(off("event_ramadan_2027").usd), N(off("event_ramadan_2027").pearls) + " لؤلؤة + مجلس المساء", off("event_ramadan_2027").window.from + " – " + off("event_ramadan_2027").window.to],
                ["عيد الفطر", usd(off("event_eid_alfitr_2027").usd), N(off("event_eid_alfitr_2027").pearls) + " لؤلؤة + ألوان الغتر الفاخرة", off("event_eid_alfitr_2027").window.from + " – " + off("event_eid_alfitr_2027").window.to],
                ["اليوم الوطني السعودي", usd(off("event_saudi_national_day_2027").usd), N(off("event_saudi_national_day_2027").pearls) + " لؤلؤة + ألوان البرقع الملكي", off("event_saudi_national_day_2027").window.from + " – " + off("event_saudi_national_day_2027").window.to]]) +
              H.tip("السيارة المجانية \"سهم 26\" مع كل لاعب. السيارتان المدفوعتان تغيّران قيادة الصحراء فقط، ولا تدخلان في سباق الصقور. السيارات لا تُهدى.") +
              H.tip("أرخص طريق لخانات أكثر: املأ خانات المستويات (مجانية) ثم خانات حزمة البداية، ثم الخانات باللآلئ."),
            en: "<p>Ready-made bundles at one price:</p>" +
              H.table(["Offer", "Price", "What you get", "When"], [
                ["<b>Starter pack</b>", usd(starter.usd), N(starter.pearls) + " Pearls, " + N(starter.sandglasses) + " sand-glasses and <b>" + N(starter.slots) + " extra falcon slots</b>", "always"],
                ["<b>Nest pack</b>", usd(off("nest_pack").usd), N(off("nest_pack").nests) + " extra nests", "always"],
                ["<b>Weekly pack</b>", usd(weekly.usd), N(weekly.pearls) + " Pearls, " + N(weekly.coins) + " coins, 1 sand-glass, 1 Tonic", "once a week"],
                ["<b>Monthly pack</b>", usd(monthly.usd), N(monthly.pearls) + " Pearls, " + N(monthly.coins) + " coins, " + N(monthly.sandglasses) + " sand-glasses, 1 Breeding booster, 2 Tonics", "once a month"],
                ["<b>Founder pack</b>", usd(off("founder_pack").usd), N(off("founder_pack").pearls) + " Pearls, 1 Honour Aviary perch, Master Glove colours, the Founder badge", "limited time after launch"],
                ["<b>Launch pack</b>", usd(off("event_launch").usd), N(off("event_launch").pearls) + " Pearls and Fine Sandals colours", "first " + N(off("event_launch").window.untilDaysAfterLaunch) + " days after launch"],
                ["8 sand-glasses", usd(off("glasses_8").usd), N(off("glasses_8").sandglasses) + " sand-glasses", "always"],
                ["20 sand-glasses", usd(off("glasses_20").usd), N(off("glasses_20").sandglasses) + " sand-glasses", "always"],
                ["<b>Shass 79 car</b>", usd(off("car_lc79").usd), "The car (see the Hunting chapter)", "always"],
                ["<b>Wafi VTC car</b>", usd(off("car_patrol_vtc").usd), "The car (see the Hunting chapter)", "always"]]) +
              "<h3>Festival bundles</h3>" +
              H.table(["Event", "Price", "What you get", "From – to"], [
                ["UAE National Day", usd(off("event_uae_national_day_2026").usd), N(off("event_uae_national_day_2026").pearls) + " Pearls + Royal Kandura colours", off("event_uae_national_day_2026").window.from + " – " + off("event_uae_national_day_2026").window.to],
                ["Ramadan", usd(off("event_ramadan_2027").usd), N(off("event_ramadan_2027").pearls) + " Pearls + the Night Majlis theme", off("event_ramadan_2027").window.from + " – " + off("event_ramadan_2027").window.to],
                ["Eid Al-Fitr", usd(off("event_eid_alfitr_2027").usd), N(off("event_eid_alfitr_2027").pearls) + " Pearls + Prestige Ghutra colours", off("event_eid_alfitr_2027").window.from + " – " + off("event_eid_alfitr_2027").window.to],
                ["Saudi National Day", usd(off("event_saudi_national_day_2027").usd), N(off("event_saudi_national_day_2027").pearls) + " Pearls + Royal Hood colours", off("event_saudi_national_day_2027").window.from + " – " + off("event_saudi_national_day_2027").window.to]]) +
              H.tip("The free car \"Sahm 26\" comes with every player. The two paid cars change desert driving only; they never help in a falcon race. Cars cannot be gifted.") +
              H.tip("The cheapest way to more slots: fill the level slots (free), then the Starter pack slots, then the Pearl slots.")
          }
        },
        {
          id: "pearl-items", title: { ar: "ما تشتريه باللآلئ", en: "What Pearls buy" },
          html: {
            ar: H.table(["الغرض", "اللآلئ", "ملاحظة"], [
              ["مستشار التزاوج", N(item("pairing_advisor")), "خطط: " + shop.advisorPlans.map(function (a) { return N(a.days) + " يومًا بـ " + N(a.pearls); }).join("، ")],
              ["العلامة التجارية للمزرعة (حلقة ثلاثية الأبعاد واسم المزرعة)", N(item("farm_brand")), "الحلقة تبقى على الصقر إذا بِيع"],
              ["الشهادة الذهبية", N(item("pedigree_gold")), "تُصرف على صقر واحد"],
              ["بطاقة تغيير اسم الصقر", N(item("card_rename_falcon")), "أول تغيير مجاني (" + N(shop.freeRenames) + ")"],
              ["بطاقة تغيير اسم اللاعب", N(item("card_rename_player")), ""],
              ["بطاقة تغيير اسم المزرعة", N(item("card_rename_farm")), "مرة كل " + N(shop.farmRenameDays) + " يومًا"],
              ["بطاقة النداء (رسالة على الشريط الحي)", N(item("card_shout")), "انظر فصل اللاعب والمجتمع"],
              ["تركيز التدريب", N(shop.trainingFocusPearls), ""],
              ["فحص الصحة في المستشفى", N(D("hospital.checkupPearls")), ""],
              ["فحص الجينات", N(D("hospital.geneTestPearls")), "مرة لكل صقر"],
              ["مقوٍّ للصحة", N(item("med_tonic")), "+" + N(D("hospital.tonicHealth")) + " صحة. حتى " + N(D("hospital.tonicPerDay")) + " في اليوم لكل صقر"],
              ["مساعد الشفاء", N(item("med_recovery_aid")), ""],
              ["معزّز راحة الأنثى", N(item("med_female_rest")), "ينهي راحتها فورًا"],
              ["معزّز التزاوج", N(item("boost_breeding")), "حتى " + N(D("nests.boostedFemalesPerDay")) + " إناث في اليوم بدل " + N(D("nests.maxFemalesPerDay"))],
              ["ساعة رملية", N(shop.pearlsPerSandglass), "الساعة الواحدة = " + N(shop.sandglassMinutes) + " دقيقة"],
              ["ألوان الكندورة الملكية", N(item("colours_kandura_royal")), ""],
              ["ألوان الغتر الفاخرة", N(item("colours_ghutra_prestige")), ""],
              ["ألوان الدس الفاخر", N(item("colours_glove_master")), ""],
              ["معادن الدس (الحلقة والدس)", N(item("colours_metal_precious")), ""],
              ["ألوان النعال الفاخرة", N(item("colours_sandal_fine")), ""],
              ["ألوان البرقع الملكي", N(item("colours_hood_royal")), ""],
              ["ألوان تلواح الأبطال", N(item("colours_lure_champion")), ""],
              ["المجلس الملكي أو مجلس المساء", N(item("theme_majlis_royal")), "لكل واحد"],
              ["أعمدة مجلس الشرف (4 بالترتيب)", perch.map(function (x) { return N(x); }).join(" / "), ""],
              ["حفل التقاعد الفاخر", N(shop.ceremony.deluxePearls), ""]]) +
              H.info("الأوسمة (المؤسس، الداعم، الموسم) والسيارات لا تُباع باللآلئ: تُمنح فقط.") +
              H.shots([["market/store_advisor", "مستشار التزاوج في المتجر"]]),
            en: H.table(["Item", "Pearls", "Note"], [
              ["Pairing Advisor", N(item("pairing_advisor")), "Plans: " + shop.advisorPlans.map(function (a) { return N(a.days) + " days for " + N(a.pearls); }).join(", ")],
              ["Farm Brand (3D leg ring and farm name)", N(item("farm_brand")), "The ring stays on the falcon if it is sold"],
              ["Gold certificate", N(item("pedigree_gold")), "Spent on one falcon"],
              ["Falcon rename card", N(item("card_rename_falcon")), "The first rename is free (" + N(shop.freeRenames) + ")"],
              ["Player rename card", N(item("card_rename_player")), ""],
              ["Farm rename card", N(item("card_rename_farm")), "Once every " + N(shop.farmRenameDays) + " days"],
              ["Shout card (a message on the live bar)", N(item("card_shout")), "See the Player & community chapter"],
              ["Training focus", N(shop.trainingFocusPearls), ""],
              ["Hospital check-up", N(D("hospital.checkupPearls")), ""],
              ["Gene test", N(D("hospital.geneTestPearls")), "Once per falcon"],
              ["Tonic", N(item("med_tonic")), "+" + N(D("hospital.tonicHealth")) + " health. Up to " + N(D("hospital.tonicPerDay")) + " a day per falcon"],
              ["Recovery aid", N(item("med_recovery_aid")), ""],
              ["Female rest booster", N(item("med_female_rest")), "Ends her rest at once"],
              ["Breeding booster", N(item("boost_breeding")), "Up to " + N(D("nests.boostedFemalesPerDay")) + " females a day instead of " + N(D("nests.maxFemalesPerDay"))],
              ["Sand-glass", N(shop.pearlsPerSandglass), "One = " + N(shop.sandglassMinutes) + " minutes"],
              ["Royal Kandura colours", N(item("colours_kandura_royal")), ""],
              ["Prestige Ghutra colours", N(item("colours_ghutra_prestige")), ""],
              ["Master Glove colours", N(item("colours_glove_master")), ""],
              ["Precious Metal colours (ring and glove)", N(item("colours_metal_precious")), ""],
              ["Fine Sandals colours", N(item("colours_sandal_fine")), ""],
              ["Royal Hood colours", N(item("colours_hood_royal")), ""],
              ["Champion Lure colours", N(item("colours_lure_champion")), ""],
              ["Royal Majlis or Night Majlis theme", N(item("theme_majlis_royal")), "Each"],
              ["Honour Aviary perches (4 in order)", perch.map(function (x) { return N(x); }).join(" / "), ""],
              ["Deluxe retirement ceremony", N(shop.ceremony.deluxePearls), ""]]) +
              H.info("Badges (Founder, Supporter, Season) and cars are not sold for Pearls: they are granted only.") +
              H.shots([["market/store_advisor", "The Pairing Advisor in the Store"]])
          }
        },
        {
          id: "pearl-falcons", title: { ar: "صقور اللآلئ", en: "Pearl falcons" },
          html: {
            ar: H.next("<b>تصل مع تحديث 0.1.2.</b>") +
              "<p>ثمانية صقور تشتريها <b>باللآلئ</b> من المتجر. كلها في مرحلة البلوغ، بلا حظ: ترى قدراتها قبل الشراء. الحر والشاهين، ذكر وأنثى.</p>" +
              H.table(["النوع", "اللون", "كل القدرات", "السعر"], [
                ["حر (أنثى) وقرموشة (ذكر)", "رمادي كامل", "30", N(1000) + " لؤلؤة"],
                ["شاهين (أنثى) وتبع (ذكر)", "رمادي كامل", "30", N(1000) + " لؤلؤة"],
                ["حر وقرموشة", "بني كامل", "40", N(2650) + " لؤلؤة"],
                ["شاهين وتبع", "بني كامل", "40", N(2650) + " لؤلؤة"]]) +
              H.shots([["new/pearl_falcons", "صقور اللآلئ في المتجر (متجر تجريبي)"]]) +
              H.tip("هذه الأسعار ليست من ملف الإعدادات، فقد تتغير. انظر السعر في المتجر قبل أن تشتري."),
            en: H.next("<b>Arrives with update 0.1.2.</b>") +
              "<p>Eight falcons you buy with <b>Pearls</b> in the Store. All are Prime and there is no luck: you see their stats before you buy. Saker and Peregrine, male and female.</p>" +
              H.table(["Kind", "Colour", "All stats", "Price"], [
                ["Saker: Hurr (female) and Qarmousha (male)", "Full grey", "30", N(1000) + " Pearls"],
                ["Peregrine: Shaheen (female) and Tabaa (male)", "Full grey", "30", N(1000) + " Pearls"],
                ["Saker: Hurr and Qarmousha", "Full brown", "40", N(2650) + " Pearls"],
                ["Peregrine: Shaheen and Tabaa", "Full brown", "40", N(2650) + " Pearls"]]) +
              H.shots([["new/pearl_falcons", "Pearl falcons in the Store (test store)"]]) +
              H.tip("These prices are not in the config file, so they may change. Check the price in the Store before you buy.")
          }
        },
        {
          id: "sales", title: { ar: "تخفيضات المتجر", en: "Store sales" },
          html: {
            ar: H.next("<b>تصل مع تحديث 0.1.2.</b>") +
              "<p>يعلن الفريق أحيانًا <b>تخفيضًا</b> على أغراض اللآلئ: من 1% إلى 90%. قد يكون مرة واحدة بين وقتين، أو كل أسبوع في أيام معينة (مثل الجمعة والسبت).</p>" +
              H.steps([
                "ترى على الصورة «-20%» مثلًا، والسعر القديم مشطوبًا، والسعر الجديد، وعدّادًا للوقت المتبقي.",
                "الخادم هو الذي يأخذ سعر التخفيض عند الشراء.",
                "إذا كان على الغرض تخفيضان، يُطبَّق الأكبر فقط، ولا يُجمعان.",
                "حزم الأموال الحقيقية والسيارات وVIP تبقى بسعر المتجر الرسمي، ولا يظهر عليها التخفيض إلا إذا سُمّيت فيه."
              ]),
            en: H.next("<b>Arrives with update 0.1.2.</b>") +
              "<p>The team sometimes runs a <b>sale</b> on Pearl items: from 1% to 90% off. It may be one time between two dates, or every week on set days (like Friday and Saturday).</p>" +
              H.steps([
                "You see \"-20%\" on the picture, the old price crossed out, the new price, and a countdown.",
                "The server takes the sale price when you buy.",
                "If an item has two sales, only the bigger one applies. They never add up.",
                "Real-money packs, cars and VIP keep the official store price, and show a sale badge only when a sale names them."
              ])
          }
        },
        {
          id: "sandglass", title: { ar: "الساعة الرملية وتخطّي الانتظار", en: "Sand-glasses and skipping waits" },
          html: {
            ar: "<p>الساعة الرملية الواحدة تغطي <b>" + N(shop.sandglassMinutes) + " دقيقة</b> من أي انتظار. إذا نقصتك ساعات دفعت عنها لآلئ: <b>" + N(shop.pearlsPerSandglass) + "</b> للساعة. وآخر <b>" + N(shop.skips.freeFinishMinutes) + "</b> دقائق تنتهي مجانًا.</p>" +
              H.kpis([[N(shop.sandglassMinutes) + " د", "ساعة رملية واحدة"], [N(shop.pearlsPerSandglass), "لؤلؤة لكل ساعة ناقصة"], [N(shop.skips.freeFinishMinutes) + " د", "تنتهي مجانًا"]]) +
              "<p>تستطيع تخطّي: التدريب، مدة المستشفى، راحة التزاوج، ونمو الصقر الصغير. لا يوجد حد يومي فعلي على التخطي.</p>" +
              H.shots([["inventory/detail_glasses", "تفاصيل الساعة الرملية في المخزن"]]),
            en: "<p>One sand-glass covers <b>" + N(shop.sandglassMinutes) + " minutes</b> of any wait. If you are short of hours, you pay Pearls: <b>" + N(shop.pearlsPerSandglass) + "</b> per hour. The last <b>" + N(shop.skips.freeFinishMinutes) + "</b> minutes finish free.</p>" +
              H.kpis([[N(shop.sandglassMinutes) + " min", "one sand-glass"], [N(shop.pearlsPerSandglass), "Pearls per missing hour"], [N(shop.skips.freeFinishMinutes) + " min", "finish free"]]) +
              "<p>You can skip: training, a hospital stay, a breeding rest, and a young falcon growing up. There is no real daily limit on skipping.</p>" +
              H.shots([["inventory/detail_glasses", "Sand-glass details in the Inventory"]])
          }
        },
        {
          id: "vip", title: { ar: "عضوية VIP", en: "VIP membership" },
          html: {
            ar: "<p>VIP عضوية بالأيام. تشتريها لـ " + N(club.days) + " يومًا أو " + N(club.weekDays) + " أيام، وإذا اشتريتها مرة أخرى أُضيف الوقت إلى نهايتها.</p>" +
              H.kpis([[usd(club.usd), N(club.days) + " يومًا"], [usd(club.weekUsd), N(club.weekDays) + " أيام"], ["+" + N(club.vipRaceCoinPercent) + "%", "عملات السباق"], ["+" + N(club.vipSlots), "خانات صقور"]]) +
              H.table(["الميزة", "التفاصيل"], [
                ["عملات السباقات", "+" + N(club.vipRaceCoinPercent) + "% في السباقات العادية (ليس في السباقات المباشرة ولا البطولات ولا التلواح)"],
                ["التدريب", "+" + N(club.vipTrainingExtra) + " جلسة لكل صقر كل 24 ساعة"],
                ["خانات الصقور", "+" + N(club.vipSlots) + " خانات ما دمت عضوًا"],
                ["هدية يومية", N(club.dailyPearls) + " لؤلؤة كل يوم"],
                ["هدية أسبوعية", N(club.weeklySandglasses) + " ساعة رملية كل أسبوع"],
                ["الشكل", "إطار ذهبي VIP حول صورتك وعلامة VIP في الدردشة والقوائم"],
                ["وسام الداعم", "يُمنح عند الشراء"]]) +
              H.next("<b>مع تحديث 0.1.2:</b> رحلة الصيد تكلف VIP " + N(D("extra.hunting_shop.trip.vipFeeCoins")) + " عملة بدل " + N(D("extra.hunting_shop.trip.feeCoins")) + ". والدردشة الصوتية للأعضاء فقط، ويشغّلها الفريق بعد الإصدار بأيام.") +
              H.warn("بعد انتهاء VIP لديك <b>" + N(club.vipGraceDays) + " أيام</b>. إن بقي عندك صقور أكثر من خاناتك، أُطلق الأضعف منها للبرية. أنقص عدد صقورك قبل نهاية العضوية.") +
              H.shots([["vip/store_vip", "عضوية VIP في المتجر"], ["vip/majlis_vip", "صفحة VIP في المجلس: هداياك"], ["vip/mews_warning", "تحذير عند انتهاء العضوية والصقور أكثر من الخانات"]]) +
              H.tip("VIP هو الطريق الوحيد لـ +" + N(club.vipRaceCoinPercent) + "% عملات السباق، فهو يستحق إذا كنت تسابق كثيرًا."),
            en: "<p>VIP is a membership by days. You buy " + N(club.days) + " days or " + N(club.weekDays) + " days, and buying again adds time to the end date.</p>" +
              H.kpis([[usd(club.usd), N(club.days) + " days"], [usd(club.weekUsd), N(club.weekDays) + " days"], ["+" + N(club.vipRaceCoinPercent) + "%", "race coins"], ["+" + N(club.vipSlots), "falcon slots"]]) +
              H.table(["Benefit", "Details"], [
                ["Race coins", "+" + N(club.vipRaceCoinPercent) + "% on normal races (not live races, tournaments or lure)"],
                ["Training", "+" + N(club.vipTrainingExtra) + " session per falcon every 24 hours"],
                ["Falcon slots", "+" + N(club.vipSlots) + " while you are a member"],
                ["Daily gift", N(club.dailyPearls) + " Pearls every day"],
                ["Weekly gift", N(club.weeklySandglasses) + " sand-glass every week"],
                ["Looks", "A gold VIP ring around your picture and a VIP tag in chat and on boards"],
                ["Supporter badge", "Given when you buy"]]) +
              H.next("<b>With update 0.1.2:</b> a hunting trip costs VIP " + N(D("extra.hunting_shop.trip.vipFeeCoins")) + " coins instead of " + N(D("extra.hunting_shop.trip.feeCoins")) + ". And voice chat is for members only; the team switches it on some days after the release.") +
              H.warn("After VIP ends you have <b>" + N(club.vipGraceDays) + " days</b>. If you still own more falcons than your slots, the weakest extra ones are released to the wild. Bring your falcon count down before the membership ends.") +
              H.shots([["vip/store_vip", "VIP in the Store"], ["vip/majlis_vip", "The VIP page in the Majlis: your gifts"], ["vip/mews_warning", "Warning when VIP ends and falcons exceed slots"]]) +
              H.tip("VIP is the only way to get +" + N(club.vipRaceCoinPercent) + "% race coins, so it pays off if you race a lot.")
          }
        },
        {
          id: "season", title: { ar: "تصريح الموسم", en: "Season Pass" },
          html: {
            ar: "<p>مسار من " + N(sp.steps) + " خطوة. تجمع نقاطًا من السباق والتدريب، وكل " + N(sp.pointsPerStep) + " نقاط تفتح خطوة. المسار المجاني للجميع، والمسار المدفوع يعطي أكثر.</p>" +
              H.kpis([[usd(sp.usd), "المسار المدفوع"], [N(sp.steps), "خطوة"], [N(sp.pointsPerRace), "نقطة لكل سباق"], [N(sp.pointsPerTraining), "نقطة لكل تدريب"], [N(sp.maxPointsPerDay), "أقصى نقاط في اليوم"]]) +
              H.table(["المجموع", "المسار المجاني", "المسار المدفوع"], [
                ["العملات", N(sumTrack(sp.free, "coins")), N(sumTrack(sp.paid, "coins"))],
                ["اللآلئ", N(sumTrack(sp.free, "pearls")), N(sumTrack(sp.paid, "pearls"))],
                ["ساعات رملية", N(sumTrack(sp.free, "sandglasses")), N(sumTrack(sp.paid, "sandglasses"))],
                ["مقوٍّ للصحة", N(cons(sp.free, "med_tonic")), N(cons(sp.paid, "med_tonic"))],
                ["مساعد الشفاء", N(cons(sp.free, "med_recovery_aid")), N(cons(sp.paid, "med_recovery_aid"))],
                ["معزّز راحة الأنثى", N(cons(sp.free, "med_female_rest")), N(cons(sp.paid, "med_female_rest"))],
                ["معزّز التزاوج", N(cons(sp.free, "boost_breeding")), N(cons(sp.paid, "boost_breeding"))],
                ["شهادة ذهبية", N(cons(sp.free, "pedigree_gold")), N(cons(sp.paid, "pedigree_gold"))],
                ["بطاقة تغيير اسم صقر", N(cons(sp.free, "card_rename_falcon")), N(cons(sp.paid, "card_rename_falcon"))],
                ["أخرى", "وسام الموسم (الخطوة " + N(bigStep.step) + ")", "ألوان تلواح الأبطال (الخطوة 15)"]]) +
              "<p>الخطوة الأخيرة هي الأكبر: في المجاني " + N(bigStep.coins) + " عملة و" + N(bigStep.pearls) + " لؤلؤة ووسام، وفي المدفوع " + N(bigPaid.coins) + " عملة و" + N(bigPaid.pearls) + " لؤلؤة.</p>" +
              H.tip("النقاط محدودة بـ " + N(sp.maxPointsPerDay) + " في اليوم: ست سباقات (نقطتان لكل سباق) تملأ اليوم كله. فالتصريح يحتاج " + N(Math.ceil(sp.steps * sp.pointsPerStep / sp.maxPointsPerDay)) + " يومًا على الأقل."),
            en: "<p>A track of " + N(sp.steps) + " steps. You earn points from racing and training, and every " + N(sp.pointsPerStep) + " points open a step. The free track is for everyone, and the paid track gives more.</p>" +
              H.kpis([[usd(sp.usd), "the paid track"], [N(sp.steps), "steps"], [N(sp.pointsPerRace), "points per race"], [N(sp.pointsPerTraining), "point per training"], [N(sp.maxPointsPerDay), "most points a day"]]) +
              H.table(["Totals", "Free track", "Paid track"], [
                ["Coins", N(sumTrack(sp.free, "coins")), N(sumTrack(sp.paid, "coins"))],
                ["Pearls", N(sumTrack(sp.free, "pearls")), N(sumTrack(sp.paid, "pearls"))],
                ["Sand-glasses", N(sumTrack(sp.free, "sandglasses")), N(sumTrack(sp.paid, "sandglasses"))],
                ["Tonics", N(cons(sp.free, "med_tonic")), N(cons(sp.paid, "med_tonic"))],
                ["Recovery aids", N(cons(sp.free, "med_recovery_aid")), N(cons(sp.paid, "med_recovery_aid"))],
                ["Female rest boosters", N(cons(sp.free, "med_female_rest")), N(cons(sp.paid, "med_female_rest"))],
                ["Breeding boosters", N(cons(sp.free, "boost_breeding")), N(cons(sp.paid, "boost_breeding"))],
                ["Gold certificates", N(cons(sp.free, "pedigree_gold")), N(cons(sp.paid, "pedigree_gold"))],
                ["Falcon rename cards", N(cons(sp.free, "card_rename_falcon")), N(cons(sp.paid, "card_rename_falcon"))],
                ["Other", "Season badge (step " + N(bigStep.step) + ")", "Champion Lure colours (step 15)"]]) +
              "<p>The last step is the biggest: " + N(bigStep.coins) + " coins, " + N(bigStep.pearls) + " Pearls and a badge on the free track, and " + N(bigPaid.coins) + " coins and " + N(bigPaid.pearls) + " Pearls on the paid track.</p>" +
              H.tip("Points are capped at " + N(sp.maxPointsPerDay) + " a day: six races (2 points each) fill the whole day. So the pass needs at least " + N(Math.ceil(sp.steps * sp.pointsPerStep / sp.maxPointsPerDay)) + " days.")
          }
        },
        {
          id: "slots", title: { ar: "خانات الصقور: من أين تأتي؟", en: "Falcon slots: where they come from" },
          html: {
            ar: "<p>عدد الصقور التي تملكها في المقر محدود بالخانات. أقصى عدد <b>" + N(slots.total) + "</b> خانة، من خمسة مصادر:</p>" +
              H.w("bars", { title: { ar: "مصادر الخانات", en: "Slot sources" }, items: [
                { label: { ar: "الأساس (للجميع)", en: "Base (everyone)" }, value: slots.base, text: "+" + slots.base },
                { label: { ar: "المستويات (2 لكل مستوى حتى المستوى 7)", en: "Levels (2 per level up to level 7)" }, value: slots.level, text: "+" + slots.level },
                { label: { ar: "خانات اللآلئ (بلا شرط مستوى)", en: "Pearl slots (no level needed)" }, value: slots.paid, text: "+" + slots.paid },
                { label: { ar: "حزمة البداية", en: "Starter pack" }, value: slots.starter, text: "+" + slots.starter },
                { label: { ar: "VIP (وبعد انتهائه 3 أيام)", en: "VIP (and 3 days after it ends)" }, value: slots.vip, text: "+" + slots.vip },
                { label: { ar: "الأقصى", en: "Maximum" }, value: slots.total, text: String(slots.total) }
              ] }) +
              "<p>أسعار خانات اللآلئ بالترتيب: " + shop.paidSlots.slice(0, 12).map(function (s) { return N(s.pearls); }).join("، ") + "، ثم " + N(lastPrice) + " لكل خانة من الخانات الأخيرة (" + N(lastCount) + " خانات). كلها معًا <b>" + N(paidCost) + "</b> لؤلؤة. أول 4 خانات تكلف " + N(paid4) + " لؤلؤة.</p>" +
              H.info("الصقر المعروض في السوق أو في مزاد يأخذ خانة. وخانات حزمة البداية لها عدّاد خاص ولا تُسترد.") +
              H.shots([["slots/tall_store_slot", "شراء خانة صقر باللآلئ"]]),
            en: "<p>How many falcons you can keep in your mews is limited by slots. The maximum is <b>" + N(slots.total) + "</b> slots, from five sources:</p>" +
              H.w("bars", { title: { ar: "مصادر الخانات", en: "Slot sources" }, items: [
                { label: { ar: "الأساس (للجميع)", en: "Base (everyone)" }, value: slots.base, text: "+" + slots.base },
                { label: { ar: "المستويات (2 لكل مستوى حتى المستوى 7)", en: "Levels (2 per level up to level 7)" }, value: slots.level, text: "+" + slots.level },
                { label: { ar: "خانات اللآلئ (بلا شرط مستوى)", en: "Pearl slots (no level needed)" }, value: slots.paid, text: "+" + slots.paid },
                { label: { ar: "حزمة البداية", en: "Starter pack" }, value: slots.starter, text: "+" + slots.starter },
                { label: { ar: "VIP (وبعد انتهائه 3 أيام)", en: "VIP (and 3 days after it ends)" }, value: slots.vip, text: "+" + slots.vip },
                { label: { ar: "الأقصى", en: "Maximum" }, value: slots.total, text: String(slots.total) }
              ] }) +
              "<p>Pearl slot prices in order: " + shop.paidSlots.slice(0, 12).map(function (s) { return N(s.pearls); }).join(", ") + ", then " + N(lastPrice) + " for each of the last " + N(lastCount) + " slots. All together they cost <b>" + N(paidCost) + "</b> Pearls. The first 4 slots cost " + N(paid4) + " Pearls.</p>" +
              H.info("A falcon on the market or in an auction still uses a slot. The Starter pack slots have their own counter and are never refunded.") +
              H.shots([["slots/tall_store_slot", "Buying a falcon slot with Pearls"]])
          }
        },
        {
          id: "gifts", title: { ar: "الهدايا", en: "Gifts" },
          html: {
            ar: "<h3>هدايا مجانية</h3>" +
              H.table(["الهدية", "القاعدة"], [
                ["بريد الترحيب", N(D("online.social.mail.welcomeCoins")) + " عملة"],
                ["تأكيد البريد الإلكتروني", N(D("online.emailRewardCoins")) + " عملة + 100 لؤلؤة، مرة لكل جهاز"],
                ["هدية العودة", "10,000 عملة إذا عدت بعد 7 أيام أو أكثر. تصلك في البريد، ومرة كل 30 يومًا"],
                ["هدايا الفريق في البريد", "تُدفع مرة لكل جهاز"]]) +
              "<h3>هدايا المتجر بين الأصدقاء</h3>" +
              H.table(["القاعدة", "القيمة"], [
                ["هدايا تُرسلها في اليوم", N(gifts.perSenderPerDay)],
                ["بين نفس اللاعبين في الأسبوع", N(gifts.perPairPerWeek)],
                ["طول الرسالة", N(gifts.messageMaxChars) + " حرفًا"],
                ["تنتهي الهدية إن لم تُستلم بعد", N(gifts.expireDays) + " أيام"],
                ["لا تُهدى", "مستشار التزاوج، العلامة التجارية، الشهادة الذهبية، بطاقات الأسماء والنداء، الأدوية، السيارات"]]) +
              "<h3>دعوة الأصدقاء</h3><p>تأخذ <b>" + N(inv.rewardPearls) + "</b> لؤلؤة عن كل صديق دعوته ووصل المستوى " + N(inv.level) + ". حتى " + N(inv.maxRewardsPerInviter) + " أصدقاء.</p>" +
              H.tip("القواعد نفسها لكل اللاعبين. الهدايا المجانية تُدفع مرة لكل جهاز، فلا فائدة من حسابات إضافية."),
            en: "<h3>Free gifts</h3>" +
              H.table(["Gift", "Rule"], [
                ["Welcome mail", N(D("online.social.mail.welcomeCoins")) + " coins"],
                ["E-mail confirmation", N(D("online.emailRewardCoins")) + " coins + 100 Pearls, once per device"],
                ["Returning gift", "10,000 coins when you come back after 7 days or more. It arrives in your mail, once every 30 days"],
                ["Team gifts in the mail", "Paid once per device"]]) +
              "<h3>Shop gifts between friends</h3>" +
              H.table(["Rule", "Value"], [
                ["Gifts you can send a day", N(gifts.perSenderPerDay)],
                ["Between the same two players a week", N(gifts.perPairPerWeek)],
                ["Message length", N(gifts.messageMaxChars) + " letters"],
                ["An unclaimed gift expires after", N(gifts.expireDays) + " days"],
                ["Cannot be gifted", "Pairing Advisor, Farm Brand, Gold certificate, rename and Shout cards, medicines, cars"]]) +
              "<h3>Inviting friends</h3><p>You get <b>" + N(inv.rewardPearls) + "</b> Pearls for each friend you invited who reaches level " + N(inv.level) + ". Up to " + N(inv.maxRewardsPerInviter) + " friends.</p>" +
              H.tip("The rules are the same for every player. Free gifts are paid once per device, so extra accounts gain nothing.")
          }
        }
      ];
    }
  });
})(window.Book);
