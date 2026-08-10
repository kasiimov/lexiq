# A1 по Navigate Beginner — все темы книги и путь по каждой

Полная карта уровня A1 по учебнику **Navigate Beginner A1 Coursebook** (Oxford,
Dummett & Hughes): 10 юнитов, в каждом 4 темы плюс Review — **40 тем**. По каждой
теме расписан путь: с чего начать, что объяснить, где споткнётся узбекоязычный,
чем закрыть.

Зачем этот файл. В [dastur.md](dastur.md) сказано: книги нужны для **калибровки
порядка и объёма**, а не для содержания. Наша программа A1 в
[`data/syllabus.json`](../data/syllabus.json) — 7 блоков и 26 уроков — собрана по
общему знаменателю CEFR, и до сих пор её никто не сверял с настоящим учебником.
Здесь сверка сделана: видно, что совпадает, чего у нас нет и что мы дали лишним.

**Что взято из книги:** только структура — список тем, грамматика каждой темы,
порядок, названия лексических групп, фокус навыкового задания. Это оглавление,
факт о том, «чему учат на A1».

**Что не взято:** тексты, объяснения, диалоги, упражнения, картинки. Ни одной
строки материала книги здесь нет и в продукт не попадёт — правило из
[README.md](README.md). Все формулировки правил, примеры и задания ниже написаны
заново.

---

## Как читать

Три языка, каждый на своём месте:

- **русский** — объяснение для нас, разработчиков: что делать на шаге и почему;
- **английский** — названия тем, грамматика и примеры, как в книге и как в языке;
- **узбекский** — всё, что увидит ученик: формулировка `can do` и текст
  продуктивного задания. Их можно копировать в `data/lessons/*.json` как есть.

Обозначения покрытия:

| Знак | Что значит |
|---|---|
| 🟢 | тема закрыта нашим уроком, файл написан |
| 🟡 | тема есть в программе, но свёрнута внутрь другого урока — отдельного нет |
| 🔴 | темы у нас нет вообще |

---

## Каркас пути: семь шагов

Скелет одинаковый для всех тем — он собран из уже принятых решений
([kurs.md](kurs.md), [mashqlar.md](mashqlar.md), [konikmalar.md](konikmalar.md)),
чтобы ученик не разгадывал заново структуру каждого урока.

| Шаг | Что это | Откуда правило |
|---|---|---|
| 1. Вход | что должно быть усвоено до темы; не усвоено — назад по ссылке | тест блока и возвраты |
| 2. Правило | 3–5 пунктов по-узбекски, каждый с английским примером; текст фиксирован, не генерируется | kurs.md |
| 3. Ошибки | 3–5 типичных именно для узбекоязычных, с разбором «почему привычный вариант неверен» | mashqlar.md, ступень 5 |
| 4. Слова | 8–12 штук, уезжают в общий словарь и возвращаются по Лейтнеру | kurs.md |
| 5. Практика | 8–10 заданий; ступени 1–2 не больше 20%, основа — 3–6; с второго урока блока подмешиваем 20–30% прошлых тем | mashqlar.md |
| 6. Выход | продуктивное задание ступени 6 или 7 — единственное, где нельзя ответить, не зная темы | mashqlar.md |
| 7. Навык и возврат | одно навыковое задание + расписание 3 / 7 / 21 / 60 дней | konikmalar.md |

Навык на шаге 7 чередуется по кругу: **X.1 — аудирование, X.2 — письмо,
X.3 — речь, X.4 — грамматический разбор**. Где у книги в колонке
Listening/Reading есть свой фокус на этой теме, берём его — он совпадает с
кругом чаще, чем нет.

Тема считается усвоенной по трём условиям сразу: 80% на ступенях 3–6, хотя бы
один принятый свободный ответ, пройден возврат через 7 дней. До этого — «в
работе».

---

## Сводная карта: 40 тем

| Тема книги | Грамматика | Наш урок | |
|---|---|---|---|
| 1.1 On business or on holiday? | verb be (I/you) | `a1-b1-l1` | 🟢 |
| 1.2 Where are you from? | verb be (we/you) | `a1-b1-l4` | 🟢 |
| 1.3 How do you spell that? | question words | `a1-b1-l2` | 🟢 |
| 1.4 Speaking and writing | — (hello/goodbye, форма) | — | 🔴 |
| 2.1 What's this in English? | this/that/these/those; verb be (it/they) | `st-b4-l1`, `st-b4-l2` | 🟢 |
| 2.2 What's your job? | verb be (he/she/it/they) | `a1-b1-l1` | 🟡 |
| 2.3 Where are they? | subject pronouns | `st-b3-l2`, `a1-b4-l2` | 🟢 |
| 2.4 Speaking and writing | — (время, блог) | `a1-b3-l3` | 🟡 |
| 3.1 My neighbours | have got, has got | `a1-b2-l1`, `a1-b2-l3` | 🟢 |
| 3.2 Possessions | have got negatives and questions | `a1-b2-l1` | 🟡 |
| 3.3 Family | possessive determiners; possessive 's | `a1-b2-l2` | 🟢 |
| 3.4 Speaking and writing | — (обиходные фразы, соцсети) | — | 🔴 |
| 4.1 About me | present simple positive | `a1-b3-l1` | 🟢 |
| 4.2 Journeys | present simple negative | `a1-b3-l4`, `a1-b4-l4` | 🟡 |
| 4.3 My day | present simple yes/no questions | `a1-b3-l4` | 🟢 |
| 4.4 Speaking and writing | — (в магазине, email) | `a1-b5-l3` | 🟡 |
| 5.1 Clothes style | adverbs of frequency | `a1-b3-l2` | 🟢 |
| 5.2 Amazing architecture | Wh- questions | — | 🔴 |
| 5.3 Styles around the world | present simple — all forms | `a1-b3-l1` | 🟡 |
| 5.4 Speaking and writing | — (в дороге, смс) | `a1-b4-l3` | 🟡 |
| 6.1 Two towns | there is / there are | `a1-b4-l1` | 🟢 |
| 6.2 Is there Wi-Fi? | Is there…? / Are there…? | `a1-b4-l1` | 🟡 |
| 6.3 Has each flat got a kitchen? | each and all the | — | 🔴 |
| 6.4 Speaking and writing | — (проблема, отзыв) | — | 🔴 |
| 7.1 She can paint | can / can't | `a1-b6-l1` | 🟢 |
| 7.2 Can you help? | Can you…?; adverbs of manner | `a1-b6-l1` | 🟡 |
| 7.3 I like going out | like + -ing | — | 🔴 |
| 7.4 Speaking and writing | — (просьбы, пост) | — | 🔴 |
| 8.1 When we were seven | verb be past simple | `a1-b7-l1` | 🟢 |
| 8.2 Lives from the past | past simple regular verbs | `a1-b7-l2` | 🟢 |
| 8.3 Special moments | object pronouns | — | 🔴 |
| 8.4 Speaking and writing | — (события, биография) | — | 🔴 |
| 9.1 Happy memories | past simple irregular verbs | `a1-b7-l3` | 🟢 |
| 9.2 A good excuse | past simple negatives and questions | `a1-b7-l4` | 🟢 |
| 9.3 News stories | ago | — | 🔴 |
| 9.4 Speaking and writing | — (погода, отзыв о событии) | `a1-b6-l3` | 🟡 |
| 10.1 We're going to raise £5,000 | going to positive and negative | `a2-b5-l1` | 🟡 |
| 10.2 A new life | going to questions and short answers | `a2-b5-l1` | 🟡 |
| 10.3 Cafe cities | would like | `a1-b5-l4`, `a1-b6-l2` | 🟢 |
| 10.4 Speaking and writing | — (заказ, приглашение) | `a1-b5-l4` | 🟡 |

Итог сверки: **20 тем закрыты**, **11 свёрнуты** внутрь соседних уроков,
**9 отсутствуют**. Разбор в конце файла.

---

# Юнит 1. First meetings · с. 6

Цели юнита: представиться, задавать вопросы с *be*, называть страны и числа
1–10, говорить, откуда ты, знать алфавит, использовать вопросительные слова,
здороваться и прощаться, заполнять анкету.

### 1.1 On business or on holiday? · с. 6 · 🟢 `a1-b1-l1`

**Книга:** grammar `verb be (I/you)` · lexis introductions · listening
recognizing questions.
**Can do (uz):** *O'zingizni tanishtirasiz: ism, kasb va qayerdanligingizni aytasiz.*

1. **Вход.** Ученик знает местоимения `I` и `you` и умеет читать по слогам —
   `st-b1-l4`, `st-b3-l1`. Больше ничего не нужно: это первая тема уровня.
2. **Правило.** Четыре пункта. (а) В английском предложении связка обязательна:
   `I am a student`, а не `I student` — в узбекском «-man» слито со словом, здесь
   это отдельное слово. (б) Форма зависит от лица: `I → am`, `you → are`.
   (в) В речи почти всегда стягивают: `I'm`, `you're`. (г) Перед профессией
   стоит `a` / `an`: `a teacher`, `an engineer`.
3. **Ошибки.** `I student` → пропущена связка. `I am engineer` → нет артикля.
   `I am agree` → `agree` уже глагол, `be` ему не нужен, это калька с «розиман».
   `You is late` → с `you` всегда `are`, даже когда обращаются к одному человеку.
4. **Слова.** 10: `name, student, teacher, doctor, engineer, driver, friend,
   nice, from, business` + формула `Nice to meet you`.
5. **Практика.** Ступень 2 ×2 (вставить `am`/`are`), ступень 3 ×2 (утверждение →
   вопрос и отрицание), ступень 5 ×2 (найти пропущенную связку и объяснить),
   ступень 4 ×2 (своё предложение с данной профессией), ступень 6 ×2 (перевод:
   «Мен талабаман», «Сиз мухандисмисиз?»).
6. **Выход** (ступень 7). *Yangi guruhdoshingiz bilan tanishyapsiz. O'zingiz
   haqingizda 4 ta gap yozing: ism, yosh, kasb, shahar.*
7. **Навык — аудирование** (совпадает с фокусом книги: узнать вопрос на слух).
   Диалог 30 секунд, медленно: два человека знакомятся, записать имя и профессию
   каждого. Возврат: 3 / 7 / 21 / 60.

### 1.2 Where are you from? · с. 8 · 🟢 `a1-b1-l4`

**Книга:** grammar `verb be (we/you)` · lexis numbers 1–10, countries ·
pronunciation saying names of countries · reading recognizing proper nouns.
**Can do (uz):** *Qayerdanligingizni aytasiz va suhbatdoshingizdan so'raysiz.*

1. **Вход.** `1.1` усвоена: связка `be` в единственном числе. Числа 1–10 —
   `st-b2-l1`.
