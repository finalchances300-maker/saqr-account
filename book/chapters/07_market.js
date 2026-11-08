/* Chapter 7 - Market & economy. Facts: Docs/Systems/07_economy_market.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var V = D("economy.valuation"), mk = D("market"), on = D("online"), tr = D("online.trade"), trader = D("trader");
  var TN = B.TIER_NAMES, tiers = ["common", "good", "rare", "elite", "legendary"];
  var step = mk.npcStepSales, pct = mk.npcStepPercents;

  /* falcon value = tier base x (1 + bonus x position in tier) x colour x sex (x age, x sick) - same order as the game */
  function value(tier, pos, col, sex, age, sick) {
    return Math.round(V.tierBase[tier] * (1 + V.withinTierBonus * pos) * V.colorMultiplier[col] * V.sexMultiplier[sex] * (age ? V.ageMultiplier[age] : 1) * (sick ? V.sickMultiplier : 1));
  }
  function npcPays(v, tier) { return Math.min(Math.round(v * mk.sellRatioByTier[tier]), mk.npcMaxPayout); }
  function buyPrice(v) { return Math.round(v * mk.buyMarkup); }
  var fee = on.marketFeePercent;
  var sellTitle = { ar: "ماذا يدفع السوق لك؟ نسبة من القيمة حسب الفئة", en: "What does the market pay you? A share of the value, by tier" };
  /* the season pass free step that gives the gold certificate */
  var certStep = D("shop.seasonPass.free").filter(function (s) { return s.consumables && s.consumables.pedigree_gold; })[0];
  var tierBands = D("rarity.tiers").map(function (t, i, arr) { return { id: t.id, min: t.minScore, max: i + 1 < arr.length ? arr[i + 1].minScore : 100 }; });

  B.chapter({
    id: "market", order: 7, icon: "icons/coin.png",
    title: { ar: "السوق والاقتصاد", en: "Market & economy" },
    blurb: { ar: "العملات واللآلئ، كيف تُحسب قيمة الصقر، سوق اللعبة، سوق اللاعبين، المزادات، والشراء بالكمية.", en: "Coins and Pearls, how a falcon's value is worked out, the game market, the players' market, auctions and quantity buying." },
    sections: function () {
      return [
        {
          id: "money", title: { ar: "العملات واللآلئ", en: "Coins and Pearls" },
          html: {
            ar: "<p>في اللعبة نوعان من المال، وساعة رملية للانتظار:</p>" +
              H.table(["النوع", "ما هو", "من أين يأتي"], [
                ["<b>العملات</b>", "مال اللعبة الأساسي. تصرفه على الطعام والتدريب والمباني والسوق.", "من اللعب فقط. لا تُباع بمال حقيقي أبدًا."],
                ["<b>اللآلئ</b>", "المال المميّز. تصرفه في المتجر.", "تُشترى بمال حقيقي، أو تكسب منها قليلًا بالمستويات والمهام والبطولات."],
                ["<b>الساعة الرملية</b>", "تتخطى " + N(D("shop.sandglassMinutes")) + " دقيقة من أي عدّاد انتظار.", "من المتجر والهدايا ومسار الموسم."]]) +
              H.kpis([[N(D("economy.startingCoins")), "عملة تبدأ بها"], [N(D("shop.exchange.coinsPerPearl")), "عملة مقابل كل لؤلؤة"], [N(D("shop.playRewards.levelUpPearls")), "لؤلؤة عند كل مستوى جديد"], [N(D("online.social.mail.welcomeCoins")), "عملة في بريد الترحيب"]]) +
              H.info("<b>اللؤلؤة تصير عملات، والعملات لا تصير لؤلؤًا.</b> التحويل باتجاه واحد: اللؤلؤة الواحدة = " + N(D("shop.exchange.coinsPerPearl")) + " عملة، بلا حد يومي. لا يوجد بيع أو شراء للعملات بين اللاعبين بمال حقيقي.") +
              "<h3>من أين تأتي العملات؟</h3>" +
              H.table(["المصدر", "المقدار"], [
                ["سباق ضد اللعبة (المراكز 1 إلى 5)", D("race.rewards").map(function (r) { return N(r.coins); }).join(" / ")],
                ["مهمة يومية (من 6)", N(D("tasks.dailyReward.coins")) + " عملة + " + N(D("tasks.dailyReward.prestige")) + " سمعة"],
                ["إنهاء مهام اليوم كلها", "+" + N(D("tasks.allDoneBonus.coins")) + " عملة"],
                ["مهمة الأسبوع", N(D("tasks.weeklyReward.coins")) + " عملة + " + N(D("tasks.weeklyReward.prestige")) + " سمعة"],
                ["سلسلة " + N(D("tasks.streak.rewardEveryDays")) + " أيام متتالية", N(D("tasks.streak.coins")) + " عملة + " + N(D("tasks.streak.pearls")) + " لآلئ"],
                ["بطولة نهاية الأسبوع (المراكز 1 إلى 3)", D("online.tournamentCoins").map(function (c) { return N(c); }).join(" / ")],
                ["تأكيد بريدك الإلكتروني (مرة واحدة لكل جهاز)", N(D("online.emailRewardCoins")) + " عملة + 100 لؤلؤة"],
                ["هدية العودة (غبت 7 أيام أو أكثر)", "10,000 عملة"],
                ["بيع فرخ مولود", N(D("nests.chickSellCoins")) + " عملة ثابتة"],
                ["ضيف مساء الجمعة (تاجر القماش)", N(D("evening.guests[5].amount")) + " عملة"],
                ["بيع صقر للسوق أو للتاجر أو للاعب", "انظر الأقسام التالية"]]) +
              H.next("<b>تصل مع تحديث 0.1.2:</b> صيد المقناص يعطي من 100 إلى 8,000 عملة لكل صيدة (انظر فصل المقناص).") +
              H.shots([["inventory/all", "المخزن: لآلئك وعملاتك وساعاتك الرملية في مكان واحد"]]),
            en: "<p>The game has two kinds of money, plus a sand-glass for waiting:</p>" +
              H.table(["Type", "What it is", "Where it comes from"], [
                ["<b>Coins</b>", "The main game money. You spend them on food, training, buildings and the market.", "From playing only. Never sold for real money."],
                ["<b>Pearls</b>", "The premium money. You spend them in the Store.", "Bought with real money, or earned in small amounts from levels, tasks and tournaments."],
                ["<b>Sand-glass</b>", "Skips " + N(D("shop.sandglassMinutes")) + " minutes of any waiting timer.", "From the Store, gifts and the Season Pass."]]) +
              H.kpis([[N(D("economy.startingCoins")), "coins you start with"], [N(D("shop.exchange.coinsPerPearl")), "coins for each Pearl"], [N(D("shop.playRewards.levelUpPearls")), "Pearls for each new level"], [N(D("online.social.mail.welcomeCoins")), "coins in the welcome mail"]]) +
              H.info("<b>Pearls turn into coins, but coins never turn into Pearls.</b> The swap goes one way: 1 Pearl = " + N(D("shop.exchange.coinsPerPearl")) + " coins, with no daily limit. Players can never buy or sell coins for real money.") +
              "<h3>Where do coins come from?</h3>" +
              H.table(["Source", "Amount"], [
                ["A race against the game (places 1 to 5)", D("race.rewards").map(function (r) { return N(r.coins); }).join(" / ")],
                ["A daily task (of 6)", N(D("tasks.dailyReward.coins")) + " coins + " + N(D("tasks.dailyReward.prestige")) + " prestige"],
                ["Finishing all daily tasks", "+" + N(D("tasks.allDoneBonus.coins")) + " coins"],
                ["The weekly task", N(D("tasks.weeklyReward.coins")) + " coins + " + N(D("tasks.weeklyReward.prestige")) + " prestige"],
                ["A " + N(D("tasks.streak.rewardEveryDays")) + "-day streak", N(D("tasks.streak.coins")) + " coins + " + N(D("tasks.streak.pearls")) + " Pearls"],
                ["The weekend tournament (places 1 to 3)", D("online.tournamentCoins").map(function (c) { return N(c); }).join(" / ")],
                ["Confirming your e-mail (once per device)", N(D("online.emailRewardCoins")) + " coins + 100 Pearls"],
                ["Returning gift (away 7 days or more)", "10,000 coins"],
                ["Selling a newborn chick", N(D("nests.chickSellCoins")) + " coins, flat"],
                ["Friday evening guest (the cloth merchant)", N(D("evening.guests[5].amount")) + " coins"],
                ["Selling a falcon to the market, the trader or a player", "see the next sections"]]) +
              H.next("<b>Arrives with update 0.1.2:</b> hunting pays 100 to 8,000 coins per catch (see the Hunting chapter).") +
              H.shots([["inventory/all", "The Inventory: your Pearls, coins and sand-glasses in one place"]])
          }
        },
        {
          id: "value", title: { ar: "قيمة الصقر", en: "A falcon's value" },
          html: {
            ar: "<p>لكل صقر <b>قيمة</b>. هي أساس سعر السوق وحدود سوق اللاعبين. تُحسب بهذا الترتيب:</p>" +
              H.steps([
                "<b>الفئة</b> من النتيجة (صفات الصقر بأوزانها + مكافأة اللون). الفئات حسب النتيجة موضحة في الرسم أدناه.",
                "<b>قيمة الفئة الأساسية:</b> " + tiers.map(function (t) { return B.T(TN[t]) + " " + N(V.tierBase[t]); }).join("، ") + ".",
                "<b>مكافأة داخل الفئة:</b> كلما كان صقرك أعلى داخل فئته زادت القيمة حتى +" + P(V.withinTierBonus) + " في آخر الفئة.",
                "<b>مضاعف اللون:</b> فضي ×" + V.colorMultiplier.silver + "، أسود وأبيض ×" + V.colorMultiplier.black + ". اللون الصلب (كل المناطق بلون واحد): بني ×" + V.solidColorMultiplier.brown + "، أسود وأبيض ×" + V.solidColorMultiplier.black + ".",
                "<b>مضاعف العمر:</b> صغير ×" + V.ageMultiplier.young + "، بالغ ×" + V.ageMultiplier.prime + "، متقاعد ×" + V.ageMultiplier.retired + ".",
                "<b>الجنس:</b> أنثى ×" + V.sexMultiplier.female + "، ذكر ×" + V.sexMultiplier.male + ".",
                "<b>التدريب:</b> +" + P(V.trainingBonusValue) + " لكل نقطة مكافأة تدريب.",
                "<b>المرض:</b> الصقر المريض أو في المستشفى ×" + V.sickMultiplier + ".",
                "<b>السقف:</b> لا تتجاوز القيمة " + N(V.maxValue) + " (قبل مضاعفي العمر والمرض)، وأقل قيمة " + N(V.minValue) + ".",
                "<b>القسم في السباق:</b> يضرب القيمة: برونزي ×" + V.divisionMultiplier.bronze + "، فضي ×" + V.divisionMultiplier.silver + "، ذهبي ×" + V.divisionMultiplier.gold + "، نخبة ×" + V.divisionMultiplier.elite + "، أسطورة ×" + V.divisionMultiplier.legend + "."
              ]) +
              H.w("ranges", { title: { ar: "الفئات حسب نتيجة الصقر", en: "Tiers by falcon score" }, scaleMax: 100, items: tierBands.map(function (t) { return { label: TN[t.id], min: t.min, max: t.max }; }) }) +
              "<h3>أمثلة محسوبة</h3>" +
              H.table(["الصقر", "القيمة"], [
                ["ذكر بالغ، فئة جيد في أولها، رمادي، بلا تدريب، سليم", N(value("good", 0, "grey", "male"))],
                ["نفس الصقر لكنه أنثى", N(value("good", 0, "grey", "female"))],
                ["نفس الذكر لكنه متقاعد", N(value("good", 0, "grey", "male", "retired"))],
                ["أنثى بالغة، فئة نادر في منتصفها، فضية", N(value("rare", 0.5, "silver", "female"))],
                ["ذكر بالغ، فئة نخبة في منتصفها، أسود", N(value("elite", 0.5, "black", "male"))]]) +
              H.tip("قبل أن تعرض صقرك للبيع، افتح بطاقته وانظر إلى قيمته. السعر خارج حدود النطاق يُرفض."),
            en: "<p>Every falcon has a <b>value</b>. It is the base of the market price and of the players' price limits. It is worked out in this order:</p>" +
              H.steps([
                "<b>The tier</b> from the score (the falcon's stats with their weights, plus a colour bonus). The tier bands are in the chart below.",
                "<b>Tier base value:</b> " + tiers.map(function (t) { return B.T(TN[t]) + " " + N(V.tierBase[t]); }).join(", ") + ".",
                "<b>Inside-the-tier bonus:</b> the higher your falcon sits in its tier, the more it is worth, up to +" + P(V.withinTierBonus) + " at the top of the tier.",
                "<b>Colour multiplier:</b> silver ×" + V.colorMultiplier.silver + ", black and white ×" + V.colorMultiplier.black + ". A solid colour (every region the same): brown ×" + V.solidColorMultiplier.brown + ", black and white ×" + V.solidColorMultiplier.black + ".",
                "<b>Age multiplier:</b> young ×" + V.ageMultiplier.young + ", prime ×" + V.ageMultiplier.prime + ", retired ×" + V.ageMultiplier.retired + ".",
                "<b>Sex:</b> female ×" + V.sexMultiplier.female + ", male ×" + V.sexMultiplier.male + ".",
                "<b>Training:</b> +" + P(V.trainingBonusValue) + " for each training bonus point.",
                "<b>Illness:</b> a sick falcon, or one in hospital, ×" + V.sickMultiplier + ".",
                "<b>Cap:</b> the value never goes above " + N(V.maxValue) + " (before the age and illness multipliers), and never below " + N(V.minValue) + ".",
                "<b>Race division:</b> multiplies the value: Bronze ×" + V.divisionMultiplier.bronze + ", Silver ×" + V.divisionMultiplier.silver + ", Gold ×" + V.divisionMultiplier.gold + ", Elite ×" + V.divisionMultiplier.elite + ", Legend ×" + V.divisionMultiplier.legend + "."
              ]) +
              H.w("ranges", { title: { ar: "الفئات حسب نتيجة الصقر", en: "Tiers by falcon score" }, scaleMax: 100, items: tierBands.map(function (t) { return { label: TN[t.id], min: t.min, max: t.max }; }) }) +
              "<h3>Worked examples</h3>" +
              H.table(["The falcon", "Value"], [
                ["Prime male, Good tier at its start, grey, untrained, healthy", N(value("good", 0, "grey", "male"))],
                ["The same falcon as a female", N(value("good", 0, "grey", "female"))],
                ["The same male, but retired", N(value("good", 0, "grey", "male", "retired"))],
                ["Prime female, Rare tier halfway, silver", N(value("rare", 0.5, "silver", "female"))],
                ["Prime male, Elite tier halfway, black", N(value("elite", 0.5, "black", "male"))]]) +
              H.tip("Before you put a falcon on sale, open its card and read its value. A price outside the allowed band is refused.")
          }
        },
        {
          id: "npc", title: { ar: "سوق الصقور (سوق اللعبة)", en: "The Falcon Market (the game's market)" },
          html: {
            ar: "<p>كل يوم يعرض السوق <b>" + N(mk.stockSize) + " صقور</b> جديدة. تتجدد عند 04:00 بتوقيت الخليج، وصفاتها من " + N(mk.statRange.min) + " إلى " + N(mk.statRange.max) + ". تشتري منه، وتبيع له.</p>" +
              H.kpis([["+" + P(mk.buyMarkup - 1), "فوق القيمة عند الشراء"], [N(mk.npcMaxPayout), "أعلى مبلغ يدفعه السوق لصقر"], [N(mk.stockSize), "صقور جديدة كل يوم"], [P(mk.qualityRoll.chance, 1), "فرصة أن يكون صقر أفضل من المعتاد"]]) +
              H.w("bars", { title: sellTitle, items: tiers.map(function (t) { return { label: TN[t], value: mk.sellRatioByTier[t] * 100, text: P(mk.sellRatioByTier[t]) }; }) }) +
              "<p>وتنخفض الأسعار كلما بعت أكثر في نفس اليوم (يوم الخليج). الخطوات تُطبَّق بعد سقف " + N(mk.npcMaxPayout) + ":</p>" +
              H.table(["عدد البيعات في اليوم", "ما يدفعه السوق"], pct.map(function (p, i) { return [i + 1 < pct.length ? N(i * step + 1) + " إلى " + N((i + 1) * step) : N(i * step + 1) + " فأكثر", N(p) + "%"]; })) +
              "<h3>أمثلة (ذكر بالغ بقيمة الفئة الأساسية)</h3>" +
              H.table(["الفئة", "القيمة", "تشتريه بـ", "السوق يدفع لك"], tiers.map(function (t) { return [B.T(TN[t]), N(V.tierBase[t]), N(buyPrice(V.tierBase[t])), N(npcPays(V.tierBase[t], t))]; })) +
              H.shots([["market/market_buy", "تبويب الشراء: صقور اليوم"], ["market/market_sell", "تبويب البيع"]]) +
              "<h3>لا تستطيع بيع…</h3><ul><li>آخر صقر عندك.</li><li>صقرًا في المستشفى أو في التدريب أو في سباق.</li><li>أنثى عندها بيضة.</li></ul>" +
              H.tip("الصقور الغالية بِعها للاعبين أو للتاجر. سقف السوق " + N(mk.npcMaxPayout) + " فقط، فالنخبة والأسطوري يأخذان المبلغ نفسه. وبِع واحدًا أو اثنين في اليوم، فأول " + N(step) + " بيعات بالسعر الكامل."),
            en: "<p>Every day the market shows <b>" + N(mk.stockSize) + " new falcons</b>. They refresh at 04:00 Gulf time, with stats from " + N(mk.statRange.min) + " to " + N(mk.statRange.max) + ". You buy from it, and sell to it.</p>" +
              H.kpis([["+" + P(mk.buyMarkup - 1), "over the value when you buy"], [N(mk.npcMaxPayout), "most the market pays for one falcon"], [N(mk.stockSize), "new falcons every day"], [P(mk.qualityRoll.chance, 1), "chance of a better-than-usual falcon"]]) +
              H.w("bars", { title: sellTitle, items: tiers.map(function (t) { return { label: TN[t], value: mk.sellRatioByTier[t] * 100, text: P(mk.sellRatioByTier[t]) }; }) }) +
              "<p>Prices fall as you sell more on the same Gulf day. The steps apply after the " + N(mk.npcMaxPayout) + " cap:</p>" +
              H.table(["Sales in one day", "The market pays"], pct.map(function (p, i) { return [i + 1 < pct.length ? "#" + N(i * step + 1) + " to #" + N((i + 1) * step) : "#" + N(i * step + 1) + " and more", N(p) + "%"]; })) +
              "<h3>Examples (prime male at the tier's base value)</h3>" +
              H.table(["Tier", "Value", "You buy at", "The market pays you"], tiers.map(function (t) { return [B.T(TN[t]), N(V.tierBase[t]), N(buyPrice(V.tierBase[t])), N(npcPays(V.tierBase[t], t))]; })) +
              H.shots([["market/market_buy", "The Buy tab: today's falcons"], ["market/market_sell", "The Sell tab"]]) +
              "<h3>You cannot sell…</h3><ul><li>Your last falcon.</li><li>A falcon in hospital, in training or in a race.</li><li>A female with an egg.</li></ul>" +
              H.tip("Sell your expensive falcons to players or to the trader. The market's cap is " + N(mk.npcMaxPayout) + ", so an Elite and a Legendary falcon get the same. Sell one or two a day: the first " + N(step) + " sales are at full price.")
          }
        },
        {
          id: "trader", title: { ar: "التاجر الزائر", en: "The visiting trader" },
          html: {
            ar: "<p>كل يوم يأتي تاجر بطلب. يدفع <b>أكثر من السوق</b>، لكن لصقور <b>أنت ربيتها</b> فقط. لكل دولة خليجية تاجر، وهم ستة.</p>" +
              H.kpis([["×" + trader.priceFactor, "من القيمة"], [N(trader.maxCoins), "أعلى مبلغ"], ["1", "بيعة في اليوم"], [N(trader.skipsPerDay), "تخطٍّ للطلب يوميًا"]]) +
              H.table(["ماذا يطلب التاجر؟", "الفرصة"], [["سلالة محددة (صافية)", "دائمًا"], ["جنس محدد", P(trader.sexChance)], ["صفة بحد أدنى", P(trader.statChance)], ["صقر بالغ", P(trader.stageChance)]]) +
              "<p>الحد الأدنى للصفة يقع بين " + P(trader.statSpread[0]) + " و" + P(trader.statSpread[1]) + " من مدى صفات السوق (" + N(mk.statRange.min) + " إلى " + N(mk.statRange.max) + "). التاجر لا يدفع أبدًا أقل من سوق الصقور، ولا يتأثر بتدرّج الأسعار اليومي.</p>" +
              H.shots([["market/market_sell_more", "التاجر وطلبه تحت تبويب البيع"]]),
            en: "<p>Every day a trader comes with a request. He pays <b>more than the market</b>, but only for falcons <b>you bred yourself</b>. There is one trader for each Gulf country: six in all.</p>" +
              H.kpis([["×" + trader.priceFactor, "of the value"], [N(trader.maxCoins), "most he pays"], ["1", "sale a day"], [N(trader.skipsPerDay), "request skip a day"]]) +
              H.table(["What the trader asks for", "Chance"], [["One species (pure)", "always"], ["One sex", P(trader.sexChance)], ["A minimum stat", P(trader.statChance)], ["A grown (prime) falcon", P(trader.stageChance)]]) +
              "<p>The stat minimum sits between " + P(trader.statSpread[0]) + " and " + P(trader.statSpread[1]) + " of the market stat range (" + N(mk.statRange.min) + " to " + N(mk.statRange.max) + "). The trader never pays less than the Falcon Market, and the daily price steps do not touch him.</p>" +
              H.shots([["market/market_sell_more", "The trader and his request, under the Sell tab"]])
          }
        },
        {
          id: "players", title: { ar: "سوق اللاعبين", en: "The players' market" },
          html: {
            ar: "<p>تبيع صقرك للاعب آخر بالسعر الذي تحدده. <b>القواعد نفسها لكل اللاعبين</b>: عمر الحساب أو مالك لا يغيّران شيئًا. لا يلزم بريد إلكتروني مؤكَّد.</p>" +
              H.kpis([[N(fee) + "%", "رسوم السوق على البائع"], [N(tr.minPricePercent) + "–" + N(tr.maxPricePercent) + "%", "نطاق السعر من القيمة"], [N(tr.buysPer24h), "مشتريات كل 24 ساعة"], [N(tr.boughtLockHours) + " س", "قفل إعادة البيع"]]) +
              H.table(["القاعدة", "القيمة"], [
                ["من يستطيع التداول", "المستوى " + N(tr.minLevel) + " فأكثر"],
                ["سعر العرض أو بداية المزاد", "بين " + N(tr.minPricePercent) + "% و" + N(tr.maxPricePercent) + "% من قيمة الصقر"],
                ["أقل وأعلى سعر مطلق", N(on.listingMinPrice) + " إلى " + N(on.listingMaxPrice) + " عملة"],
                ["الرسوم", N(fee) + "% من سعر البيع يدفعها البائع. ثابتة عند وضع العرض."],
                ["عروض جديدة كل 24 ساعة", N(tr.offersPer24h) + " (عروض ومزادات)"],
                ["مشتريات كل 24 ساعة", N(tr.buysPer24h) + " (شراء عرض، أو فوز بمزاد، أو قيادة مزاد)"],
                ["صقر اشتريته من لاعب", "لا تعيد عرضه قبل " + N(tr.boughtLockHours) + " ساعة. يمكنك في هذه الفترة أن تسابق به وتزاوجه وتبيعه للسوق وتطلقه."],
                ["صقور البداية", "لا تُعرض ولا تُزاد (السوق يشتريها فقط)"],
                ["إلغاء عرض", "ممكن في أي وقت ما دام مفتوحًا"],
                ["مكانك في المقر", "الصقر المعروض ما زال يأخذ خانة"]]) +
              H.info("<b>مثال:</b> بعت صقرًا بـ 20,000 عملة. الرسوم " + N(fee) + "% = " + N(20000 * fee / 100) + ". تستلم <b>" + N(20000 - 20000 * fee / 100) + "</b> عملة.") +
              H.shots([["market/pm_forsale", "سوق اللاعبين: عروض البيع"], ["market/pm_mine", "عروضك أنت"]]) +
              H.tip("المشتري يدفع السعر المعروض كاملًا، والرسوم من البائع. حدّد سعرك داخل النطاق، وتذكّر أن مشتريك الجديد يُقفل " + N(tr.boughtLockHours) + " ساعة عن إعادة العرض."),
            en: "<p>You sell your falcon to another player at the price you set. <b>The rules are the same for every player</b>: account age or wealth changes nothing. No confirmed e-mail is needed.</p>" +
              H.kpis([[N(fee) + "%", "market fee, paid by the seller"], [N(tr.minPricePercent) + "–" + N(tr.maxPricePercent) + "%", "price band from the value"], [N(tr.buysPer24h), "buys per 24 hours"], [N(tr.boughtLockHours) + " h", "re-sale lock"]]) +
              H.table(["Rule", "Value"], [
                ["Who may trade", "Level " + N(tr.minLevel) + " and up"],
                ["Price of a listing or an auction start", "Between " + N(tr.minPricePercent) + "% and " + N(tr.maxPricePercent) + "% of the falcon's value"],
                ["Lowest and highest price of all", N(on.listingMinPrice) + " to " + N(on.listingMaxPrice) + " coins"],
                ["Fee", N(fee) + "% of the sale price, paid by the seller. Fixed when you put the offer up."],
                ["New offers every 24 hours", N(tr.offersPer24h) + " (listings and auctions)"],
                ["Buys every 24 hours", N(tr.buysPer24h) + " (a listing bought, an auction won, or an auction you lead)"],
                ["A falcon you bought from a player", "Cannot be listed again for " + N(tr.boughtLockHours) + " hours. In that time it can still race, breed, be sold to the market, or be released."],
                ["Starter falcons", "Cannot be listed or auctioned (the market still buys them)"],
                ["Cancel an offer", "Any time while it is open"],
                ["Your mews", "A falcon on sale still uses a slot"]]) +
              H.info("<b>Example:</b> you sell a falcon for 20,000 coins. The fee is " + N(fee) + "% = " + N(20000 * fee / 100) + ". You receive <b>" + N(20000 - 20000 * fee / 100) + "</b> coins.") +
              H.shots([["market/pm_forsale", "The players' market: offers for sale"], ["market/pm_mine", "Your own offers"]]) +
              H.tip("The buyer pays the full price shown and the fee comes out of the seller. Keep your price inside the band, and remember a falcon you just bought is locked for " + N(tr.boughtLockHours) + " hours before you can list it again.")
          }
        },
        {
          id: "auctions", title: { ar: "المزادات المباشرة", en: "Live auctions" },
          html: {
            ar: "<p>بدل السعر الثابت، اعرض صقرك في مزاد. الناس يزايدون، وأعلى مزايد يفوز.</p>" +
              H.kpis([[N(on.auctionMinMinutes) + " د", "أقصر مزاد"], [N(on.auctionMaxMinutes / 60) + " س", "أطول مزاد"], [N(on.antiSnipeSeconds) + " ث", "حماية آخر لحظة"], [N(tr.maxPricePercent) + "%", "سعر الشراء الفوري من القيمة"]]) +
              H.steps([
                "اختر مدة المزاد من " + N(on.auctionMinMinutes) + " دقائق إلى " + N(on.auctionMaxMinutes) + " دقيقة (24 ساعة)، وسعر البداية داخل نطاق " + N(tr.minPricePercent) + "–" + N(tr.maxPricePercent) + "% من القيمة.",
                "كل مزايدة جديدة تزيد على الحالية بـ <b>الأكبر من " + N(on.auctionMinIncrement) + " عملات أو " + N(on.auctionMinIncrementPercent) + "%</b> منها.",
                "مزايدتك الأعلى <b>تُحجز من رصيدك</b>، وتعود إليك إذا زايد أحد فوقك.",
                "مزايدة في آخر " + N(on.antiSnipeSeconds) + " ثانية تؤجل النهاية إلى " + N(on.antiSnipeSeconds) + " ثانية من وقتها، حتى يجد الآخرون وقتًا للرد.",
                "إذا بلغت مزايدة <b>" + N(tr.maxPricePercent) + "%</b> من القيمة فُزتَ فورًا وانتهى المزاد.",
                "البائع يستلم السعر النهائي ناقص " + N(fee) + "%. وإن لم يزايد أحد رجع الصقر إليك. الفائز يُقفل الصقر عنده " + N(tr.boughtLockHours) + " ساعة."
              ]) +
              "<h3>أمثلة على أقل مزايدة تالية</h3>" +
              H.table(["المزايدة الحالية", "أقل زيادة", "أقل مزايدة تالية"], [100, 1000, 20000].map(function (cur) { var inc = Math.max(on.auctionMinIncrement, Math.ceil(cur * on.auctionMinIncrementPercent / 100)); return [N(cur), N(inc), N(cur + inc)]; })) +
              H.shots([["market/pm_auctions", "تبويب المزادات"]]) +
              H.tip("لا تستطيع المزايدة على مزادك. رفع مزايدتك وأنت المتصدّر لا يُحسب شراءً جديدًا."),
            en: "<p>Instead of a fixed price, put your falcon in an auction. People bid, and the highest bidder wins.</p>" +
              H.kpis([[N(on.auctionMinMinutes) + " min", "shortest auction"], [N(on.auctionMaxMinutes / 60) + " h", "longest auction"], [N(on.antiSnipeSeconds) + " s", "last-moment protection"], [N(tr.maxPricePercent) + "%", "instant-win price, of value"]]) +
              H.steps([
                "Pick a length from " + N(on.auctionMinMinutes) + " minutes to " + N(on.auctionMaxMinutes) + " minutes (24 hours), and a start price inside the " + N(tr.minPricePercent) + "–" + N(tr.maxPricePercent) + "% band of the value.",
                "Each new bid must beat the current one by <b>the larger of " + N(on.auctionMinIncrement) + " coins or " + N(on.auctionMinIncrementPercent) + "%</b> of it.",
                "Your highest bid is <b>held from your balance</b>. It comes back if someone outbids you.",
                "A bid in the last " + N(on.antiSnipeSeconds) + " seconds moves the end to " + N(on.antiSnipeSeconds) + " seconds after that bid, so others have time to answer.",
                "A bid of <b>" + N(tr.maxPricePercent) + "%</b> of the value wins at once and ends the auction.",
                "The seller gets the final bid minus " + N(fee) + "%. If nobody bids, the falcon comes back to you. The winner's falcon is locked for " + N(tr.boughtLockHours) + " hours."
              ]) +
              "<h3>Next-bid examples</h3>" +
              H.table(["Current bid", "Smallest raise", "Smallest next bid"], [100, 1000, 20000].map(function (cur) { var inc = Math.max(on.auctionMinIncrement, Math.ceil(cur * on.auctionMinIncrementPercent / 100)); return [N(cur), N(inc), N(cur + inc)]; })) +
              H.shots([["market/pm_auctions", "The Auctions tab"]]) +
              H.tip("You cannot bid on your own auction. Raising a bid while you already lead does not count as a new buy.")
          }
        },
        {
          id: "qty", title: { ar: "الشراء بالكمية والشهادة الذهبية", en: "Quantity buying and the gold certificate" },
          html: {
            ar: H.next("<b>أزرار + و − في اللعبة تصل مع تحديث 0.1.2.</b> الخادم جاهز لها الآن.") +
              "<p>اشترِ عدة قطع في خطوة واحدة: أدوية اللآلئ، بطاقات تغيير الاسم، الخانات المدفوعة، بطاقات النداء، والشهادات الذهبية. تدفع مرة واحدة على المجموع، وأكثر ما تشتريه دفعة واحدة <b>" + N(D("shop.buyQtyMax")) + "</b>. إذا ضغطت مرتين بالخطأ فلن يُخصم منك مرتين.</p>" +
              "<h3>الشهادة الذهبية</h3>" +
              H.kpis([[N(D("shop.items[pedigree_gold].pearls")), "لؤلؤة للشهادة"], ["1", "شهادة لكل صقر"]]) +
              "<p>تصرف شهادة واحدة على <b>صقر واحد</b>. فيظهر نسبه ذهبيًا لكل اللاعبين، ومعه أجداده. تبقى الشهادة مع الصقر إذا بعته. لا تُهدى.</p>" +
              H.tip("شهادة مجانية في الخطوة " + N(certStep.step) + " من المسار المجاني لتصريح الموسم."),
            en: H.next("<b>The + and − buttons in the game arrive with update 0.1.2.</b> The server is already ready for them.") +
              "<p>Buy several items in one step: Pearl medicines, rename cards, paid slots, Shout cards and gold certificates. You pay once for the total, and the most you can buy at once is <b>" + N(D("shop.buyQtyMax")) + "</b>. If you tap twice by mistake you are not charged twice.</p>" +
              "<h3>The gold certificate</h3>" +
              H.kpis([[N(D("shop.items[pedigree_gold].pearls")), "Pearls per certificate"], ["1", "certificate per falcon"]]) +
              "<p>You spend one certificate on <b>one falcon</b>. Its pedigree then shows in gold to every player, and its ancestors too. The certificate stays with the falcon if you sell it. It cannot be gifted.</p>" +
              H.tip("There is a free certificate at step " + N(certStep.step) + " of the Season Pass free track.")
          }
        },
        {
          id: "tips", title: { ar: "نصائح ذكية", en: "Smart tips" },
          html: {
            ar: "<ul><li>افحص القيمة قبل أن تعرض. السعر خارج " + N(tr.minPricePercent) + "–" + N(tr.maxPricePercent) + "% يُرفض.</li>" +
              "<li>الرسوم " + N(fee) + "%: بيعة بـ 100,000 تعطيك 85,000.</li>" +
              "<li>الصقر الذي تشتريه من لاعب مقفل " + N(tr.boughtLockHours) + " ساعة. خطّط قبل أن تشتري لتبيع.</li>" +
              "<li>السوق يدفع حتى " + N(mk.npcMaxPayout) + " فقط. الصقور النادرة والنخبة والأسطورية تساوي أكثر عند اللاعبين أو عند التاجر (حتى " + N(trader.maxCoins) + ").</li>" +
              "<li>صقور البداية لا تُتداول. استعملها للسباق والتزاوج والتدريب.</li></ul>",
            en: "<ul><li>Check the value before you list. A price outside " + N(tr.minPricePercent) + "–" + N(tr.maxPricePercent) + "% is refused.</li>" +
              "<li>The fee is " + N(fee) + "%: a 100,000 sale pays you 85,000.</li>" +
              "<li>A falcon you buy from a player is locked for " + N(tr.boughtLockHours) + " hours. Plan before you buy to sell on.</li>" +
              "<li>The market pays " + N(mk.npcMaxPayout) + " at most. Rare, Elite and Legendary falcons are worth more to players or to the trader (up to " + N(trader.maxCoins) + ").</li>" +
              "<li>Starter falcons cannot be traded. Use them to race, breed and train.</li></ul>"
          }
        }
      ];
    }
  });
})(window.Book);
