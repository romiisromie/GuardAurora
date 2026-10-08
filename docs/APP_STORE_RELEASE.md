# Подготовка GuardAurora к App Store

Документ фиксирует текущую конфигурацию и готовые значения для создания карточки приложения. Карточка App Store Connect ещё не существует; Apple Developer enrollment и загрузка сборки остаются действиями владельца аккаунта.

## Уже подготовлено в проекте

- Название приложения: `GuardAurora`; версия исходников: `1.0.0`.
- iOS Bundle ID: `com.guardaurora.app`. Зафиксируйте его при создании App ID и карточки: после загрузки первой сборки Bundle ID менять нельзя.
- EAS project ID уже подключён: `fae08a2d-7242-49e3-b95d-eaddd915629c`.
- EAS production profile создаёт store distribution и автоматически увеличивает build number.
- Публичные страницы: [Политика конфиденциальности](https://guard-aurora.vercel.app/privacy), [Поддержка](https://guard-aurora.vercel.app/support). Обе доступны на русском, казахском и английском.
- EAS-переменные URL и адрес поддержки имеют defaults в `app.config.js`; Sentry DSN по умолчанию пуст.
- iPad выключен (`supportsTablet: false`); App Store скриншоты нужны для iPhone.
- Системные запросы микрофона и геолокации переведены отдельно для русского, казахского и английского языков в `locales/`.
- Приложение не имеет аккаунтов. SOS только записывает локальное событие: не звонит службам и не отправляет сообщения автоматически.

## До оплаты Apple Developer

1. Решите, под каким именем приложение должно продаваться. Для индивидуального членства Apple показывает личное юридическое имя владельца как продавца. Если нужен продавец-бренд, сначала потребуется подходящая зарегистрированная организация и enrollment организации.
2. Подготовьте Apple Account с включённой двухфакторной аутентификацией; при enrollment вводите юридическое имя точно как в документах. Членство Apple Developer Program указано Apple как 99 USD за год; валюта/налоги на оплате могут зависеть от региона.
3. Сверьте, что `com.guardaurora.app` свободен и подходит как окончательный ID до создания App ID. Этот идентификатор выбран в `app.json`.
4. Подготовьте iPhone для проверки приложения. Веб Preview не заменяет проверку разрешений, поведения микрофона, GPS, звонка/SMS и остановки SOS на настоящем iOS.

## После активации членства

1. В Apple Developer создайте Explicit App ID `com.guardaurora.app`.
2. В App Store Connect примите актуальные agreements и создайте приложение: платформа iOS, имя `GuardAurora`, основной язык Russian, Bundle ID `com.guardaurora.app`, SKU `GUARDAURORA-IOS-001`.
3. Запишите выданный Apple ID приложения (числовой `ascAppId`) и Apple Team ID. Добавьте `ascAppId` в `eas.json` только после создания записи. Team ID и App Store Connect API key не коммитьте; секреты храните в EAS credentials/secrets.
4. В App Store Connect добавьте App Privacy URL `https://guard-aurora.vercel.app/privacy`, Support URL `https://guard-aurora.vercel.app/support`; подтвердите контакт `romiisromie@gmail.com`.
5. Заполните App Privacy по фактическому release build. Контакты, записи и координаты остаются на устройстве; сторонним Maps/Phone/Messages они передаются только по выбору пользователя. Не указывайте «Data Not Collected», пока не сверили весь release build и встроенные SDK. При пустом `SENTRY_DSN` отправка Sentry отключена; если DSN будет добавлен, политику и декларацию App Privacy надо обновить. Если на Vercel задан `GROQ_API_KEY`, ИИ-чат по согласию пользователя отправляет текст сообщений в ИИ-сервис Groq: в App Privacy укажите **User Content → Other User Content**, цель **App Functionality**, не связано с личностью, без отслеживания. Apple требует явного согласия перед передачей данных стороннему ИИ (guideline 5.1.2) — оно реализовано карточкой в чате и переключателем в разделе «Право».
6. Заполните age-rating questionnaire правдиво. «13+» — целевая аудитория владельца, а не готовая оценка Apple: Apple рассчитывает рейтинг по ответам; при необходимости можно выбрать более высокий override. В анкете отвечайте с учётом ИИ-чата: если есть вопросы о чат-ботах, генеративном ИИ или контенте, который создаётся без ручной модерации, — ответ «да» (ответы ИИ генерируются автоматически). Темы насилия и угроз в приложении обсуждаются только в контексте безопасности, без изображений.
7. Загрузите минимум один настоящий скриншот iPhone для актуального 6.9-inch display. Текущие допустимые размеры включают 1320×2868, 1290×2796 и 1260×2736 px (портрет), в зависимости от поддерживаемого устройства. Скриншоты следует снять с релизного iOS-приложения, а не с веб-сайта; не изображайте несуществующие функции.
8. Пройдите на iPhone весь release checklist ниже, затем соберите и загрузите production `.ipa` в TestFlight. Сначала проверьте TestFlight, после этого отправьте версию на App Review.

## Черновик карточки App Store (Russian)

Поля приложения могут иметь отдельные лимиты длины. Имя и subtitle ограничены 30 символами каждый; promotional text — 170; description — 4000; keywords — 100 bytes. Черновик ниже не обещает автоматическую защиту или вызов экстренных служб.

**Name**

`GuardAurora`

**Subtitle**

`SOS, контакты и ИИ-помощник`

**Promotional text**

`Большая кнопка SOS, звонок близким в одно касание, координаты по запросу и ИИ-помощник, который подскажет, что делать. Без регистрации.`

**Description**

```text
GuardAurora — помощник для личной безопасности: всё важное на одном экране.

• Кнопка SOS с отменяемым трёхсекундным отсчётом отмечает событие в журнале на устройстве.
• Тихий SOS: при включённом мониторинге три встряхивания телефона отмечают событие с коротким виброоткликом.
• Звонок доверенным людям в одно касание прямо с главного экрана.
• SMS близкому человеку с готовым текстом и ссылкой на ваше местоположение — вы проверяете и отправляете его сами.
• Координаты по запросу и открытие их в приложении карт.
• ИИ-помощник во вкладке «Помощь» подскажет, что делать в вашей ситуации. Включается только с вашего согласия; без него чат отвечает готовыми офлайн-ответами.
• Интерфейс на русском, казахском и английском.

Важно: GuardAurora не вызывает экстренные службы и не отправляет сообщения автоматически. В опасности звоните 112 или в местную экстренную службу.

Без регистрации. Контакты, координаты и журнал хранятся только на устройстве. Если вы включили ИИ-помощника, в ИИ-сервис отправляется только текст сообщений чата.
```

**Keywords** (100 bytes max; Cyrillic letters take 2 bytes; words from the name and subtitle are indexed already)

`безопасность,тревога,112,геолокация,помощь,защита`

**Primary category draft**

Utilities. Перепроверьте категорию по актуальным категориям App Store перед отправкой.

**Copyright draft**

`© 2026 Ramina Ibraimova`

## Draft App Store text (English localization)

**Name:** `GuardAurora`

**Subtitle:** `SOS, quick call & AI help`

**Promotional text:** `A big SOS button, one-tap calls to people you trust, your location on demand and an AI assistant that suggests what to do. No account needed.`

**Description:**

```text
GuardAurora is a personal-safety companion that keeps what matters on one screen.

• An SOS button with a cancellable 3-second countdown records the event in your on-device log.
• Silent SOS: with monitoring on, three shakes of the phone record an event with a short haptic confirmation.
• Call the people you trust with one tap right from the home screen.
• Text a trusted person a prepared message with a link to your location — you review and send it yourself.
• Get your coordinates on demand and open them in a maps app.
• The AI assistant in the Help tab suggests what to do in your situation. It is turned on only with your consent; otherwise the chat uses prepared offline answers.
• Available in English, Russian and Kazakh.

Important: GuardAurora does not contact emergency services or send messages automatically. If you are in danger, call 112 or your local emergency number.

No account required. Contacts, coordinates and the activity log stay on your device. If you turn on the AI assistant, only the text of your chat messages is sent to the AI service.
```

**Keywords:** `safety,emergency,panic,alarm,trusted contacts,location,shake,personal safety,112`

## App Review notes draft

```text
GuardAurora has no sign-in or demo account; everything works without registration.

- SOS: tap the red button on the Safety tab; a 3-second countdown can be cancelled. SOS only records an event in the on-device log. It does NOT call emergency services or message anyone.
- Silent SOS: tap "Start monitoring", then shake the phone firmly three times within about 2 seconds; a haptic tap confirms the event.
- Microphone: used only while monitoring is on and the app is in the foreground, to show the overall sound level. Audio is not recognized, stored or sent.
- Location: requested only when the user taps "Update location" on the Map tab; if already granted, starting SOS takes one reading for the local SOS entry. No background tracking.
- Calls and SMS open the system Phone/Messages apps; the user sends the message.
- AI assistant (Help tab): optional. It is used only after the user taps "Allow AI" and can be turned off in the Privacy tab. Only the chat text is sent, via our server, to the Groq API; contacts, location and the log are never sent. Without consent the chat uses prepared offline answers. Try: "Someone is following me, what should I do?"
```

## Release checklist

- [ ] Apple Developer membership active; Account Holder agreements accepted.
- [ ] Explicit App ID and App Store Connect app record use `com.guardaurora.app`.
- [ ] `ascAppId` recorded and EAS submit profile updated.
- [ ] Store listing, support and privacy URLs saved.
- [ ] App Privacy and age-rating answers verified against the exact release binary and SDKs.
- [ ] Privacy manifests/export compliance questions reviewed in App Store Connect.
- [ ] Native screenshots captured at an accepted iPhone size; app icon and splash checked on device.
- [ ] iPhone checks: fresh install, offline use, allow/deny mic and location, start/stop monitoring, background stop, SOS cancel, contact call/SMS, deletion, relaunch/data persistence, RU/KK/EN language switching.
- [ ] Production EAS build completed; TestFlight processing and install checked.
- [ ] App Review notes included; version submitted only after all metadata and screenshots are complete.
- [ ] Проверить на самом iPhone, что тексты запросов микрофона и геолокации совпадают с языком системы.

## Commands after enrollment

```sh
npx eas-cli login
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

Add the App Store Connect app ID to `eas.json` after creating the app record. EAS upload sends the build to App Store Connect/TestFlight; the owner still completes metadata, testing, and App Review submission in App Store Connect.