2. **Правило.** (а) Множественные лица: `we are`, `they are`, стяжения `we're`,
   `they're`. (б) Происхождение — двумя способами: `I'm from Uzbekistan`
   (страна) и `I'm Uzbek` (национальность, без артикля). (в) Страны и
   национальности пишутся с большой буквы всегда, даже в середине предложения —
   в узбекском это не так. (г) Вопрос строится перестановкой: `Where are you
   from?`
3. **Ошибки.** `I am from uzbekistan` → заглавная буква обязательна.
   `I am from Uzbek` → смешаны страна и национальность. `I from Tashkent` →
   снова потеряна связка. `We is students` → с `we` только `are`.
4. **Слова.** 12: `country, city, Uzbekistan, Uzbek, Russia, Russian, Turkey,
   Turkish, England, English, capital, live`.
5. **Практика.** Ступень 1 ×1 (страна → национальность, разминка), ступень 3 ×2
   (`He is from Turkey` → `Is he from Turkey?`), ступень 5 ×2 (строчная буква,
   `from` + национальность), ступень 4 ×2, ступень 6 ×3 (перевод: «Улар
   Туркиядан», «Биз ўзбекмиз»).
6. **Выход** (ступень 6). *Beshta odam haqida yozing: kim qayerdan va qaysi
   millatdan. Har bir gapda ikkala shaklni ham ishlating.*
7. **Навык — письмо.** Короткая анкета о себе: страна, город, национальность,
   4 строки. Возврат: 3 / 7 / 21 / 60.

### 1.3 How do you spell that? · с. 10 · 🟢 `a1-b1-l2`

**Книга:** grammar `question words` · lexis the alphabet · pronunciation the
alphabet.
**Can do (uz):** *Savol so'zlari bilan savol berasiz va ismni harflab aytasiz.*

1. **Вход.** Алфавит — `st-b1-l1`. Связка `be` во всех лицах — `1.1`, `1.2`.
2. **Правило.** (а) Вопросительные слова: `What` (что), `Where` (где),
   `Who` (кто), `How` (как), `How old` (сколько лет). (б) Порядок жёсткий:
   вопросительное слово → `be` → подлежащее: `Where is your friend?` — поменять
   местами нельзя, в отличие от узбекского, где порядок свободный.
   (в) `How old are you?` — буквально «насколько стар», сказать `How many years
   you have` нельзя. (г) Просьба продиктовать: `How do you spell it?`
3. **Ошибки.** `Where you are from?` → подлежащее и `be` не переставлены.
   `How many years you have?` → калька с «неча ёшдасиз», правильно `How old are
   you?`. `What is your name is Aziz` → вопрос и ответ склеены.
   `Who is your friends?` → `are` для множественного.
4. **Слова.** 10: `what, where, who, how, how old, spell, letter, please,
   repeat, again`.
5. **Практика.** Ступень 2 ×2 (вставить вопросительное слово по ответу),
   ступень 3 ×3 (утверждение → вопрос к выделенному слову), ступень 5 ×2
   (порядок слов), ступень 6 ×2, ступень 8 ×1 (записать продиктованное по буквам
   имя).
6. **Выход** (ступень 7). *Yangi tanishingizga to'rtta savol yozing va o'zingiz
   javob bering.*
7. **Навык — речь.** Продиктовать вслух своё имя и фамилию по буквам,
   распознавание сверяет с эталоном. Возврат: 3 / 7 / 21 / 60.

### 1.4 Speaking and writing · с. 12 · 🔴 темы нет

**Книга:** speaking hello and goodbye · writing filling in a form. Грамматики
нет — это функциональный урок: набор готовых фраз плюс жанр письма.
**Can do (uz):** *Salomlashasiz, xayrlashasiz va oddiy anketani to'ldirasiz.*

1. **Вход.** `1.1`–`1.3`: связка, вопросительные слова, алфавит.
2. **Фразы вместо правила.** Функциональный урок не даёт правила, он даёт
   готовые блоки и границу употребления: `Hello` / `Hi` (нейтральное и
   дружеское), `Good morning` до 12, `Good afternoon` до 18, `Good evening`
   вечером, но `Good night` — только прощание перед сном. Прощание: `Goodbye`,
   `Bye`, `See you later`, `Have a nice day`.
3. **Ошибки.** `Good night` как приветствие вечером — самая частая. `How are
   you?` без ответа-эха `And you?`. `Good day` — в узбекском «хайрли кун»
   нормально, в английском звучит грубо-иронично. В анкете — фамилия в поле
   `First name`: порядок «имя, фамилия» обратный привычному.
4. **Слова.** 12: `hello, goodbye, morning, afternoon, evening, night, see you,
   first name, surname, address, phone number, date of birth`.
5. **Практика.** Ступень 1 ×2 (какое приветствие для какого времени),
   ступень 3 ×2 (формальное → дружеское), ступень 5 ×2 (`Good night` при
   встрече), ступень 7 ×2 (заполнить анкету по короткому рассказу о человеке).
6. **Выход** (ступень 7). *Til kursiga yozilyapsiz. Anketani to'ldiring: ism,
   familiya, yosh, shahar, telefon. Keyin o'qituvchi bilan salomlashuvni yozing.*
7. **Навык — грамматический разбор.** Собрать всё, что было в юните: связка `be`
   + вопросительные слова, 5 предложений с ошибками, найти и объяснить.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** завести урок `a1-b1-l5`. У нас нет ни жанра «анкета», ни
обиходных формул — а это первое, что человек скажет вслух.

---

# Юнит 2. Questions · с. 16

Цели юнита: единственное и множественное число, числа 11–100, профессии,
`be` для he/she/it/they, личные местоимения, предлоги места, время на часах,
блог.

### 2.1 What's this in English? · с. 16 · 🟢 `st-b4-l1`, `st-b4-l2`

**Книга:** grammar `this/that/these/those`, `verb be (it/they)` · lexis objects,
regular plural nouns, numbers 11–100 · pronunciation word stress: -teen and -ty ·
listening understanding singular and plural.
**Can do (uz):** *Narsani ko'rsatib nomini so'raysiz va birlik-ko'plikni farqlaysiz.*

1. **Вход.** Множественное `-s` и артикли `a/an` — `st-b4-l1`, `st-b4-l3`.
   Числа до 20 — `st-b2-l1`.
2. **Правило.** (а) Близко / далеко и один / много: `this` (это, рядом),
   `that` (то, дальше), `these`, `those` — во множественном. (б) `it is` для
   одного предмета, `they are` для нескольких: `It's a pen. They're pens.`
   (в) Вопрос о названии: `What's this in English?` (г) Ударение различает
   `thirTEEN` и `THIRty` — на слух это единственное различие, и оно решает,
   13 у вас или 30.
3. **Ошибки.** `This are books` → к `these` не перешли. `They is pens` →
   форма связки. `What is this in English language?` → лишнее `language`.
   `Three childrens` → у неправильного множественного своего `-s` нет.
4. **Слова.** 12: `book, pen, bag, chair, table, phone, key, watch, box, this,
   that, those` + числа 11–100 группой.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (единственное → множественное
   целиком: `This is a box` → `These are boxes`), ступень 5 ×2, ступень 6 ×2
   (перевод: «Булар нима?», «У менинг калитим»), ступень 8 ×1 (на слух: 15 или
   50).
6. **Выход** (ступень 6). *Stolingizdagi oltita narsani yozing: uchtasi birlikda
   (this / it), uchtasi ko'plikda (these / they).*
7. **Навык — аудирование** (фокус книги: различить единственное и множественное).
   10 коротких фраз, отметить, об одном предмете речь или о нескольких.
   Возврат: 3 / 7 / 21 / 60.

### 2.2 What's your job? · с. 18 · 🟡 свёрнуто в `a1-b1-l1`

**Книга:** grammar `verb be (he/she/it/they)` · lexis jobs · pronunciation word
stress: jobs · reading understanding pronouns (1).
**Can do (uz):** *Boshqa odamning kasbi haqida gapirasiz.*

1. **Вход.** `1.1` и `2.1`: связка в первом и втором лице, `it/they`.
2. **Правило.** (а) Третье лицо: `he is`, `she is`, `it is`, `they are`.
   (б) В узбекском `u` — и он, и она; в английском род выбирать обязательно, и
   ошибка слышна сразу. (в) Профессия всегда с артиклем: `She is a nurse`.
   (г) Вопрос: `What does he do?` или проще на этом уровне `What's his job?`
3. **Ошибки.** `She is nurse` → артикль. `He are a driver` → форма связки.
   `My sister is he doctor` → род перепутан из-за `u`. `They is teachers` →
   множественное.
4. **Слова.** 12: `job, nurse, waiter, shop assistant, manager, cook, farmer,
   builder, police officer, accountant, unemployed, retired`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2 (`He is a cook` → вопрос и
   отрицание), ступень 5 ×2 (`she is he` — род), ступень 4 ×2 (описать члена
   семьи), ступень 6 ×2. Подмешать 20% из `2.1`.
6. **Выход** (ступень 6). *Oilangizdagi to'rt kishi haqida yozing: kim, kasbi
   nima. He / she ni to'g'ri tanlang.*
7. **Навык — письмо.** Три предложения о коллеге или соседе: кто он, чем
   занимается, откуда. Возврат: 3 / 7 / 21 / 60.

**Что делать:** третье лицо у нас втиснуто в первый урок вместе со всей
парадигмой. Книга даёт ему отдельный заход — и правильно: ошибка `he/she` живёт
у узбекоязычных годами. Кандидат на выделение.

### 2.3 Where are they? · с. 20 · 🟢 `st-b3-l2`, `a1-b4-l2`

**Книга:** grammar `subject pronouns` · lexis prepositions of place `in, on,
near / next to`.
**Can do (uz):** *Narsa yoki odam qayerdaligini aytasiz.*

1. **Вход.** `2.1`, `2.2`: `be` во всех лицах.
2. **Правило.** (а) Полный набор подлежащих: `I, you, he, she, it, we, they` —
   местоимение обязательно, безличных предложений нет: `It is cold`, не `Is
   cold`. (б) Предлоги места: `in` (внутри), `on` (на поверхности),
   `under`, `near`, `next to`. (в) В узбекском это падежные окончания
   (`-da`, `-ning yonida`), поэтому предлог легко пропадает.
   (г) Порядок: предмет → `be` → предлог → место.
3. **Ошибки.** `Is on the table` → пропущено `it`. `The book is in the table` →
   `on`, книга лежит на поверхности. `The shop near is` → узбекский порядок с
   послелогом в конце. `He is next the bank` → потеряно `to`.
