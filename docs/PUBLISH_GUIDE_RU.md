# GuardAurora → App Store: пошаговая инструкция

Mac не нужен: всё делается в браузере и в терминале Windows. Приложение собирается в облаке Expo (EAS Build).
Тексты для копирования лежат в [APP_STORE_RELEASE.md](APP_STORE_RELEASE.md), скриншоты — в папке `store-screenshots/` (ru и en).

Отмечай пункты по ходу: `[ ]` → `[x]`.

---

## Шаг 0. Проверить до оплаты (10 минут)

- [ ] **Apple ID** открывается на [account.apple.com](https://account.apple.com), в «Вход и безопасность» включена **двухфакторная аутентификация**.
- [ ] Имя и фамилия в Apple ID — **настоящие, латиницей, как в паспорте**. Они будут видны в App Store как «продавец».
- [ ] Владельцу аккаунта **18 лет или больше**. Если нет — аккаунт оформляет взрослый (например, родитель) на своё имя и свой Apple ID.
- [ ] Карта **Visa или Mastercard**, в приложении банка включены **платежи в иностранных интернет-магазинах**. На счету ≈ 50 000 ₸ ($99 + курс и комиссия).
- [ ] Под рукой телефон или номер, куда приходят коды Apple.

---

## Шаг 1. Оплатить Apple Developer Program (15 минут + ожидание)

1. Открой **https://developer.apple.com/programs/enroll** → кнопка **Start your enrollment**.
2. Войди Apple ID → введи 6-значный код с телефона.
3. Заполни **Personal information**: имя, фамилия, телефон, адрес — латиницей, как в документах (пример адреса: `Abaya ave 10, apt 5`, город `Almaty`, индекс, страна `Kazakhstan`).
4. **Entity type** → выбери **Individual / Sole Proprietor**. (Не «Company» — там нужен номер D-U-N-S.)
5. Прочитай и прими **Apple Developer Program License Agreement** → Continue.
6. Проверь данные → **Purchase** → введи карту → оплати **99 USD / год**.
7. Жди письмо **«Welcome to the Apple Developer Program»** — от нескольких часов до 2 суток.
   - Если Apple попросит подтвердить личность (фото документа) — сделай по ссылке из письма.
   - Если оплата на сайте не проходит: скачай на iPhone приложение **Apple Developer** → вкладка Account → **Enroll Now** — там оплата идёт через App Store.

> Не оплачивай второй раз, если долго нет ответа: статус видно на https://developer.apple.com/account.

---

## Шаг 2. Зарегистрировать Bundle ID (5 минут, после активации)

1. https://developer.apple.com/account → **Certificates, IDs & Profiles** → слева **Identifiers** → синий **+**.
2. Выбери **App IDs** → Continue → **App** → Continue.
3. **Description:** `GuardAurora`
   **Bundle ID:** переключатель **Explicit** → `com.guardaurora.app`
4. Галочки Capabilities не трогай → **Continue** → **Register**.

> Bundle ID уже прописан в приложении. Изменить его после загрузки первой сборки нельзя.

---

## Шаг 3. Создать приложение в App Store Connect (10 минут)

1. Открой **https://appstoreconnect.apple.com** и войди тем же Apple ID.
2. Если сверху есть жёлтый баннер о соглашениях — нажми и прими.
3. Раздел **Business** (Соглашения): должно быть **Free Apps — Active**. Банк и налоги для бесплатного приложения не нужны.
4. **Apps** → синий **+** → **New App**:

   | Поле | Значение |
   |---|---|
   | Platforms | ☑ iOS |
   | Name | `GuardAurora` (если занято — `GuardAurora SOS`) |
   | Primary Language | **Russian** |
   | Bundle ID | `com.guardaurora.app` (выбрать из списка) |
   | SKU | `GUARDAURORA-IOS-001` |
   | User Access | **Full Access** |

5. **Create**. Запомни число **Apple ID** приложения (вкладка App Information) — пригодится на шаге 6.

---

## Шаг 4. Заполнить карточку (30–40 минут)

Все тексты копируй из [APP_STORE_RELEASE.md](APP_STORE_RELEASE.md).

### 4.1 App Information (слева)
- **Subtitle (Russian):** `SOS, контакты и ИИ-помощник`
- **Category → Primary:** `Utilities` (вторичная по желанию: `Lifestyle`)
- **Content Rights:** «Does your app contain, show, or access third-party content?» → **No**
- **Age Rating → Set Up / Edit:** отвечай честно. Насилие/страшные темы — **нет** (приложение их не показывает). На вопросы про чат-ботов / генеративный ИИ / неотмодерированный контент — **Yes**: в приложении есть ИИ-чат. Возраст Apple посчитает сам.

### 4.2 App Privacy (слева)
- **Privacy Policy URL:** `https://guard-aurora.vercel.app/privacy`
- **Get Started** → «Do you or your third-party partners collect data from this app?» → **Yes**
- Отметь только **User Content → Other User Content** (текст сообщений ИИ-чата).
- Для него: **App Functionality**; Linked to user — **No**; Used for tracking — **No**.
- Всё остальное (контакты, геолокация, журнал) **не отмечай**: эти данные не покидают телефон.
- **Publish**.

### 4.3 Pricing and Availability (слева)
- **Price:** `Free` (0)
- **Availability:** все страны или только нужные (например, Kazakhstan, Russia и др.).

### 4.4 Версия 1.0 → iOS App (слева, раздел «iOS App 1.0 Prepare for Submission»)
- **Screenshots → iPhone 6.9" Display:** перетащи 5 файлов из `store-screenshots/ru` по порядку 01 → 05.
  (6.5"/6.7" можно не загружать — Apple возьмёт 6.9".)
- **Promotional Text, Description, Keywords** — из документа (русский раздел).
- **Support URL:** `https://guard-aurora.vercel.app/support`
- **Marketing URL:** можно пусто.
- **Copyright:** `2026 <Твоё имя и фамилия латиницей>`
- **Build:** пока пусто — появится после шага 6.
- **App Review Information:**
  - Sign-in required — **снять галочку**
  - Contact: имя, телефон (с +7), email `romiisromie@gmail.com`
  - **Notes:** вставь английский текст «App Review notes» из документа.
- **Version Release:** `Automatically release this version` (выйдет сразу после одобрения).
- **Save** (вверху справа).

### 4.5 Английская версия (по желанию, но лучше сделать)
- Справа вверху выпадающий язык **Russian** → **Add Localization** → **English (U.S.)**.
- Вставь английские Subtitle / Promo / Description / Keywords, скриншоты из `store-screenshots/en`. **Save**.

---

## Шаг 5. Аккаунт Expo (5 минут)

1. Зарегистрируйся / войди на **https://expo.dev** (бесплатно).
   Важно: в проекте уже записан EAS project ID. Войти нужно **в тот же аккаунт Expo, в котором проект создавался** (обычно `romiisromie`). Проверить: https://expo.dev → Projects → там должен быть `guardaurora`.
2. В терминале в папке проекта (`C:\Users\marat\GuardAurora`):
   ```
   npx eas-cli login
   ```
   Введи логин/пароль Expo.
   ```
   npx eas-cli whoami
   ```
   Должно показать твой логин.

> Если проекта `guardaurora` в твоём аккаунте Expo нет — напиши Claude: он отвяжет старый project ID и привяжет к твоему аккаунту (`eas init`).

---

## Шаг 6. Собрать приложение в облаке (30–40 минут, из них 5 — твои действия)

```
npx eas-cli build --platform ios --profile production
```

На вопросы отвечай так:

| Вопрос | Ответ |
|---|---|
| Do you want to log in to your Apple account? | **Yes** |
| Apple ID | твой Apple ID |
| Password | пароль Apple ID (вводишь сам) |
| 2FA code | код с телефона / SMS |
| Select a Team | твоя команда (Individual) |
| Generate a new Apple Distribution Certificate? | **Yes** |
| Generate a new Apple Provisioning Profile? | **Yes** |
| Set up Push Notifications? | **No** |

Дальше сборка идёт в облаке 15–30 минут. Можно закрыть терминал — прогресс виден по ссылке, которую напишет EAS, и на expo.dev → Builds.
Итог: статус **Finished** и файл `.ipa`.

---

## Шаг 7. Загрузить сборку в App Store Connect (5 минут + 10–30 минут обработки)

```
npx eas-cli submit --platform ios --profile production
```

| Вопрос | Ответ |
|---|---|
| Select a build | последняя (Latest) |
| Apple ID / пароль / код | как на шаге 6 |
| ASC App ID | число Apple ID приложения из шага 3 (если спросит) |
| Generate App Store Connect API key? | **Yes** |

Через 10–30 минут придёт письмо «The following build has completed processing». Сборка появится в App Store Connect → **TestFlight**.

> По желанию: установи приложение **TestFlight** на iPhone и проверь сборку перед отправкой — так увидишь настоящую иконку и поведение.

---

## Шаг 8. Отправить на проверку (5 минут)

1. App Store Connect → GuardAurora → **iOS App 1.0**.
2. Раздел **Build** → **+ Add Build** → выбери загруженную сборку → Done.
   Вопрос про шифрование не появится: в приложении уже указано, что оно не используется.
3. Проверь, что везде нет красных предупреждений → **Save**.
4. Справа вверху **Add for Review** → **Submit to App Review**.
5. Статус станет **Waiting for Review** → **In Review** → **Ready for Distribution**. Обычно 1–3 дня. Письма придут на почту.

---

## Если Apple отклонит

Это нормально и чинится. Скопируй текст из **Resolution Center** и пришли Claude. Частые причины для таких приложений:

| Причина (guideline) | Что ответить / сделать |
|---|---|
| **4.2 Minimum Functionality** | Ответить в Resolution Center, что приложение даёт SOS-журнал, тихий SOS, звонок в одно касание, SMS с координатами, ИИ-помощника; при необходимости — добавить функцию. |
| **5.1.1 / 5.1.2 Data & AI** | Показать, что ИИ включается только после согласия и выключается в «Право»; политика по ссылке. |
| **2.1 App Completeness** | Обычно просят видео/пояснение работы — описание уже в Notes, можно добавить запись экрана. |
| **1.4.1 / заявления о безопасности** | Подчеркнуть, что приложение не вызывает службы и прямо говорит звонить 112. |

---

## Итог по времени

| Что | Сколько |
|---|---|
| Шаги 0–1 | 25 минут + до 2 дней ожидания Apple |
| Шаги 2–5 | ~1 час |
| Шаги 6–8 | ~1 час (большая часть — ожидание сборки) |
| Проверка Apple | 1–3 дня |
