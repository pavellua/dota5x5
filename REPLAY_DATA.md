# Дані з Dota 2-реплею

Цей файл описує дані, які може видати парсер у поточному проєкті. Набір полів залежить від режиму, версії Dota 2 і конкретного реплею: відсутні або непідтримані дані можуть бути порожніми.

## Що тестовий парсер уже показує

- **Час:** оцінений час першого піку/бану, час початку ігрової фази, тривалість матчу.
- **Результат:** переможець матчу, якщо його вдалося визначити за знищеною базою.
- **Рошани:** кількість убивств Рошана окремо для Radiant і Dire.
- **Бани:** списки забанених героїв для обох команд.
- **Гравці:** ім'я з локального `players.json`, Steam account ID, слот і команда.
- **Герой і роль:** ID героя та роль, яку визначає локальний алгоритм за ранніми координатами гравця.
- **K/D/A:** убивства, смерті й асисти гравця.
- **Стаки:** кількість застаканих кріпів і таборів.
- **Варди:** кількість поставлених Observer і Sentry.
- **True Sight:** кількість Observer, для яких подія реплею зарахувала гравцю True Sight.
- **Золото за Observer:** сума значень золота з подій знищення Observer, зарахована гравцю True Sight.
- **Смоки:** скільки разів кожен гравець активував Smoke of Deceit.
- **Фарм:** фінальні ластхіти, денаї та net worth кожного гравця.
- **Шкода героям:** сума шкоди з бойових подій по ворожих героях, приписана гравцеві-герою.
- **Технічна інформація:** кількість подій та кількість подій кожного типу. Повний результат доступний у розгорнутому блоці JSON.

## Інші дані, які парсер записує в події

### Гравці та стан гри

- час події відносно початку ігрової фази;
- Steam ID, account ID, команда та слот гравця;
- герой, ID героя, варіант/фасет, рівень;
- координати гравця на мапі;
- K/D/A, золото, досвід, рівень, net worth, last hits і denies;
- фінальні значення last hits, denies і net worth використовуються для рядка гравця в тестовому парсері;
- участь у командних боях, тривалість stun та окремі тимчасові бойові показники;
- кількість рун, веж, Рошанів, поставлених вард, стаків кріпів і таборів — якщо ці поля присутні у реплеї.

### Драфт і час

- окремі події піків і банів: порядок, герой, команда, час і залишок додаткового часу;
- перехід у фазу драфту;
- початок ігрової фази;
- паузи та їхня тривалість;
- завершення матчу та метадані реплею.

### Бойові події та предмети

- убивства героїв, смерті, First Blood, серії вбивств і multikill;
- нанесена шкода, лікування, здібності та зміни рівня здібностей;
- застосування/зняття ефектів (modifiers);
- купівлі предметів, стартові предмети, використання предметів;
- отримання нейтральних предметів і токенів;
- знищення веж, бараків та інших будівель;
- Рошан, Aegis та окремі спеціальні об'єкти.

### Інші події

- повідомлення чату, chat wheel і сигнали на мапі;
- встановлення, зникнення та знищення Observer/Sentry;
- підбір рун, використання Glyph і Scan;
- дим, кур'єри, buyback, disconnect/reconnect та інші системні повідомлення;
- косметичні предмети та деякі дані Dota Plus.

## Типи подій у прикладі `8890349082.dem`

У цьому реплеї парсер побачив такі типи. Інший матч може містити інший набір:

`actions`, `chat`, `chatwheel`, `cosmetics`, `dotaplus`, `draft_start`, `draft_timings`, `epilogue`, `game_paused`, `game_start_time`, `interval`, `neutral_item_history`, `pings`, `player_slot`, `STARTING_ITEM`, `DOTA_ABILITY_LEVEL`, `DOTA_COMBATLOG_ABILITY`, `DOTA_COMBATLOG_ABILITY_TRIGGER`, `DOTA_COMBATLOG_BUYBACK`, `DOTA_COMBATLOG_DAMAGE`, `DOTA_COMBATLOG_DEATH`, `DOTA_COMBATLOG_FIRST_BLOOD`, `DOTA_COMBATLOG_GAME_STATE`, `DOTA_COMBATLOG_GOLD`, `DOTA_COMBATLOG_HEAL`, `DOTA_COMBATLOG_ITEM`, `DOTA_COMBATLOG_KILLSTREAK`, `DOTA_COMBATLOG_MODIFIER_ADD`, `DOTA_COMBATLOG_MODIFIER_REMOVE`, `DOTA_COMBATLOG_MULTIKILL`, `DOTA_COMBATLOG_PLAYERSTATS`, `DOTA_COMBATLOG_PURCHASE`, `DOTA_COMBATLOG_TEAM_BUILDING_KILL`, `DOTA_COMBATLOG_XP`, `CHAT_MESSAGE_AEGIS`, `CHAT_MESSAGE_ALCHEMIST_GRANTED_SCEPTER`, `CHAT_MESSAGE_BANNER_PLANTED`, `CHAT_MESSAGE_BARRACKS_KILL`, `CHAT_MESSAGE_BUYBACK`, `CHAT_MESSAGE_COURIER_LOST`, `CHAT_MESSAGE_COURIER_RESPAWNED`, `CHAT_MESSAGE_DISCONNECT`, `CHAT_MESSAGE_FIRSTBLOOD`, `CHAT_MESSAGE_GLYPH_USED`, `CHAT_MESSAGE_HERO_KILL`, `CHAT_MESSAGE_ITEM_PURCHASE`, `CHAT_MESSAGE_MINIBOSS_KILL`, `CHAT_MESSAGE_NO_BATTLE_POINTS`, `CHAT_MESSAGE_OBSERVER_WARD_KILLED`, `CHAT_MESSAGE_PAUSED`, `CHAT_MESSAGE_ROSHAN_KILL`, `CHAT_MESSAGE_ROSHAN_ROAR`, `CHAT_MESSAGE_RUNE_BOTTLE`, `CHAT_MESSAGE_RUNE_PICKUP`, `CHAT_MESSAGE_SCAN_USED`, `CHAT_MESSAGE_SENTRY_WARD_KILLED`, `CHAT_MESSAGE_SMOKE_ACTIVATED`, `CHAT_MESSAGE_STREAK_KILL`, `CHAT_MESSAGE_SUPER_CREEPS`, `CHAT_MESSAGE_TOWER_KILL`, `CHAT_MESSAGE_UNPAUSE_COUNTDOWN`, `CHAT_MESSAGE_UNPAUSED`.

Парсер може також створити події встановлення/зникнення вард (`obs`, `obs_left`, `sen`, `sen_left`), а для нейтральних предметів нижчих рівнів — `neutral_token`; у цьому конкретному реплеї таких типів у результаті не було.

## Важливі обмеження

- Це дані, які можна зчитати з конкретного локального `.dem`, а не обов'язково вся статистика, доступна через OpenDota або Steam API.
- Тестовий екран показує лише вибрану частину подій; решта доступна в сирому JSON, але ще не перетворена на зручну статистику.
- Координати, інвентар та події можна використати для нових графіків і аналізу, але їх ще треба окремо агрегувати й перевірити.
- Імена гравців підставляються з локального `players.json`; сам реплей може містити лише Steam ID.
- Дата початку драфту обчислюється з часових міток реплею й може трохи відрізнятися від ручного часу.