4. **Слова.** 12: `in, on, under, near, next to, between, behind, in front of,
   bank, shop, station, park`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2, ступень 5 ×2 (пропущенное
   подлежащее), ступень 4 ×2 (описать, где что в комнате), ступень 6 ×2
   (перевод: «Китоб столнинг устида», «Банк почтанинг ёнида»).
6. **Выход** (ступень 7). *Xonangizni tasvirlang: beshta narsa qayerda turibdi.
   Har bir gapda boshqa predlog ishlating.*
7. **Навык — речь.** Вслух описать картинку-схему: пять предметов и их места.
   Возврат: 3 / 7 / 21 / 60.

### 2.4 Speaking and writing · с. 22 · 🟡 частично `a1-b3-l3`

**Книга:** speaking the time · writing a blog.
**Can do (uz):** *Soatni aytasiz va kuningiz haqida qisqa post yozasiz.*

1. **Вход.** Числа до 60 — `st-b2-l1`. Связка `be` — юнит 1.
2. **Правило.** (а) Вопрос `What time is it?`, ответ `It's half past seven`.
   (б) Две системы: разговорная (`half past`, `quarter to`) и цифровая
   (`seven thirty`) — на A1 достаточно уметь понимать обе, а говорить одной.
   (в) `at` для точки времени: `at 7 o'clock`, `at half past six`.
   (г) `o'clock` только с ровным часом — `at 7.30 o'clock` невозможно.
3. **Ошибки.** `It is 7 hours` → калька с «соат 7», `hour` — длительность, а не
   момент. `Now is 8 o'clock` → пропущено `it`. `In 7 o'clock` → предлог `at`.
   `Half eight` в значении 8:30 — это британское сокращение, но у изучающего
   чаще выходит путаница с `half past seven`; на A1 даём одну форму.
4. **Слова.** 10: `time, hour, minute, o'clock, half past, quarter past,
   quarter to, morning, afternoon, midnight`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2 (цифровое → словами), ступень 5 ×2,
   ступень 6 ×2 («Соат неча?», «Мен саккизда ишга бораман»), ступень 8 ×2
   (записать услышанное время).
6. **Выход** (ступень 7). *Bir kuningiz haqida blog yozing: soat necha nima
   qilasiz. Kamida beshta vaqt ko'rsating.*
7. **Навык — грамматический разбор.** Разбор юнита: `be` + местоимения +
   предлоги, пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

**Что делать:** время у нас есть (`a1-b3-l3`), а жанра «блог» нет. Жанры письма
на A1 по [konikmalar.md](konikmalar.md) — «предложение о себе, подпись к фото»;
блог и анкета сюда просятся.

---

# Юнит 3. People and possessions · с. 26

Цели юнита: словосочетания «прилагательное + существительное», `have got`,
вопросы и отрицания с `have got`, антонимы, притяжательные и `'s`, семья,
обиходные выражения, сообщение в соцсети.

### 3.1 My neighbours · с. 26 · 🟢 `a1-b2-l1`, `a1-b2-l3`

**Книга:** grammar `have got, has got` · lexis adjective + noun phrases (1),
irregular plurals · reading identifying key words.
**Can do (uz):** *Nimangiz borligini aytasiz va odamni qisqa tasvirlaysiz.*

1. **Вход.** `2.2`: третье лицо `be`. Множественное число — `st-b4-l1`.
2. **Правило.** (а) `I / you / we / they have got`, `he / she / it has got`.
   (б) Стяжение обязательно в речи: `I've got`, `she's got` — и здесь `'s` это
   `has`, а не `is`. (в) Порядок в словосочетании обратный узбекскому:
   определение перед существительным и не меняется по числу — `two young men`,
   не `two youngs men`. (г) Неправильное множественное: `man → men`,
   `woman → women`, `child → children`, `person → people`.
3. **Ошибки.** `I have got a two children` → артикль с числительным.
   `She have got a car` → `has` в третьем лице. `My brother has got tall` →
   `have got` про обладание, для признака нужно `be`: `is tall`.
   `Two childrens` → двойное множественное.
4. **Слова.** 12: `neighbour, man, men, woman, women, child, children, people,
   tall, short, young, old`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2, ступень 5 ×2 (`have` вместо `has`,
   `has got` вместо `is`), ступень 4 ×2, ступень 6 ×2 («Менинг иккита акам бор»,
   «Унинг эски машинаси бор»).
6. **Выход** (ступень 6). *Qo'shningizni tasvirlang: nechta bolasi bor, qanday
   odam. To'rt gap.*
7. **Навык — аудирование.** Описание человека 30 секунд: сколько детей, машина
   есть или нет. Возврат: 3 / 7 / 21 / 60.

### 3.2 Possessions · с. 28 · 🟡 свёрнуто в `a1-b2-l1`

**Книга:** grammar `have got negatives and questions` · lexis opposite
adjectives · pronunciation stress in yes/no questions and answers.
**Can do (uz):** *Nimasi borligini so'raysiz va «yo'q» deb javob berasiz.*

1. **Вход.** `3.1`: утвердительное `have got`.
2. **Правило.** (а) Вопрос перестановкой, без вспомогательного `do`:
   `Have you got a car?` / `Has she got a phone?` (б) Отрицание:
   `haven't got`, `hasn't got`. (в) Короткие ответы обязательны и звучат
   естественнее полных: `Yes, I have. / No, I haven't.` — просто `Yes` в
   английском выглядит резко. (г) В вопросе интонация идёт вверх, в коротком
   ответе — вниз; это единственный слышимый признак вопроса, когда порядок слов
   стёрся в беглой речи.
3. **Ошибки.** `Do you have got a car?` → смешаны две конструкции.
   `She hasn't got no money` → двойное отрицание, в узбекском оно нормально.
   `You have got a car?` → интонацией вопрос не делают, нужна перестановка.
   `Yes, I have got.` → в коротком ответе `got` отбрасывается.
4. **Слова.** 12: `expensive, cheap, new, old, big, small, fast, slow, easy,
   difficult, clean, dirty`.
5. **Практика.** Ступень 3 ×3 (утверждение → вопрос → отрицание), ступень 5 ×2
   (двойное отрицание, `do` + `have got`), ступень 4 ×2, ступень 6 ×2,
   ступень 8 ×1. Подмешать 20% из `3.1`.
6. **Выход** (ступень 7). *Do'stingizdan beshta narsa haqida so'rang va o'zingiz
   qisqa javob bering: «Have you got …? — Yes, I have.»*
7. **Навык — письмо.** Пять пар «вопрос — короткий ответ» о вещах.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** вопрос и отрицание `have got` у нас внутри `a1-b2-l1` — а именно
здесь появляется `Do you have got`, ошибка-долгожитель. Заслуживает отдельного
урока.

### 3.3 Family · с. 30 · 🟢 `a1-b2-l2`

**Книга:** grammar `possessive determiners (my, his, our…)`, `possessive 's` ·
lexis family · listening understanding final `-s`.
**Can do (uz):** *Kimning narsasi ekanini va oilangizni tanishtirasiz.*

1. **Вход.** `3.1`, `3.2`: `have got` целиком. Третье лицо — `2.2`.
2. **Правило.** (а) Притяжательные: `my, your, his, her, its, our, their` —
   стоят перед существительным и артикль вытесняют: `my book`, не `the my
   book`. (б) `his` / `her` выбираются по владельцу, а не по предмету:
   `Aziz and his sister`, `Dilnoza and her brother`. (в) `'s` для владельца-
   человека: `my brother's car` — порядок обратный узбекскому «акамнинг
   мошинаси», но логика та же: сначала владелец. (г) Множественное владельцев —
   апостроф после `s`: `my parents' house`.
3. **Ошибки.** `The my brother` → артикль лишний. `Aziz and her sister` → `his`,
   владелец мужчина. `The car of my brother` → калька, на A1 говорим `'s`.
   `My brothers car` → без апострофа это множественное число, смысл меняется.
4. **Слова.** 12: `family, parents, mother, father, brother, sister, son,
   daughter, husband, wife, grandmother, grandfather`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2 (`of`-конструкция → `'s`),
   ступень 5 ×3 (`his`/`her`, лишний артикль, апостроф), ступень 6 ×2
   («Бу менинг синглимнинг телефони»), ступень 8 ×1 (на слух: `'s` есть или нет).
6. **Выход** (ступень 7). *Oilangiz haqida beshta gap yozing. Ikkitasida
   egalik olmoshi, ikkitasida 's ishlating.*
7. **Навык — речь.** Рассказать вслух о трёх членах семьи: кто, чем занимается,
   что у него есть. Возврат: 3 / 7 / 21 / 60.

### 3.4 Speaking and writing · с. 32 · 🔴 темы нет

**Книга:** speaking using everyday expressions · writing a social media message.
**Can do (uz):** *Kundalik iboralar bilan javob qaytarasiz va do'stingizga
xabar yozasiz.*

1. **Вход.** Юниты 1–3: `be`, `have got`, притяжательные.
2. **Фразы вместо правила.** Реакции, которые не переводятся пословно:
   `Really?`, `That's great!`, `Oh no!`, `Congratulations!`, `Good luck!`,
   `Never mind`, `No problem`, `Of course`. Плюс жанр сообщения: короткие
   предложения, восклицания, отсутствие обращения «Уважаемый».
3. **Ошибки.** `Congratulation` без `-s` — слово всегда во множественном.
   `I am very happy for your news` → `about`, не `for`. Дословный перевод
   «омад» как `Success!` вместо `Good luck!`. Формальное `Dear friend` в
   сообщении другу — регистр не тот.
4. **Слова.** 12: `really, great, congratulations, good luck, never mind,
   no problem, of course, sorry, welcome, thanks, message, post`.
5. **Практика.** Ступень 1 ×2 (реакция к ситуации), ступень 4 ×3 (написать
   реакцию на новость), ступень 5 ×2 (регистр: формальное там, где нужно
   дружеское), ступень 7 ×2.
6. **Выход** (ступень 7). *Do'stingiz yangi ishga kirdi. Unga qisqa xabar
   yozing: tabrik, savol va taklif.*
7. **Навык — грамматический разбор.** Юнит целиком: `have got` + притяжательные,
   пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

**Что делать:** урок `a1-b2-l4`. Обиходные реакции — то, что делает речь живой,
и у нас их нет ни в одном уроке.

---

# Юнит 4. My life · с. 36

Цели юнита: Present Simple в утверждении, отрицании и вопросе, рассказ о жизни,
поездки, распорядок дня, покупка в магазине, неформальное письмо.

### 4.1 About me · с. 36 · 🟢 `a1-b3-l1`

**Книга:** grammar `present simple positive` · lexis common verbs ·
pronunciation present simple with he/she/it · reading understanding verb phrases.
**Can do (uz):** *Har kuni nima qilishingizni aytasiz.*

