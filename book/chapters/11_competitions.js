/* Chapter 11 - Tournaments & champions. Facts: Docs/Systems/11_competitions.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var on = D("online"), rk = D("race.ranked"), pearls = D("shop.playRewards.tournamentTopPearls");
  var DAYS = [{ ar: "الأحد", en: "Sunday" }, { ar: "الاثنين", en: "Monday" }, { ar: "الثلاثاء", en: "Tuesday" }, { ar: "الأربعاء", en: "Wednesday" }, { ar: "الخميس", en: "Thursday" }, { ar: "الجمعة", en: "Friday" }, { ar: "السبت", en: "Saturday" }];
  var DIV = { bronze: { ar: "البرونزية", en: "Bronze" }, silver: { ar: "الفضية", en: "Silver" }, gold: { ar: "الذهبية", en: "Gold" }, elite: { ar: "النخبة", en: "Elite" }, legend: { ar: "الأسطورة", en: "Legend" } };
  var startDay = on.tournamentWeekStartDay, endDay = (startDay + Math.floor((on.tournamentDurationHours - 1) / 24)) % 7;
  var places = [1, 2, 3];
  function placeLabel(i) { return { ar: "المركز " + (i + 1), en: "Place " + (i + 1) }; }
  function seasonRows(i) { return rk.season.prizes.map(function (s) { return [B.T(DIV[s.division]), s.coins.map(function (c) { return N(c); }).join(" / "), s.prestige.map(function (c) { return N(c); }).join(" / ")]; }); }

  B.chapter({
    id: "competitions", order: 11, icon: "icons/bar_trophy.png",
    title: { ar: "البطولات والأبطال", en: "Tournaments & champions" },
    blurb: { ar: "بطولة نهاية الأسبوع، قاعة البطولات والبطولات الخاصة، ساحة الأبطال، والدوري بإيجاز.", en: "The weekend tournament, the Tournament hall and special tournaments, the Hall of Champions, and the ranked ladder in brief." },
    sections: function () {
      return [
        {
          id: "weekend", title: { ar: "بطولة نهاية الأسبوع", en: "The weekend tournament" },
          html: {
            ar: "<p>في كل أسبوع بطولة كبيرة، تفتح <b>" + B.T(DAYS[startDay]) + " " + String(on.tournamentWeekStartHour).padStart(2, "0") + ":00</b> وتغلق <b>" + B.T(DAYS[endDay]) + " 23:59</b> بتوقيت الخليج (UTC+" + N(on.tournamentUtcOffsetHours) + ")، أي " + N(on.tournamentDurationHours) + " ساعة. الأسرع يفوز.</p>" +
              H.w("timeline", { title: { ar: "أسبوع البطولة", en: "The tournament week" }, items: [
                { icon: "🟢", label: { ar: B.T(DAYS[startDay]) + " 00:00", en: B.T(DAYS[startDay]) + " 00:00" }, text: { ar: "تفتح البطولة (توقيت الخليج)", en: "The tournament opens (Gulf time)" } },
                { icon: "🏁", label: { ar: "محاولة واحدة لكل صقر", en: "One try per falcon" }, text: { ar: "زمنك نهائي، فلا تعيد", en: "Your time is final" } },
                { icon: "🔴", label: { ar: B.T(DAYS[endDay]) + " 23:59", en: B.T(DAYS[endDay]) + " 23:59" }, text: { ar: "تُغلق البطولة", en: "The tournament closes" } },
                { icon: "🏆", label: { ar: "بعدها مباشرة", en: "Right after" }, text: { ar: "تُدفع الجوائز تلقائيًا", en: "Prizes are paid automatically" } }] }) +
              H.kpis([[N(on.tournamentDurationHours) + " س", "مدة البطولة"], ["1", "محاولة لكل صقر"], [N(on.tournamentMinEntrants), "لاعبون على الأقل في القائمة"]]) +
              H.table(["القاعدة", "التفاصيل"], [
                ["خارج وقت البطولة", "مغلقة. تُظهر الشاشة موعد البطولة القادمة وفائزي الأسبوع الماضي."],
                ["القوائم", "قائمة لكل سلالة وجنس، مثل: شاهين أنثى، جير ذكر، هجين ذكر. كل صقر يدخل قائمته."],
                ["عدة صقور", "كل صقر عندك يدخل مرة واحدة إن وجد قائمته."],
                ["الدخول", "تذكرة سباق عادية (رسم السباق العادي، لا يُسترد). سباق البطولة لا يعطي عملات سباق، لكن الصقر يتعب ويجوع ويتعرض للإصابة كالعادة."],
                ["أي سباق يُحسب؟", "اليوم يُحسب <b>سباق ضد اللعبة فقط</b> في البطولة."],
                ["النتيجة", "أسرع زمن للوصول يفوز. الصقر الذي لا يصل إلى التلواح بلا زمن."],
                ["الجوائز تُدفع فقط إذا", "وصل " + N(on.tournamentPrizeRivalsBelow) + " لاعبين على الأقل تحت صاحب المركز، وفي القائمة " + N(on.tournamentMinEntrants) + " لاعبين أنهوا سباقهم على الأقل."],
                ["الكأس", "كأس دائم ذهبي أو فضي أو برونزي للمراكز 1 إلى 3."]]) +
              H.next("<b>مع تحديث 0.1.2:</b> سباق البطولة يصير سباقًا <b>مباشرًا ضد لاعبين</b> ويبدأ فورًا بلا انتظار. يبقى هدف البطولة مختارًا بعد السباق، والمحاولة المحسوبة تُحسب أيضًا في مسار الصقّار والمهام اليومية. وإن لم تنطلق في السباق لا تُستهلك محاولتك.") +
              H.w("bars", { title: { ar: "جوائز العملات", en: "Coin prizes" }, items: places.map(function (p, i) { return { label: placeLabel(i), value: on.tournamentCoins[i], text: N(on.tournamentCoins[i]) }; }) }) +
              H.table(["المركز", "عملات", "سمعة", "لآلئ"], places.map(function (p, i) { return [String(p), N(on.tournamentCoins[i]), N(on.tournamentPrestige[i]), N(pearls[i])]; })) +
              H.tip("لكل صقر محاولة واحدة، فدرّب صقرك وأرحه قبل أن تطلقه. وانتبه: إن أنهى أقل من " + N(on.tournamentMinEntrants) + " لاعبين قائمة ما، فلا أحد يأخذ جائزة فيها. السباق في البطولة يُحسب أيضًا في المهام ومسار الصقّار.") +
              H.info("تذكير: جائزة المركز الأول " + N(on.tournamentCoins[0]) + " عملة، أي نحو 20 ضعف جائزة سباق عادي رابح (" + N(D("race.rewards[0].coins")) + ")."),
            en: "<p>Every week there is one big tournament. It opens <b>" + B.T(DAYS[startDay]) + " " + String(on.tournamentWeekStartHour).padStart(2, "0") + ":00</b> and closes <b>" + B.T(DAYS[endDay]) + " 23:59</b> Gulf time (UTC+" + N(on.tournamentUtcOffsetHours) + "), that is " + N(on.tournamentDurationHours) + " hours. The fastest wins.</p>" +
              H.w("timeline", { title: { ar: "أسبوع البطولة", en: "The tournament week" }, items: [
                { icon: "🟢", label: { ar: B.T(DAYS[startDay]) + " 00:00", en: B.T(DAYS[startDay]) + " 00:00" }, text: { ar: "تفتح البطولة (توقيت الخليج)", en: "The tournament opens (Gulf time)" } },
                { icon: "🏁", label: { ar: "محاولة واحدة لكل صقر", en: "One try per falcon" }, text: { ar: "زمنك نهائي، فلا تعيد", en: "Your time is final" } },
                { icon: "🔴", label: { ar: B.T(DAYS[endDay]) + " 23:59", en: B.T(DAYS[endDay]) + " 23:59" }, text: { ar: "تُغلق البطولة", en: "The tournament closes" } },
                { icon: "🏆", label: { ar: "بعدها مباشرة", en: "Right after" }, text: { ar: "تُدفع الجوائز تلقائيًا", en: "Prizes are paid automatically" } }] }) +
              H.kpis([[N(on.tournamentDurationHours) + " h", "tournament length"], ["1", "try per falcon"], [N(on.tournamentMinEntrants), "players needed in a list"]]) +
              H.table(["Rule", "Details"], [
                ["Outside the tournament", "Closed. The screen shows when the next one starts and last weekend's winners."],
                ["Lists", "One list per species and sex, for example Peregrine female, Gyr male, Hybrid male. Each falcon enters its own list."],
                ["Several falcons", "Each of your falcons may enter once, if it fits a list."],
                ["Entry", "A normal race ticket (the normal race fee, not paid back). A tournament race gives no race coins, but the falcon still gets tired, hungry and runs the injury roll as usual."],
                ["Which race counts?", "Today only a <b>vs Game race</b> counts for the tournament."],
                ["Result", "The fastest finish time wins. A falcon that does not reach the lure has no time."],
                ["A place is paid only if", "at least " + N(on.tournamentPrizeRivalsBelow) + " players finished below it, and the list has at least " + N(on.tournamentMinEntrants) + " players with a finished run."],
                ["Trophy", "A permanent gold, silver or bronze trophy for places 1 to 3."]]) +
              H.next("<b>With update 0.1.2:</b> a tournament race becomes a <b>live vs Players race</b> and starts at once, with no waiting. The tournament stays selected after a race, and a counted try also counts for the Falconer's Path and the daily tasks. If you miss the take-off, your try is not used.") +
              H.w("bars", { title: { ar: "جوائز العملات", en: "Coin prizes" }, items: places.map(function (p, i) { return { label: placeLabel(i), value: on.tournamentCoins[i], text: N(on.tournamentCoins[i]) }; }) }) +
              H.table(["Place", "Coins", "Prestige", "Pearls"], places.map(function (p, i) { return [String(p), N(on.tournamentCoins[i]), N(on.tournamentPrestige[i]), N(pearls[i])]; })) +
              H.tip("You have one try per falcon, so train and rest your falcon before you fly it. And note: if fewer than " + N(on.tournamentMinEntrants) + " players finish a list, nobody gets a prize in it. Tournament runs also count for tasks and the Falconer's Path.") +
              H.info("For scale: first place pays " + N(on.tournamentCoins[0]) + " coins, about 20 times a winning normal race prize (" + N(D("race.rewards[0].coins")) + ").")
          }
        },
        {
          id: "hall", title: { ar: "قاعة البطولات والبطولات الخاصة", en: "The Tournament hall and special tournaments" },
          html: {
            ar: "<p><b>قاعة البطولات</b> مبنى في قريتك اسمه \"البطولات\" (لا يُرقّى). فيها بطاقة بطولة نهاية الأسبوع وزر <b>سابق في البطولة</b> والبطولات الخاصة وأبطال كل قائمة (صاحب الصقر والحلقة والزمن) وإعادات سباقات الأوائل. تستطيع مشاهدة إعادة أفضل المتسابقين وتتعلم منهم توقيت الإطلاق.</p>" +
              "<h3>البطولات الخاصة</h3><p>يصنعها الفريق فوق بطولة نهاية الأسبوع، وتجري في القاعة نفسها.</p>" +
              H.table(["القاعدة", "التفاصيل"], [
                ["من يشارك", "يحدد الفريق لكل بطولة: كل الصقور، أو سلالات معينة (وللهجين أيضًا)، أو جنسًا واحدًا."],
                ["الدخول", "<b>مجاني</b>. محاولة واحدة لكل صقر في كل بطولة، والزمن نهائي."],
                ["الجوائز", "عملات وسمعة لكل مركز (من 1 إلى 10 مراكز بحسب البطولة) وكأس خاص للمراكز 1 إلى 3. <b>لا لآلئ اليوم.</b>"],
                ["قواعد الإنصاف", "نفس قاعدة بطولة نهاية الأسبوع: المركز يُدفع إذا وصل " + N(on.tournamentPrizeRivalsBelow) + " لاعبين تحته وفي القائمة " + N(on.tournamentMinEntrants) + " لاعبين."],
                ["تداخل البطولات", "قد تجري بطولة خاصة مع بطولة نهاية الأسبوع ومع بطولات أخرى، ولصقرك أن يسابق في كلٍّ منها."],
                ["هدف سباقك", "تختار هدف سباقك التالي: عادي، أو نهاية الأسبوع، أو إحدى البطولات."],
                ["متى تظهر", "الجارية، والتي تبدأ خلال 14 يومًا، والتي انتهت منذ أقل من 7 أيام."],
                ["الكأس", "يحمل اسم البطولة في خزانة كؤوسك."]]) +
              H.next("<b>مع تحديث 0.1.2:</b> قد تدفع البطولة الخاصة <b>لآلئ</b> أيضًا لكل مركز، حتى 500 لؤلؤة للمركز (يحددها الفريق لكل بطولة). تراها في القاعة وفي إشعار النتيجة.") +
              H.shots([["profile/profile_trophy_sheet", "خزانة الكؤوس في ملفك"]]) +
              H.next("<b>مع تحديث 0.1.2:</b> شاشات البطولة والدوري واللوحة القديمة تُستبدل بـ<b>ساحة الأبطال</b> (القسم التالي)."),
            en: "<p>The <b>Tournament hall</b> is a village building called \"Tournaments\" (it cannot be upgraded). It holds the weekend card, the <b>Race in the tournament</b> button, the special tournaments, the champions of every list (owner, falcon, ring, time) and replays of the top runs. You can watch the best runs and learn their release timing.</p>" +
              "<h3>Special tournaments</h3><p>The team makes these on top of the weekend one, and they run in the same hall.</p>" +
              H.table(["Rule", "Details"], [
                ["Who may enter", "Set by the team per event: all falcons, or chosen species (also hybrid), or one sex."],
                ["Entry", "<b>Free</b>. One try per falcon per event, and the time is final."],
                ["Prizes", "Coins and prestige for each place (1 to 10 places, set per event) and a special trophy for places 1 to 3. <b>No Pearls today.</b>"],
                ["Fairness", "Same rule as the weekend: a place pays only if " + N(on.tournamentPrizeRivalsBelow) + " players finished below it and the list has " + N(on.tournamentMinEntrants) + " players."],
                ["Overlap", "A special tournament may run alongside the weekend one and other events, and your falcon may race in each."],
                ["Race target", "You pick the target of your next race: normal, weekend, or one of the events."],
                ["When they show", "Running events, events starting within 14 days, and events that ended within the last 7 days."],
                ["Trophy", "It carries the event's name in your trophy cabinet."]]) +
              H.next("<b>With update 0.1.2:</b> a special tournament may also pay <b>Pearls</b> for each place, up to 500 Pearls a place (set by the team per event). You see them in the Hall and in the result notice.") +
              H.shots([["profile/profile_trophy_sheet", "The trophy cabinet in your profile"]]) +
              H.next("<b>With update 0.1.2:</b> the old tournament, ladder and leaderboard screens are replaced by the <b>Hall of Champions</b> (next section).")
          }
        },
        {
          id: "champions", title: { ar: "ساحة الأبطال", en: "The Hall of Champions" },
          html: {
            ar: H.next("<b>شاشة الساحة تصل مع تحديث 0.1.2.</b> الخادم جاهز لها الآن.") +
              "<p>شاشة واحدة لكل اللوحات. تتنقل بين لافتات اللوحات:</p>" +
              H.table(["اللوحة", "ما تعرضه"], [
                ["سباق نهاية الأسبوع", "ترتيب البطولة الحالية"], ["كل بطولة خاصة", "لوحة لكل بطولة جارية"], ["دوري الأسبوع", "نقاط السباقات المباشرة"],
                ["كأس الأمم", "نقاط كل دولة = نقاط أفضل 20 صقّارًا منها هذا الأسبوع"], ["الصقّارون", "الترتيب بالسمعة"],
                ["المربّون", "الكؤوس التي فازت بها صقور ربّاها اللاعب"], ["الكلانات", "نقاط الكلان هذا الأسبوع"], ["جدار الأبطال", "بطاقة لكل بطولة أُغلقت، فيها ذهبية كل قائمة"]]) +
              H.next("<b>مجموعة الصيد (0.1.2):</b> بطولة المقناص الأسبوعية، كل مطاردة خاصة، أفضل صقور الصيد، أندر الصيدات، ومنقذو الصقور.") +
              "<ul><li>الكل يظهر في صفحات من 50. بحث باسم اللاعب أو الصقر أو الكلان أو المزرعة. زر \"جدني\" وشريط بمكانك واللاعب الذي عليك أن تتجاوزه.</li>" +
              "<li>مرشح \"من\": الجميع، بلدي، الأصدقاء، كلاني.</li>" +
              "<li>أسهم خضراء وحمراء تُري حركتك منذ الأمس.</li>" +
              "<li>اللوحات تُحدَّث كل " + N(120) + " ثانية على الأكثر، وكل " + N(30) + " ثانية في آخر ساعة من البطولة. وفي آخر ساعة تتحول اللافتة إلى الأحمر والذهبي.</li>" +
              "<li>الألقاب: شارة تاج ذهبية لفائزي نهاية الأسبوع الماضي، وشيخ الصقّارين، وشيخ المربّين، وقائد دوري القسم.</li></ul>" +
              H.info("ليس على أي لوحة: التلواح، العملات، اللآلئ، المشتريات، المظهر، الحظ، ولا لوحة \"الأغنى\". لا يُقاس بالمال هنا.") +
              H.shots([["majlis/clan_ranking", "ساحة الأبطال: لوحة الكلانات"]]),
            en: H.next("<b>The Hall screen arrives with update 0.1.2.</b> The server is already ready for it.") +
              "<p>One screen for all the boards. You move between the board banners:</p>" +
              H.table(["Board", "What it shows"], [
                ["Weekend race", "The ranking of the current tournament"], ["Each special tournament", "A board for every running event"], ["Weekly ladder", "Points from the live races"],
                ["Nations Cup", "A country's score = the ladder points of its best 20 falconers this week"], ["Falconers", "Ranked by prestige"],
                ["Breeders", "Trophies won by falcons the player bred"], ["Clans", "Clan points this week"], ["Wall of Champions", "One card for every settled weekend, with the gold of every list"]]) +
              H.next("<b>The Hunting group (0.1.2):</b> the weekly hunting tournament, each special hunt, Top hunting falcons, Rarest catches and Falcon rescuers.") +
              "<ul><li>Everyone shows, in pages of 50. Search by player, falcon, clan or farm name. A \"Find me\" button and a bar with your place and the next player to beat.</li>" +
              "<li>A \"Who\" filter: Everyone, My country, Friends, My clan.</li>" +
              "<li>Green and red arrows show your move since yesterday.</li>" +
              "<li>Boards refresh at most every " + N(120) + " seconds, and every " + N(30) + " seconds in the last hour of a tournament. In that last hour the banner turns red and gold.</li>" +
              "<li>Titles: a gold crown chip for last weekend's winners, Sheikh of falconers, Sheikh of breeders, and the ladder leader of a division.</li></ul>" +
              H.info("Not on any board: the lure game, coins, Pearls, purchases, looks, luck, and a \"richest\" board. Nothing here is ranked by money.") +
              H.shots([["majlis/clan_ranking", "The Hall of Champions: the Clans board"]])
          }
        },
        {
          id: "ladder", title: { ar: "الدوري والمواسم (بإيجاز)", en: "The ranked ladder and seasons (in brief)" },
          html: {
            ar: "<p>الدوري ترتيب السباقات المباشرة ضد لاعبين آخرين. السباقات نفسها تُشرح في فصل السباق. هنا أرقام الأقسام:</p>" +
              H.table(["القسم", "من نقاط", "عملات السباق", "رسم الدخول"], rk.divisions.map(function (d) { return [B.T(DIV[d.id]), N(d.minPoints), N(d.coinPercent) + "%", N(d.entryFee)]; })) +
              H.kpis([["+" + rk.placePoints.slice(0, 3).join(" / +"), "نقاط المراكز 1 / 2 / 3"], [N(rk.placementRaces), "سباقات تقييم أولى تُحسب ضعفين"], [N(rk.raceNight.startHour) + ":00", "ليلة السباق يوميًا، لمدة " + N(rk.raceNight.durationMinutes) + " دقيقة"]]) +
              "<ul><li>نقاط المراكز 1 إلى 5: " + rk.placePoints.map(function (x) { return (x > 0 ? "+" : "") + x; }).join(" / ") + ".</li>" +
              "<li><b>ليلة السباق:</b> كل يوم من الساعة " + N(rk.raceNight.startHour) + ":00 (توقيت الخليج) لمدة " + N(rk.raceNight.durationMinutes) + " دقيقة، النقاط ×" + N(rk.raceNight.pointsMultiplier) + "، وحتى " + N(rk.raceNight.maxRacesPerFalconPerDay) + " سباقات لكل صقر في اليوم. يصلك تذكير قبلها بـ " + N(rk.raceNight.reminderMinutesBefore) + " دقائق.</li>" +
              "<li><b>الموسم</b> شهر واحد. تلزمك " + N(rk.season.minRaces) + " سباقًا على الأقل لتدخل جوائز الموسم.</li>" +
              "<li>في نهاية الموسم تعود نقاطك إلى " + N(rk.season.softResetFloor) + " على الأقل، وتحتفظ بـ " + N(rk.season.softResetKeepPercent) + "% مما فوقها.</li>" +
              "<li>القسم يضرب <b>قيمة صقرك</b>: برونزي ×" + N(D("economy.valuation.divisionMultiplier.bronze")) + " حتى أسطورة ×" + N(D("economy.valuation.divisionMultiplier.legend")) + ".</li></ul>" +
              "<h3>جوائز الموسم (المراكز 1 / 2 / 3)</h3>" +
              H.table(["القسم", "عملات", "سمعة"], seasonRows()) +
              H.shots([["market/detail_rank", "تصنيف السباق في صفحة الصقر"]]) +
              H.tip("قسم أعلى يعني عملات أكثر لكل سباق، لكن رسم دخول أغلى."),
            en: "<p>The ladder is the ranking of the live races against other players. The races themselves are explained in the Racing chapter. Here are the division numbers:</p>" +
              H.table(["Division", "From points", "Race coins", "Entry fee"], rk.divisions.map(function (d) { return [B.T(DIV[d.id]), N(d.minPoints), N(d.coinPercent) + "%", N(d.entryFee)]; })) +
              H.kpis([["+" + rk.placePoints.slice(0, 3).join(" / +"), "points for places 1 / 2 / 3"], [N(rk.placementRaces), "first placement races count double"], [N(rk.raceNight.startHour) + ":00", "race night every day, for " + N(rk.raceNight.durationMinutes) + " minutes"]]) +
              "<ul><li>Points for places 1 to 5: " + rk.placePoints.map(function (x) { return (x > 0 ? "+" : "") + x; }).join(" / ") + ".</li>" +
              "<li><b>Race night:</b> every day from " + N(rk.raceNight.startHour) + ":00 Gulf time for " + N(rk.raceNight.durationMinutes) + " minutes, points ×" + N(rk.raceNight.pointsMultiplier) + ", and at most " + N(rk.raceNight.maxRacesPerFalconPerDay) + " races per falcon a day. A reminder comes " + N(rk.raceNight.reminderMinutesBefore) + " minutes before.</li>" +
              "<li>A <b>season</b> is one month. You need at least " + N(rk.season.minRaces) + " races to be eligible for the season prizes.</li>" +
              "<li>At the season's end your points go back to at least " + N(rk.season.softResetFloor) + ", and you keep " + N(rk.season.softResetKeepPercent) + "% of what is above that.</li>" +
              "<li>The division multiplies your <b>falcon's value</b>: Bronze ×" + N(D("economy.valuation.divisionMultiplier.bronze")) + " up to Legend ×" + N(D("economy.valuation.divisionMultiplier.legend")) + ".</li></ul>" +
              "<h3>Season prizes (places 1 / 2 / 3)</h3>" +
              H.table(["Division", "Coins", "Prestige"], seasonRows()) +
              H.shots([["market/detail_rank", "The race rank on a falcon's page"]]) +
              H.tip("A higher division means more coins per race, but a dearer entry fee.")
          }
        },
        {
          id: "more", title: { ar: "لوحات أخرى", en: "Other boards" },
          html: {
            ar: "<ul><li><b>لوحة سلالات المزرعة:</b> الصقور التي تلبس حلقة مزرعة: انتصاراتها وسباقاتها وحاملو سلالتها (صقور في مقار أخرى لها جد بحلقتك حتى 3 أجيال).</li>" +
              "<li><b>علامة VIP:</b> يظهر اللاعب الـ VIP بعلامة على اللوحات.</li></ul>" +
              H.tip("شاهد أفضل الجولات وادرسها: تعلمك توقيت الإطلاق. وتذكّر: بطولة نهاية الأسبوع لها محاولة واحدة فقط لكل صقر."),
            en: "<ul><li><b>The farm lines board:</b> falcons wearing a farm ring: their wins, races and carriers (falcons in other mews with a ringed ancestor up to 3 generations back).</li>" +
              "<li><b>The VIP mark:</b> VIP players show a mark on the boards.</li></ul>" +
              H.tip("Watch the best runs and study them: they teach you the release timing. And remember: the weekend tournament gives only one try per falcon.")
          }
        }
      ];
    }
  });
})(window.Book);