1. **Вход.** Юниты 1–3. Особенно `2.2`: третье лицо уже отработано на `be`.
2. **Правило.** (а) Present Simple — про постоянное и регулярное, не про
   «сейчас». (б) В третьем лице единственного числа добавляется `-s`:
   `he works`, `she lives`. Это единственное изменение во всей парадигме — и
   единственное место, где ошибаются. (в) Написание: `-es` после `s, sh, ch, x,
   o` (`goes`, `watches`), `y → ies` после согласной (`studies`).
   (г) Произношение `-s` тройное: /s/ в `works`, /z/ в `lives`, /ɪz/ в
   `watches`.
3. **Ошибки.** `He work in a bank` → пропущено `-s`, самая частая ошибка уровня.
   `He is work in a bank` → лишняя связка: одно предложение — один сказуемый
   глагол. `She studys` → правило `y → ies`. `I working every day` → форма
   Continuous там, где нужна простая.
4. **Слова.** 12: `work, live, study, start, finish, get up, go, have, like,
   want, need, speak`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (`I work` → `He …`), ступень 5 ×2
   (пропущенное `-s`, лишнее `is`), ступень 4 ×2, ступень 6 ×2 («У банкда
   ишлайди»). Подмешать 20% из юнита 3.
6. **Выход** (ступень 7). *Kuningizni tasvirlang: oltita gap, uchtasi o'zingiz
   haqingizda, uchtasi yaqin odamingiz haqida (-s bilan).*
7. **Навык — аудирование.** 10 фраз, на слух определить, есть ли `-s`: `he work`
   или `he works`. Возврат: 3 / 7 / 21 / 60.

### 4.2 Journeys · с. 38 · 🟡 частично `a1-b3-l4`, `a1-b4-l4`

**Книга:** grammar `present simple negative` · lexis transport · listening
understanding positive and negative contractions.
**Can do (uz):** *Nima qilmasligingizni aytasiz va yo'l haqida gapirasiz.*

1. **Вход.** `4.1`: утвердительный Present Simple с `-s`.
2. **Правило.** (а) Отрицание строится вспомогательным: `don't` / `doesn't` +
   начальная форма. (б) Ключевое: `-s` уходит к вспомогательному, у основного
   глагола его больше нет — `He doesn't work`, не `doesn't works`.
   (в) `be` отрицается по-своему, без `do`: `I'm not a driver`.
   (г) Транспорт: `by bus`, `by car`, `by train`, но `on foot` — исключение.
3. **Ошибки.** `He doesn't works` → двойное `-s`. `I not work` → пропущен
   вспомогательный, калька с «ишламайман». `He isn't work here` → `be` вместо
   `do`. `I go to work by foot` → `on foot`.
4. **Слова.** 12: `bus, train, taxi, car, bike, plane, on foot, journey, ticket,
   station, arrive, leave`.
5. **Практика.** Ступень 3 ×3 (утверждение → отрицание), ступень 5 ×3
   (`doesn't works`, `not work`, `isn't work`), ступень 4 ×2, ступень 6 ×2,
   ступень 8 ×1 (на слух: `works` или `doesn't work`).
6. **Выход** (ступень 6). *Beshta gap: uchtasi «men buni qilmayman», ikkitasi
   «u buni qilmaydi». Har birida boshqa fe'l.*
7. **Навык — письмо.** Три предложения о том, как вы добираетесь на работу и чем
   не пользуетесь. Возврат: 3 / 7 / 21 / 60.

**Что делать:** у нас отрицание и вопрос слиты в один `a1-b3-l4`. Книга разводит
их на две темы, и это оправданно: `doesn't works` и `Does he works` — разные
ошибки, каждая требует своего прохода.

### 4.3 My day · с. 40 · 🟢 `a1-b3-l4`

**Книга:** grammar `present simple yes/no questions` · lexis daily activities,
verb + noun phrases · pronunciation stress in present simple yes/no questions
and answers.
**Can do (uz):** *Kundalik ishlar haqida savol berasiz va qisqa javob qaytarasiz.*

1. **Вход.** `4.1`, `4.2`: утверждение и отрицание.
2. **Правило.** (а) Вопрос начинается со вспомогательного: `Do you …?` /
   `Does he …?` (б) Снова: `-s` забирает `Does`, глагол в начальной форме —
   `Does she live here?` (в) Короткий ответ: `Yes, I do. / No, he doesn't` —
   повторять весь глагол не нужно. (г) Устойчивые сочетания заучиваются целиком:
   `have breakfast`, `take a shower`, `go to bed` — здесь `have` не «иметь».
3. **Ошибки.** `Does she lives here?` → двойное `-s`. `You like tea?` →
   пропущен вспомогательный, вопрос сделан интонацией как в узбекском.
   `Do he work?` → `Does` в третьем лице. `Yes, I like.` → короткий ответ
   собирается из `do`, а не из смыслового глагола.
4. **Слова.** 12: `wake up, get up, have breakfast, take a shower, go to work,
   have lunch, come home, watch TV, go to bed, usually, every day, weekend`.
5. **Практика.** Ступень 3 ×3 (утверждение → вопрос), ступень 5 ×3, ступень 4 ×2,
   ступень 6 ×2 («Сен чой ичасанми?»), ступень 8 ×1. Подмешать 20% из `4.2`.
6. **Выход** (ступень 7). *Suhbatdoshingizga kuni haqida beshta savol yozing va
   har biriga qisqa javob bering.*
7. **Навык — речь.** Задать пять вопросов вслух и ответить на вопросы ИИ о своём
   дне. Возврат: 3 / 7 / 21 / 60.

### 4.4 Speaking and writing · с. 42 · 🟡 частично `a1-b5-l3`

**Книга:** speaking in a shop · writing an informal email.
**Can do (uz):** *Do'konda narx so'raysiz va do'stingizga xat yozasiz.*

1. **Вход.** Юнит 4 целиком: Present Simple во всех формах.
2. **Фразы вместо правила.** Магазин: `How much is it?` / `How much are they?`,
   `Have you got …?`, `Can I have …, please?`, `Here you are`, `Anything else?`.
   Письмо: `Hi Aziz,` → новость → вопрос → `See you soon, Davron`.
3. **Ошибки.** `How much cost it?` → калька с «қанча туради». `Give me bread` →
   без `please` и без `can I have` звучит как приказ. `I want …` вместо
   `I'd like …` — грамматически верно, по регистру грубо. `How much are this?` →
   согласование с числом.
4. **Слова.** 12: `how much, price, money, change, cash, card, receipt,
   size, colour, cheap, expensive, please`.
5. **Практика.** Ступень 3 ×2, ступень 4 ×2 (реплика продавцу), ступень 5 ×2
   (регистр и `how much cost`), ступень 7 ×2 (диалог в магазине), ступень 6 ×2.
6. **Выход** (ступень 7). *Do'stingizga norasmiy xat yozing: yangi ishingiz,
   kuningiz qanday o'tishi va bitta savol. 5–6 gap.*
7. **Навык — грамматический разбор.** Юнит целиком: три формы Present Simple,
   пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

---

# Юнит 5. Style and design · с. 46

Цели юнита: наречия частоты, одежда, Wh-вопросы, здание, Present Simple целиком,
части тела, стиль, информация в дороге, договорённость по смс.

### 5.1 Clothes style · с. 46 · 🟢 `a1-b3-l2`

**Книга:** grammar `adverbs of frequency` · lexis colours and clothes ·
pronunciation word stress: clothes · reading `and, but, because`.
**Can do (uz):** *Qanchalik tez-tez qilishingizni aytasiz.*

1. **Вход.** Юнит 4: Present Simple целиком.
2. **Правило.** (а) Шкала: `always → usually → often → sometimes → never`.
   (б) Место в предложении жёсткое: перед смысловым глаголом, но после `be` —
   `I always work`, `I am always late`. Это правило нарушают все.
   (в) `never` уже отрицание, второго не нужно: `I never drink coffee`.
   (г) `sometimes` может стоять и в начале предложения — единственное из списка,
   которому это позволено.
3. **Ошибки.** `I go always to work` → наречие после глагола. `I don't never
   smoke` → двойное отрицание. `He is often late` → верно, а `He often is late`
   → нет: после `be` наречие идёт следом. `Always I get up at six` →
   в начало можно вынести только `sometimes` и `usually`.
4. **Слова.** 12: `always, usually, often, sometimes, never, shirt, trousers,
   dress, shoes, jacket, wear, style`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (вставить наречие в готовое
   предложение — проверяется именно место), ступень 5 ×3, ступень 4 ×2,
   ступень 6 ×2.
6. **Выход** (ступень 6). *Kiyimingiz haqida beshta gap: qaysi birini har doim,
   qaysi birini hech qachon kiymaysiz.*
7. **Навык — аудирование.** Монолог 40 секунд о привычках, отметить, что человек
   делает всегда, а что никогда. Возврат: 3 / 7 / 21 / 60.

### 5.2 Amazing architecture · с. 48 · 🔴 темы нет

**Книга:** grammar `Wh- questions` · lexis adjectives · listening understanding
chunks.
**Can do (uz):** *Wh- savollar bilan tafsilot so'raysiz.*

1. **Вход.** `1.3` (вопросительные слова с `be`), `4.3` (`Do you …?`).
2. **Правило.** (а) Схема: вопросительное слово → вспомогательный → подлежащее →
   глагол: `Where do you live?` (б) С `be` вспомогательного нет:
   `Where are you from?` — два разных шаблона, и путают именно их.
   (в) `Who` в роли подлежащего вспомогательного не берёт: `Who lives here?`,
   не `Who does live here?` (г) `What kind of …?`, `How old …?`, `Why …?` —
   ответ на `Why` начинается с `because`.
3. **Ошибки.** `Where you live?` → пропущен `do`. `Where do you live in?` →
   лишний предлог в конце. `Why you don't like it?` → порядок.
   `Who does live here?` → лишний вспомогательный при `who`-подлежащем.
4. **Слова.** 12: `why, because, kind, building, bridge, tower, beautiful,
   modern, famous, high, wide, amazing`.
5. **Практика.** Ступень 3 ×4 (утверждение → вопрос к каждому члену
   предложения), ступень 5 ×3, ступень 4 ×2, ступень 6 ×2 («Нима учун бу ерда
   яшайсан?»).
6. **Выход** (ступень 7). *Yoqtirgan binongiz haqida beshta Wh- savol tuzing va
   javob bering. Bittasi «Why …?» bo'lsin.*
7. **Навык — письмо.** Пять вопросов интервью для одноклассника.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** у нас есть вопросы с `be` (`a1-b1-l2`) и `Do/Does`
(`a1-b3-l4`), а Wh-вопросов в Present Simple как отдельной темы нет. Это дыра:
`Where you live?` — самая узнаваемая ошибка начинающего.

### 5.3 Styles around the world · с. 50 · 🟡 свёрнуто в `a1-b3-l1`

**Книга:** grammar `present simple — all forms` · lexis parts of the body,
adjective modifiers `very / really + adjective` · pronunciation plural forms.
**Can do (uz):** *Present Simple ning barcha shakllarini aralashtirib
ishlatasiz.*

1. **Вход.** `4.1`–`4.3`, `5.2`: все формы по отдельности.
2. **Правило.** Это урок-сборка, нового правила нет — есть таблица целиком:
   утверждение (`-s` в третьем лице), отрицание (`don't` / `doesn't`), вопрос
   (`Do` / `Does`), Wh-вопрос. Плюс усилители: `very`, `really` перед
   прилагательным — `really beautiful`; `very` перед глаголом не ставится.
3. **Ошибки.** Смешение форм в одном тексте: `He doesn't works` рядом с
   `Do he like`. `I very like it` → `I really like it`. `My hairs are black` →
   `hair` неисчисляемое, множественного нет. `Her eyes is brown` →
   согласование.
4. **Слова.** 12: `head, hair, eye, ear, nose, mouth, hand, leg, very, really,
   look, wear`.
5. **Практика.** Смешанный набор: ступень 3 ×3 (переписать в другую форму),
   ступень 5 ×3, ступень 6 ×2, ступень 7 ×1. Обязательно 30% заданий из юнита 4 —
   это урок на интерливинг.
6. **Выход** (ступень 7). *Bir odamni tasvirlang: tashqi ko'rinishi, nima
   kiyadi, nima qilmaydi. Uchala shakl ham bo'lsin.*
7. **Навык — речь.** Описать вслух человека с фотографии, 5 предложений.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** урока-сборки у нас нет ни в одном блоке. А он нужен: три формы
по отдельности человек делает верно, а в свободной речи смешивает.

### 5.4 Speaking and writing · с. 52 · 🟡 частично `a1-b4-l3`

**Книга:** speaking asking for and giving travel information · writing making
arrangements by text.
**Can do (uz):** *Yo'l haqida so'raysiz va uchrashuvni SMS orqali kelishasiz.*

1. **Вход.** `2.3` (предлоги места), `4.3` (вопросы), `2.4` (время).
2. **Фразы вместо правила.** Дорога: `Excuse me, how do I get to …?`,
   `Which platform?`, `What time does the train leave?`, `How long does it
   take?`. Договорённость: `Are you free at …?`, `Let's meet at …`,
   `See you there`.
3. **Ошибки.** `How I can go to station?` → порядок и артикль.
   `How much time takes?` → нужно `How long does it take?`.
   `Let's to meet` → после `let's` начальная форма без `to`.
   `I will come at 5 o'clock in the station` → `at the station`.
4. **Слова.** 12: `platform, timetable, single, return, take, get to, free,
   meet, wait, late, early, hurry`.
5. **Практика.** Ступень 3 ×2, ступень 4 ×2, ступень 5 ×2, ступень 7 ×3 (диалог
   на вокзале; переписка о встрече).
6. **Выход** (ступень 7). *Do'stingiz bilan SMS yozishma tuzing: uchrashuv joyi,
   vaqti va qanday borish. 6 xabar.*
7. **Навык — грамматический разбор.** Юнит целиком: наречия частоты + Wh-вопросы,
   пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

---

# Юнит 6. Places and facilities · с. 56

Цели юнита: `there is / there are`, места в городе, удобства отеля, вопросы
`Is there…?`, `each` и `all the`, комнаты и мебель, жалоба, отзыв об отеле.

### 6.1 Two towns · с. 56 · 🟢 `a1-b4-l1`

**Книга:** grammar `there is / there are` · lexis places in a town, recording
vocabulary.
**Can do (uz):** *Shahringizda nima borligini aytasiz.*

1. **Вход.** `2.3`: предлоги места. `2.1`: единственное и множественное.
2. **Правило.** (а) `There is` + единственное, `there are` + множественное.
   (б) `There` здесь ничего не значит и не переводится — это формальное
   подлежащее; выбросить его нельзя, хотя в узбекском «бор» стоит один.
   (в) Форма выбирается по первому существительному в перечислении:
   `There is a bank and two shops`. (г) Отрицание: `There isn't a …`,
   `There aren't any …`.
3. **Ошибки.** `In my city has a park` → калька с «шахримда парк бор» через
   `have`. `There is two parks` → согласование. `Is a park in my city` →
   пропущено `there`. `There are a hospital` → артикль с множественной формой.
4. **Слова.** 12: `town, village, square, market, hospital, school, cinema,
   restaurant, museum, library, bank, post office`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (единственное → множественное),
   ступень 5 ×3 (`has` вместо `there is`), ступень 6 ×2 («Кўчамизда иккита
   дўкон бор»).
6. **Выход** (ступень 6). *Mahallangizni tasvirlang: nima bor, nima yo'q.
   Oltita gap, uchtasi inkorda.*
7. **Навык — аудирование.** Описание городка 40 секунд, отметить, что есть, а
   чего нет. Возврат: 3 / 7 / 21 / 60.

### 6.2 Is there Wi-Fi? · с. 58 · 🟡 свёрнуто в `a1-b4-l1`

**Книга:** grammar `Is there…? / Are there…?` · lexis hotel facilities ·
pronunciation `Is there…? / Are there…?` · listening understanding where and when.
**Can do (uz):** *Mehmonxonada nima borligini so'raysiz.*

1. **Вход.** `6.1`: утверждение и отрицание с `there`.
2. **Правило.** (а) Вопрос перестановкой: `Is there a lift?` /
   `Are there any towels?` (б) В вопросе и отрицании вместо `some` идёт `any`.
   (в) Короткий ответ: `Yes, there is. / No, there isn't.` — `there` в ответе
   сохраняется, это не `Yes, it is`. (г) В беглой речи `is there` сливается в
   /ɪzðə/ — узнавать на слух надо отдельно.
3. **Ошибки.** `There is a lift?` → интонацией вопрос не делают.
   `Are there a restaurant?` → согласование. `Yes, there has.` → калька.
   `Is there some towels?` → `any` в вопросе и `are` во множественном.
4. **Слова.** 12: `lift, reception, towel, air conditioning, Wi-Fi, swimming
   pool, parking, breakfast, key card, floor, single room, double room`.
5. **Практика.** Ступень 3 ×3 (утверждение → вопрос), ступень 5 ×2, ступень 4 ×2,
   ступень 7 ×2 (диалог на ресепшене), ступень 8 ×1. Подмешать 20% из `6.1`.
6. **Выход** (ступень 7). *Mehmonxonaga qo'ng'iroq qilyapsiz. Beshta savol
   yozing va administrator javobini ham yozing.*
7. **Навык — письмо.** Письмо в отель с пятью вопросами об удобствах.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** вопросная форма `there is` у нас внутри `a1-b4-l1`. Отдельный
проход оправдан хотя бы лексикой: отель — одна из четырёх ситуаций, ради
которых учат A1.

### 6.3 Has each flat got a kitchen? · с. 60 · 🔴 темы нет

**Книга:** grammar `each and all the` · lexis rooms and furniture ·
pronunciation linking (1) · reading words that look similar.
**Can do (uz):** *«Har biri» va «hammasi» ni farqlab ishlatasiz.*

1. **Вход.** `3.1` (`have got`), `6.1`–`6.2` (`there is/are`), множественное
   число.
2. **Правило.** (а) `each` — про каждый по отдельности, дальше единственное
   число: `Each room has got a TV`. (б) `all the` — про все вместе, дальше
   множественное: `All the rooms have got a TV`. (в) Смысл почти совпадает,
   различается форма глагола — и именно она проверяется.
   (г) `every` близко к `each`, но не сочетается с `of`: `each of the rooms`
   можно, `every of` — нет.
3. **Ошибки.** `Each rooms have got` → после `each` единственное.
   `All the room has got` → после `all the` множественное.
   `All of rooms` → пропущен артикль: `all of the rooms`.
   `Every of the flats` → с `of` работает только `each`.
4. **Слова.** 12: `flat, kitchen, bathroom, bedroom, living room, sofa, bed,
   wardrobe, fridge, cooker, washing machine, furniture`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (`each` ↔ `all the` с
   перестройкой глагола), ступень 5 ×3, ступень 6 ×2 («Ҳар бир хонада
   телевизор бор»).
6. **Выход** (ступень 6). *Uyingizni tasvirlang: nechta xona, har birida nima
   bor. `each` va `all the` ni ikki martadan ishlating.*
7. **Навык — речь.** Вслух описать квартиру, которую сдаёте: комнаты и мебель.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** `each` / `all the` у нас нет ни на A1, ни на A2. Лексика «комнаты
и мебель» — тоже дыра: жильё в программе не появляется вообще.

### 6.4 Speaking and writing · с. 62 · 🔴 темы нет

**Книга:** speaking explaining problems · writing a hotel review.
**Can do (uz):** *Muammoni tushuntirasiz va mehmonxona haqida sharh yozasiz.*

1. **Вход.** Юнит 6: `there is/are` во всех формах, лексика отеля и мебели.
2. **Фразы вместо правила.** Жалоба смягчается, иначе звучит как скандал:
   `Excuse me, there's a problem with …`, `The … doesn't work`,
   `Could you help me, please?`. Отзыв: оценка → причина → рекомендация.
3. **Ошибки.** `The TV is not working good` → `doesn't work` и `well`.
   `Give me another room` → без смягчения. `I have a problem with the air
   conditioner is broken` → две конструкции в одном предложении.
   `It was very bad hotel` → пропущен артикль: `a very bad hotel`.
4. **Слова.** 12: `problem, broken, work, noisy, dirty, comfortable, clean,
   staff, service, review, recommend, complain`.
5. **Практика.** Ступень 4 ×3 (сформулировать жалобу по картинке-ситуации),
   ступень 5 ×2 (грубая формулировка → вежливая), ступень 7 ×3 (диалог с
   администратором; отзыв на 5 предложений).
6. **Выход** (ступень 7). *Mehmonxona haqida sharh yozing: ikkita yaxshi tomon,
   bitta muammo va tavsiya. 6 gap.*
7. **Навык — грамматический разбор.** Юнит целиком: `there is/are` + `each/all`,
   пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

---

# Юнит 7. Skills and interests · с. 66

Цели юнита: `can` и `can't`, свои умения, вопросы с `can`, наречия образа
действия, `like + -ing`, хобби, простые просьбы, пост в соцсети.

### 7.1 She can paint · с. 66 · 🟢 `a1-b6-l1`

**Книга:** grammar `can / can't` · lexis skills, abilities · pronunciation
sentence stress: `can`, `can't` · listening the schwa /ə/.
**Can do (uz):** *Nima qila olishingizni aytasiz.*

1. **Вход.** Юнит 4: Present Simple. Ничего больше не нужно.
2. **Правило.** (а) `can` + начальная форма без `to`: `I can swim`.
   (б) `can` не меняется по лицам: `he can`, не `he cans`.
   (в) Отрицание `can't` — одно слово. (г) Различить на слух: `can` безударное и
   звучит /kən/, `can't` ударное и долгое. Ошибка здесь меняет смысл на
   противоположный.
3. **Ошибки.** `I can to swim` → лишнее `to`, калька с «суза оламан».
   `He cans drive` → `can` не берёт `-s`. `I can't to come` → снова `to`.
   `Can you to help?` → то же в вопросе.
4. **Слова.** 12: `swim, drive, cook, paint, sing, dance, ride, play, speak,
   draw, skill, ability`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2, ступень 5 ×3 (`to` после `can`,
   `cans`), ступень 4 ×2, ступень 8 ×2 (на слух: `can` или `can't`).
6. **Выход** (ступень 6). *O'zingiz haqingizda beshta gap: uchtasi «qila
   olaman», ikkitasi «qila olmayman».*
7. **Навык — аудирование** (фокус книги: `can` в безударной позиции). 10 фраз,
   определить, утверждение это или отрицание. Возврат: 3 / 7 / 21 / 60.

### 7.2 Can you help? · с. 68 · 🟡 свёрнуто в `a1-b6-l1`

**Книга:** grammar `Can you…?` · lexis adverbs of manner · pronunciation `can`,
`can't` in questions and statements · reading scanning for specific information.
**Can do (uz):** *Qila olasizmi deb so'raysiz va qanday qilishini aytasiz.*

1. **Вход.** `7.1`: `can` в утверждении и отрицании.
2. **Правило.** (а) Вопрос перестановкой: `Can you drive?` — вспомогательный
   `do` не нужен. (б) Короткий ответ: `Yes, I can. / No, I can't.`
   (в) `Can you …?` работает и как просьба, и как вопрос об умении — понимает
   по ситуации. (г) Наречия образа действия: `-ly` к прилагательному
   (`quick → quickly`), исключения `good → well`, `fast → fast`. Стоят после
   глагола: `She sings well`.
3. **Ошибки.** `Do you can swim?` → два вспомогательных.
   `He speaks English good` → `well`, самая частая ошибка с наречием.
   `She well sings` → место наречия. `She drives carefuly` → удвоение `l`
   в `carefully`.
4. **Слова.** 12: `well, badly, quickly, slowly, carefully, easily, fluently,
   hard, help, borrow, lend, again`.
5. **Практика.** Ступень 3 ×3 (утверждение → вопрос; прилагательное → наречие),
   ступень 5 ×3 (`good` вместо `well`, `do you can`), ступень 4 ×2, ступень 6 ×2.
   Подмешать 20% из `7.1`.
6. **Выход** (ступень 7). *Do'stingizdan beshta narsani so'rang: «Can you …?»
   Har bir javobda ravish ishlating: well, quickly, badly.*
7. **Навык — письмо.** Пять предложений о том, что вы делаете хорошо, а что
   плохо. Возврат: 3 / 7 / 21 / 60.

**Что делать:** наречия образа действия у нас не встречаются нигде — ни на A1,
ни на A2. `He speaks English good` при этом живёт до B1. Отдельная тема нужна.

### 7.3 I like going out · с. 70 · 🔴 темы нет

**Книга:** grammar `like + -ing` · lexis hobbies, `like / love / hate + -ing` ·
pronunciation linking vowels with /w/ or /j/.
**Can do (uz):** *Nima yoqishini va nima yoqmasligini aytasiz.*

1. **Вход.** Юнит 4 (Present Simple), `5.1` (наречия частоты).
2. **Правило.** (а) После `like, love, enjoy, hate` глагол принимает `-ing`:
   `I like reading`. (б) Шкала: `love → like → don't like → hate`.
   (в) `I like to read` тоже возможно, но `-ing` — про занятие как таковое, и на
   A1 даём одну форму, чтобы не размывать. (г) `enjoy` берёт только `-ing`,
   `enjoy to read` невозможно никогда.
3. **Ошибки.** `I like read books` → пропущено `-ing`, калька с «китоб ўқишни
   яхши кўраман». `I am like swimming` → лишняя связка. `I like very much
   football` → порядок: `I like football very much`. `He like cooking` →
   пропущено `-s`: третье лицо никуда не делось.
4. **Слова.** 12: `hobby, reading, cooking, travelling, shopping, dancing,
   fishing, gardening, love, hate, enjoy, free time`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (`I read books` → `I like
   reading books`), ступень 5 ×3, ступень 6 ×2, ступень 4 ×2.
6. **Выход** (ступень 7). *Bo'sh vaqtingiz haqida oltita gap: ikkitasi love,
   ikkitasi like, ikkitasi hate bilan.*
7. **Навык — речь.** Рассказать вслух о трёх увлечениях и одном занятии, которое
   не нравится. Возврат: 3 / 7 / 21 / 60.

**Что делать:** `like + -ing` — самая заметная дыра в нашем A1. Тема бытовая,
частотная, а первая конструкция с герундием: без неё человек весь уровень
говорит `I like read`.

### 7.4 Speaking and writing · с. 72 · 🔴 темы нет

**Книга:** speaking simple requests · writing a post on a social media website.
**Can do (uz):** *Odob bilan iltimos qilasiz va post yozasiz.*

1. **Вход.** `7.1`–`7.3`: `can`, наречия, `like + -ing`.
2. **Фразы вместо правила.** Просьба по возрастанию вежливости:
   `Can you …?` → `Could you …?` → `Would you mind …?` (последнее только
   узнавать). Ответы: `Sure`, `Of course`, `Sorry, I can't`. Отказ без
   объяснения читается как грубость — после `Sorry` нужна причина.
3. **Ошибки.** `Please give me your pen` вместо `Can I borrow your pen,
   please?` — приказ вместо просьбы. `Could you to help me?` → `to` после
   модального. `No, I can't` без причины. `Please, can you…` — запятая и место
   `please`: естественнее в конце.
4. **Слова.** 12: `could, sure, of course, mind, favour, moment, wait, follow,
   share, comment, like, post`.
5. **Практика.** Ступень 3 ×2 (`can` → `could`), ступень 4 ×3 (просьба по
   ситуации), ступень 5 ×2 (регистр), ступень 7 ×3.
6. **Выход** (ступень 7). *Hobbiyingiz haqida post yozing: nima qilasiz, nega
   yoqadi, o'quvchilarga bitta savol. 6 gap.*
7. **Навык — грамматический разбор.** Юнит целиком: `can` + наречия +
   `like + -ing`, пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

---

# Юнит 8. Our past · с. 76

Цели юнита: `be` в прошедшем, «тогда и сейчас», правильные глаголы в Past
Simple, описание прошлой жизни, объектные местоимения, рассказ по фотографии,
выражения для особых случаев, биография.

### 8.1 When we were seven · с. 76 · 🟢 `a1-b7-l1`

**Книга:** grammar `verb be past simple` · lexis dates · pronunciation `was` and
`were`.
**Can do (uz):** *Qayerda va qanday bo'lganingizni aytasiz.*

1. **Вход.** Юнит 1: `be` в настоящем. Числа и месяцы — `st-b2-l4`.
2. **Правило.** (а) Две формы: `was` для `I / he / she / it`, `were` для
   `you / we / they`. (б) Отрицание `wasn't` / `weren't`, вопрос перестановкой:
   `Were you at home?` — `did` здесь не нужен. (в) Даты: `in 2010`,
   `on 5 May`, `in May`. (г) `was` в беглой речи безударно и звучит /wəz/ —
   на слух пропадает, поэтому его и теряют.
3. **Ошибки.** `I was go to school` → смешаны две конструкции; либо `I went`,
   либо `I was at school`. `Did you were there?` → двойной вспомогательный.
   `They was happy` → форма для множественного. `I born in 1995` →
   `I was born`.
4. **Слова.** 12: `was, were, born, ago, last, then, now, child, childhood,
   date, year, month`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (настоящее → прошедшее),
   ступень 5 ×3, ступень 6 ×2 («Мен кеча уйда эдим»), ступень 8 ×1.
6. **Выход** (ступень 6). *Bolaligingiz haqida beshta gap: qayerda edingiz,
   qanday edingiz, kim bilan edingiz.*
7. **Навык — аудирование.** Рассказ 40 секунд о детстве, записать год рождения и
   город. Возврат: 3 / 7 / 21 / 60.

### 8.2 Lives from the past · с. 78 · 🟢 `a1-b7-l2`

**Книга:** grammar `past simple regular verbs` · lexis `was born / died` ·
pronunciation regular past simple endings · listening past or present.
**Can do (uz):** *Kecha nima qilganingizni aytasiz.*

1. **Вход.** `8.1`: `was / were`. Юнит 4: Present Simple.
2. **Правило.** (а) Правильный глагол в прошедшем: `-ed`, форма одна для всех
   лиц — `he worked`, `they worked`. Это облегчение после `-s`.
   (б) Написание: `-e` → просто `-d` (`live → lived`); согласная удваивается в
   закрытом ударном слоге (`stop → stopped`); `y → ied` (`study → studied`).
   (в) Произношение `-ed` тройное: /t/ в `worked`, /d/ в `lived`, /ɪd/ в
   `wanted` — последнее только после `t` и `d`. (г) `be` в прошедшем `-ed` не
   берёт, у него свои `was / were`.
3. **Ошибки.** `He was worked` → лишняя связка. `I stoped` → удвоение
   согласной. `Yesterday I go to work` → форма не изменена; узбекское «-дим»
   обязательно, а здесь его забывают. `He studyed` → `y → ied`.
4. **Слова.** 12: `worked, lived, studied, started, finished, moved, married,
   died, travelled, opened, yesterday, last year`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (настоящее → прошедшее),
   ступень 5 ×2, ступень 6 ×2, ступень 8 ×2 (на слух: прошедшее или настоящее).
   Подмешать 20% из `8.1`.
6. **Выход** (ступень 6). *Kechagi kuningiz haqida oltita gap yozing. Barcha
   fe'llar to'g'ri fe'l bo'lsin.*
7. **Навык — письмо.** Короткая заметка «мой вчерашний день», 5 предложений.
   Возврат: 3 / 7 / 21 / 60.

### 8.3 Special moments · с. 80 · 🔴 темы нет

**Книга:** grammar `object pronouns` · lexis past time expressions ·
pronunciation linking (2) · reading understanding pronouns (2).
**Can do (uz):** *Kim haqida gapirayotganingizni olmosh bilan ko'rsatasiz.*

1. **Вход.** `2.3`: подлежащные местоимения. `8.2`: Past Simple.
2. **Правило.** (а) Пара к каждому подлежащему: `I → me`, `you → you`,
   `he → him`, `she → her`, `it → it`, `we → us`, `they → them`.
   (б) Объектная форма идёт после глагола и после предлога: `I saw him`,
   `with them`. (в) В узбекском это падежное окончание на том же слове
   (`мени`, `унга`), поэтому отдельное слово выпадает: `I saw` без дополнения.
   (г) Порядок жёсткий: `give me the book` или `give the book to me` — третьего
   нет.
3. **Ошибки.** `I saw he yesterday` → нужна объектная форма `him`.
   `She told to me` → `told me`, `tell` предлога не берёт.
   `Give to me the book` → порядок. `Between you and I` → после предлога `me`.
4. **Слова.** 12: `me, him, her, us, them, last night, last week, two days ago,
   in 2015, moment, remember, forget`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (заменить существительное
   местоимением), ступень 5 ×3, ступень 6 ×2 («Мен уни кеча кўрдим»).
6. **Выход** (ступень 7). *Bitta rasm haqida hikoya yozing: kim bor edi, ular
   bilan nima qildingiz. Kamida to'rtta obyekt olmoshi.*
7. **Навык — речь.** Рассказать вслух о фотографии из телефона: кто на ней и что
   вы вместе делали. Возврат: 3 / 7 / 21 / 60.

**Что делать:** объектных местоимений в нашей программе нет вообще. Это базовая
таблица, без неё нельзя построить ни одного предложения с дополнением-
местоимением — а таких в речи каждое третье.

### 8.4 Speaking and writing · с. 82 · 🔴 темы нет

**Книга:** speaking expressions for special occasions, show interest ·
writing a biography.
**Can do (uz):** *Bayram bilan tabriklaysiz, suhbatga qiziqish bildirasiz va
tarjimai hol yozasiz.*

1. **Вход.** Юнит 8: прошедшее время целиком, объектные местоимения.
2. **Фразы вместо правила.** Поздравления по поводам: `Happy birthday!`,
   `Congratulations!`, `Well done!`, `Happy New Year!`. Поддержать разговор:
   `Really?`, `That's interesting`, `What happened next?`, `Oh, I see`.
   Молчание в ответ на рассказ читается как безразличие — это культурная
   разница, её надо назвать прямо.
3. **Ошибки.** `Happy Birthday to you!` как единственный вариант — в тексте
   достаточно `Happy birthday!`. `Congratulation!` без `-s`.
   `What happened then next?` → избыточность. Биография в настоящем времени:
   `He is born in 1980` → `was born`.
4. **Слова.** 12: `birthday, wedding, anniversary, celebrate, present, guest,
   invite, well done, interesting, happened, next, later`.
5. **Практика.** Ступень 1 ×2 (реплика к поводу), ступень 4 ×3, ступень 5 ×2,
   ступень 7 ×3 (поздравление; биография).
6. **Выход** (ступень 7). *Hurmat qiladigan odamingiz haqida tarjimai hol
   yozing: qachon tug'ilgan, qayerda o'qigan, nima qilgan. 6–7 gap, hammasi
   o'tgan zamonda.*
7. **Навык — грамматический разбор.** Юнит целиком: `was/were` + `-ed` +
   объектные местоимения, пять предложений с ошибками.
   Возврат: 3 / 7 / 21 / 60.

---

# Юнит 9. Unusual stories · с. 86

Цели юнита: неправильные глаголы, рассказ о воспоминании, отрицание и вопрос в
прошедшем, устойчивые глагольные сочетания, `ago`, погода, отзыв о событии.

### 9.1 Happy memories · с. 86 · 🟢 `a1-b7-l3`

**Книга:** grammar `past simple irregular verbs` · lexis adjective + noun
phrases (2).
**Can do (uz):** *Ko'p ishlatiladigan noto'g'ri fe'llarni o'tgan zamonda
ishlatasiz.*

1. **Вход.** `8.2`: правильные глаголы и правило `-ed`.
2. **Правило.** (а) У части глаголов вторая форма своя и `-ed` к ней не
   добавляется: `go → went`, `see → saw`, `have → had`, `do → did`,
   `make → made`, `take → took`, `get → got`, `come → came`.
   (б) Списком не выучить — учим группами по типу изменения гласной:
   `drink → drank`, `sing → sang`, `swim → swam`.
   (в) Форма одна для всех лиц. (г) 20 самых частых глаголов покрывают
   большинство бытовой речи; остальные добираются на A2.
3. **Ошибки.** `I goed to the park` → `-ed` к неправильному глаголу.
   `I have went` → смешение со временем, которого на A1 ещё нет.
   `He taked my book` → `took`. `I did my homework` в значении «я делал» и
   `did` как вспомогательный — путаница ролей одного слова.
4. **Слова.** 12 глаголов парами: `go/went, see/saw, have/had, do/did,
   make/made, take/took, get/got, come/came, eat/ate, drink/drank,
   write/wrote, buy/bought`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3, ступень 5 ×2 (`goed`, `taked`),
   ступень 6 ×3 («Кеча бозорга бордим»), ступень 4 ×2.
6. **Выход** (ступень 7). *Esda qolgan bir kun haqida hikoya yozing: 6 gap,
   kamida to'rtta noto'g'ri fe'l.*
7. **Навык — аудирование.** Рассказ 40 секунд, выписать все глаголы прошедшего
   времени. Возврат: 3 / 7 / 21 / 60.

### 9.2 A good excuse · с. 88 · 🟢 `a1-b7-l4`

**Книга:** grammar `past simple negatives and questions` · lexis verb phrases
(1) · pronunciation sentence stress · listening words that sound the same.
**Can do (uz):** *O'tmish haqida savol berasiz va inkor qilasiz.*

1. **Вход.** `8.2`, `9.1`: обе группы глаголов в утверждении.
2. **Правило.** (а) Отрицание и вопрос строятся через `did`, одинаково для всех
   лиц: `Did you go?`, `I didn't go`. (б) Главное: после `did` глагол
   возвращается в начальную форму — `Did you went` невозможно.
   (в) Короткий ответ: `Yes, I did. / No, I didn't.` (г) `be` в прошедшем `did`
   не берёт: `Were you there?`, не `Did you be there?`
3. **Ошибки.** `Did you went to school?` → двойное прошедшее.
   `I didn't went` → то же в отрицании. `You went yesterday?` → вопрос
   интонацией. `Did you were at home?` → `did` при `be`.
4. **Слова.** 12: `excuse, late, miss, forget, lose, break, fall, hurt,
   arrive, leave, catch, wait`.
5. **Практика.** Ступень 3 ×4 (утверждение → вопрос → отрицание),
   ступень 5 ×3 (`did + went`), ступень 6 ×2, ступень 7 ×1. Подмешать 30% из
   `9.1` — это второй урок блока.
6. **Выход** (ступень 7). *Kechikkaningiz uchun uzr yozing: nima bo'ldi, nega
   kechikdingiz. Ikkita inkor va bitta savol bo'lsin.*
7. **Навык — письмо.** Пять пар «вопрос о прошлых выходных — короткий ответ».
   Возврат: 3 / 7 / 21 / 60.

### 9.3 News stories · с. 90 · 🔴 темы нет

**Книга:** grammar `ago` · lexis words from context · pronunciation word stress
in two-syllable words · reading guessing meaning from context.
**Can do (uz):** *Voqea qachon bo'lganini aytasiz.*

1. **Вход.** `9.1`, `9.2`: Past Simple целиком.
2. **Правило.** (а) `ago` стоит **после** отрезка времени и означает отсчёт от
   сегодня назад: `three days ago`. (б) Предлога не нужно: не `before three
   days` и не `in three days ago`. (в) `ago` работает только с Past Simple.
   (г) Отличать от `before`: `before` — раньше другого события, `ago` — раньше
   сейчас. (д) Вопрос: `When did it happen?` / `How long ago?`
3. **Ошибки.** `Before three days I saw him` → калька с «уч кун олдин».
   `Three days before` в значении «три дня назад». `I have seen him two days
   ago` → `ago` не сочетается с перфектом. `Ago three days` → порядок.
4. **Слова.** 12: `ago, last, recently, news, happen, story, accident,
   find, lose, win, meet, decide`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (дата → `… ago`), ступень 5 ×3
   (`before` вместо `ago`), ступень 6 ×2 («Уни икки ҳафта олдин кўрдим»).
6. **Выход** (ступень 6). *Beshta voqea yozing va har birida `ago` bilan qachon
   bo'lganini ayting.*
7. **Навык — речь.** Пересказать вслух короткую новость: что случилось и когда.
   Возврат: 3 / 7 / 21 / 60.

**Что делать:** `ago` у нас нет отдельной темой, а `before three days` — ошибка,
которую делают почти все узбекоязычные и почти никто не исправляет сам.

### 9.4 Speaking and writing · с. 92 · 🟡 частично `a1-b6-l3`

**Книга:** speaking the weather · writing a review of an event.
**Can do (uz):** *Ob-havo haqida gapirasiz va tadbir haqida sharh yozasiz.*

1. **Вход.** Юнит 9: прошедшее целиком. `6.1`: `there is/are`.
2. **Правило.** (а) Погода через безличное `it`: `It's hot`, `It's raining` —
   подлежащее обязательно, хотя в узбекском его нет. (б) Прилагательное или
   глагол: `It's sunny` / `The sun is shining`. (в) В прошедшем: `It was cold`,
   `It rained`. (г) Отзыв о событии: что было → впечатление → рекомендация.
3. **Ошибки.** `Today is cold` → допустимо, но безличное `It's cold`
   естественнее и учить нужно его. `Is raining` → пропущено `it`.
   `The weather is very good today, isn't it` без вопросительного знака —
   формула small talk. `It was very nice event` → артикль: `a very nice event`.
4. **Слова.** 12: `weather, hot, cold, warm, cool, sunny, cloudy, rainy, windy,
   snow, degrees, forecast`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×2 (настоящее → прошедшее),
   ступень 5 ×2 (пропущенное `it`), ступень 4 ×2, ступень 7 ×2.
6. **Выход** (ступень 7). *Borgan tadbiringiz haqida sharh yozing: qachon bo'ldi,
   ob-havo qanday edi, nima yoqdi. 6 gap, o'tgan zamonda.*
7. **Навык — грамматический разбор.** Юнит целиком: неправильные глаголы + `did`
   + `ago`, пять предложений с ошибками. Возврат: 3 / 7 / 21 / 60.

---

# Юнит 10. New places, new projects · с. 96

Цели юнита: `going to` для планов, рассказ о проекте, вопросы с `going to`,
перемены в жизни, `would like`, кафе, заказ еды, приглашение и благодарность.

### 10.1 We're going to raise £5,000 · с. 96 · 🟡 у нас на A2 (`a2-b5-l1`)

**Книга:** grammar `going to positive and negative` · lexis future time
expressions, verb phrases (2) · pronunciation `going to` · reading identifying
the subject.
**Can do (uz):** *Rejalaringizni aytasiz.*

1. **Вход.** Юнит 1 (`be` в настоящем), `7.3` (форма `-ing`).
2. **Правило.** (а) Конструкция: `be` + `going to` + начальная форма —
   `I'm going to study`. Меняется только `be`. (б) Смысл: заранее принятое
   решение или очевидное будущее. (в) Отрицание через `be`:
   `I'm not going to …`. (г) В речи стягивается до /ˈɡənə/ — узнавать на слух
   надо, писать так нельзя.
3. **Ошибки.** `I going to study` → пропущена связка. `I'm going to studying` →
   после `to` начальная форма. `He is going to be work` → лишнее `be`.
   `I'm going to shop` в значении «собираюсь в магазин» → это «собираюсь
   покупать»; для движения нужно `I'm going to the shop`.
4. **Слова.** 12: `plan, project, raise, save, move, build, next week, next
   year, tomorrow, soon, tonight, in future`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (настоящее → план), ступень 5 ×3,
   ступень 6 ×2 («Эртага дўконга бормоқчиман»), ступень 4 ×2.
6. **Выход** (ступень 6). *Kelasi yil uchun beshta reja yozing: uchtasi ijobiy,
   ikkitasi inkorda.*
7. **Навык — аудирование.** Рассказ 40 секунд о планах, отметить, что человек
   собирается и что не собирается делать. Возврат: 3 / 7 / 21 / 60.

**Что делать:** `going to` у нас стоит на A2 (`a2-b5-l1`), а книга даёт его в
конце A1. Это не ошибка, а решение: наш A1 закрывается прошедшим временем. Но
стоит знать, что человек, пришедший с Navigate, будущее время уже видел.

### 10.2 A new life · с. 98 · 🟡 у нас на A2 (`a2-b5-l1`)

**Книга:** grammar `going to questions and short answers` · lexis verb phrases
(2), prepositions of time.
**Can do (uz):** *Rejalar haqida savol berasiz.*

1. **Вход.** `10.1`: `going to` в утверждении и отрицании.
2. **Правило.** (а) Вопрос перестановкой `be`: `Are you going to move?` —
   `do` не нужен. (б) Короткий ответ через `be`: `Yes, I am. / No, I'm not.`
   (в) Wh-вопрос: `What are you going to do?` (г) Предлоги времени в планах:
   `on Monday`, `in July`, `at 6`, но `next week` — без предлога вообще.
3. **Ошибки.** `Do you going to move?` → два вспомогательных.
   `Yes, I do.` → короткий ответ строится из `be`. `In next week` → лишний
   предлог. `What you are going to do?` → порядок в Wh-вопросе.
4. **Слова.** 12: `move, change, leave, start, join, apply, on Monday, in July,
   at six, next week, this weekend, later`.
5. **Практика.** Ступень 3 ×3 (утверждение → вопрос), ступень 5 ×3,
   ступень 4 ×2, ступень 7 ×2. Подмешать 20% из `10.1`.
6. **Выход** (ступень 7). *Do'stingiz boshqa shaharga ko'chyapti. Unga beshta
   savol yozing va javoblarini ham yozing.*
7. **Навык — письмо.** Пять вопросов о планах на лето и свои ответы.
   Возврат: 3 / 7 / 21 / 60.

### 10.3 Cafe cities · с. 100 · 🟢 `a1-b5-l4`, `a1-b6-l2`

**Книга:** grammar `would like` · lexis cafe food · pronunciation silent letters ·
listening identifying words in connected speech.
**Can do (uz):** *Kafeda odob bilan buyurtma berasiz.*

1. **Вход.** `7.3` (`like`), юнит 1 (`be`).
2. **Правило.** (а) `would like` = вежливое «хочу»: `I'd like a coffee`.
   (б) Стягивается всегда: `I'd`, `he'd`. (в) Перед глаголом идёт `to`:
   `I'd like to order` — в отличие от `like + -ing`. Это главный контраст урока.
   (г) `Would you like …?` — предложение, а не вопрос о желании вообще; ответ
   `Yes, please` / `No, thank you`, а не `Yes, I would`.
3. **Ошибки.** `I would like a coffee, please` — верно; `I want coffee` —
   грамматически верно, но в кафе звучит требовательно.
   `I'd like to coffee` → `to` только перед глаголом.
   `I'd like drinking tea` → после `would like` нужна форма с `to`.
   `Do you would like tea?` → вспомогательный лишний.
4. **Слова.** 12: `coffee, tea, juice, sandwich, cake, soup, salad, water,
   bill, menu, order, waiter`.
5. **Практика.** Ступень 2 ×2, ступень 3 ×3 (`I want` → `I'd like`;
   `like + -ing` ↔ `would like to`), ступень 5 ×3, ступень 6 ×2, ступень 8 ×1.
6. **Выход** (ступень 7). *Kafeda buyurtma dialogini yozing: salomlashuv,
   uchta buyurtma, hisob so'rash. 8 replika.*
7. **Навык — речь.** Разыграть заказ в кафе голосом, роль официанта у ИИ.
   Возврат: 3 / 7 / 21 / 60.

### 10.4 Speaking and writing · с. 102 · 🟡 частично `a1-b5-l4`

**Книга:** speaking ordering food and drink · writing invitations and thank-you
notes.
**Can do (uz):** *Ovqat buyurtma qilasiz, taklif va minnatdorchilik yozasiz.*

1. **Вход.** `10.3`: `would like`. Юнит 3: обиходные фразы.
2. **Фразы вместо правила.** Заказ: `Can I have …, please?`,
   `I'd like …`, `Anything else?`, `Could we have the bill, please?`.
   Приглашение: повод → время и место → просьба ответить (`Let me know`).
   Благодарность: за что → впечатление → пожелание.
3. **Ошибки.** `Bring me the bill` → без смягчения. `Thanks for your invite` →
   `invitation`, существительное. `I will come at your party` → `to your
   party`. `Thank you for everything you did for me` в короткой записке —
   регистр слишком тяжёлый.
4. **Слова.** 12: `invitation, invite, party, celebrate, join, bring, thank,
   lovely, present, hope, let me know, look forward`.
5. **Практика.** Ступень 3 ×2, ступень 4 ×2, ступень 5 ×2 (регистр),
   ступень 7 ×4 (заказ; приглашение; ответ на приглашение; благодарность).
6. **Выход** (ступень 7). *Tug'ilgan kuningizga taklifnoma yozing, keyin do'st
   nomidan minnatdorchilik javobini yozing. Ikkalasi ham 4–5 gap.*
7. **Навык — грамматический разбор.** Итог уровня: `going to` + `would like` +
   всё прошедшее, восемь предложений с ошибками из разных юнитов.
   Возврат: 3 / 7 / 21 / 60.

---

# Что показала сверка

## Девять тем, которых у нас нет

| Тема книги | Чего не хватает | Куда добавить | Важность |
|---|---|---|---|
| 7.3 `like + -ing` | первая конструкция с герундием; без неё весь уровень звучит `I like read` | новый урок в `a1-b6` | высокая |
| 8.3 object pronouns | `me, him, her, us, them` — базовая таблица, в речи нужна постоянно | новый урок в `a1-b7` | высокая |
| 5.2 Wh- questions в Present Simple | у нас есть вопросы с `be` и `Do/Does`, а Wh- нет | новый урок в `a1-b3` | высокая |
| 9.3 `ago` | `before three days` — ошибка почти у всех | добавить в `a1-b7` | средняя |
| 7.2 adverbs of manner | `He speaks English good` живёт до B1 | добавить к `a1-b6-l1` | средняя |
| 6.3 `each` / `all the` + мебель | жильё в программе не встречается вообще | новый блок или `a1-b4` | средняя |
| 1.4 hello/goodbye + анкета | первое, что человек говорит вслух | новый урок в `a1-b1` | средняя |
| 3.4 обиходные реакции + сообщение | `Really?`, `Congratulations` — этим речь оживает | новый урок в `a1-b2` | низкая |
| 6.4 / 7.4 / 8.4 жанры письма | жалоба, отзыв, пост, биография | навыковые задания | низкая |

## Одиннадцать свёрнутых тем

Тема в программе есть, но живёт внутри соседнего урока и отдельного прохода не
получает. По книге на каждую отводится полный урок:

- **2.2** третье лицо `be` — внутри `a1-b1-l1`;
- **3.2** вопросы и отрицания `have got` — внутри `a1-b2-l1`;
- **4.2** отрицание Present Simple — слито с вопросом в `a1-b3-l4`;
- **5.3** Present Simple сборкой всех форм — урока-сборки нет;
- **6.2** `Is there…?` — внутри `a1-b4-l1`;
- **7.2** `Can you…?` — внутри `a1-b6-l1`;
- **2.4 / 4.4 / 5.4 / 9.4 / 10.4** функциональные уроки — разобраны по
  грамматическим.

Общая закономерность: **мы систематически сливаем утверждение, отрицание и
вопрос в один урок, а книга даёт им три.** Наш вариант короче, но именно на
границе форм рождаются `doesn't works`, `Did you went`, `Do you can` — ошибки,
которые потом не уходят. Это главный вывод сверки.

## Что делать дальше

1. Дописать три темы высокой важности: `like + -ing`, объектные местоимения,
   Wh-вопросы. Это три новых файла в `data/lessons/` по формату
   [`a1-b1-l1.json`](../data/lessons/a1-b1-l1.json).
2. Разделить `a1-b3-l4` на отрицание и вопрос — по книге это два урока.
3. Добавить `ago` и наречия образа действия в существующие уроки блоков 6–7.
4. Решить по `going to`: оставляем на A2 или подтягиваем в конец A1. Книга
   ставит его в A1; наш A1 закрывается прошедшим. Решение осознанное, но должно
   быть записано.
5. Функциональные уроки (X.4) — отдельная задача: у нас нет ни одного урока без
   грамматики, а в книге их десять из сорока. Они дают речевые формулы, которых
   грамматикой не заменить.

Что менять **не** нужно: порядок блоков. Наша последовательность (знакомство →
семья → день → город → еда → умения → прошлое) совпала с книжной по логике
почти полностью, разошлась только раскладка по урокам. Порядок калиброван —
это и было целью сверки.
