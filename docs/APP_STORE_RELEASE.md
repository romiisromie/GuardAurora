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
5. Заполните App Privacy по фактическому release build. Контакты, записи и координаты остаются на устройстве; сторонним Maps/Phone/Messages они передаются только по выбору пользователя. Не указывайте «Data Not Collected», пока не сверили весь release build и встроенные SDK. При пустом `SENTRY_DSN` отправка Sentry отключена; если DSN будет добавлен, политику и декларацию App Privacy надо обновить. Если на Vercel задан `GEMINI_API_KEY`, ИИ-чат по согласию пользователя отправляет текст сообщений в Google Gemini: в App Privacy укажите **User Content → Other User Content**, цель **App Functionality**, не связано с личностью, без отслеживания. Apple требует явного согласия перед передачей данных стороннему ИИ (guideline 5.1.2) — оно реализовано карточкой в чате и переключателем в разделе «Право».
6. Заполните age-rating questionnaire правдиво. «13+» — целевая аудитория владельца, а не готовая оценка Apple: Apple рассчитывает рейтинг по ответам; при необходимости можно выбрать более высокий override.
7. Загрузите минимум один настоящий скриншот iPhone для актуального 6.9-inch display. Текущие допустимые размеры включают 1320×2868, 1290×2796 и 1260×2736 px (портрет), в зависимости от поддерживаемого устройства. Скриншоты следует снять с релизного iOS-приложения, а не с веб-сайта; не изображайте несуществующие функции.
8. Пройдите на iPhone весь release checklist ниже, затем соберите и загрузите production `.ipa` в TestFlight. Сначала проверьте TestFlight, после этого отправьте версию на App Review.

## Черновик карточки App Store (Russian)

Поля приложения могут иметь отдельные лимиты длины. Имя и subtitle ограничены 30 символами каждый; promotional text — 170; description — 4000; keywords — 100 bytes. Черновик ниже не обещает автоматическую защиту или вызов экстренных служб.

**Name**

`GuardAurora`

**Subtitle**

`Личная безопасность офлайн`

**Promotional text**

`Контакты, координаты по запросу и локальный журнал событий — под рукой. Без регистрации и облачного хранения.`

**Description**

```text
GuardAurora — офлайн-инструмент, который помогает держать важные контакты и действия под рукой.

• Сохраняйте доверенные контакты на устройстве.
• Отмечайте событие SOS и просматривайте локальный журнал.
• Запрашивайте координаты вручную и при желании открывайте их в приложении карт.
• Запускайте звонок или подготовьте SMS выбранному контакту, проверив сообщение перед отправкой.
• При включённом мониторинге измеряйте общий уровень звука на устройстве.
• Удаляйте локальные контакты и журнал в приложении.

GuardAurora не вызывает экстренные службы, не отправляет SOS автоматически и не определяет угрозы по звуку. Измерение звука не распознаёт речь или события. Приложение не заменяет экстренную помощь.

Учётная запись не требуется. Контакты, координаты и записи хранятся локально на устройстве. Для звонков, SMS и открытия карт используется выбранное вами системное приложение.
```

**Keywords**

`безопасность,личная защита,SOS,контакты,координаты,помощь,журнал`

**Primary category draft**

Utilities. Перепроверьте категорию по актуальным категориям App Store перед отправкой.

**Copyright draft**

`© 2026 Ramina Ibraimova`

## Draft App Store text (English localization)

**Name:** `GuardAurora`

**Subtitle:** `Offline personal safety`

**Promotional text:** `Keep trusted contacts, on-demand location, and a local incident log close at hand. No account or cloud storage.`

**Description:**

```text
GuardAurora is an offline companion for keeping trusted contacts and useful actions close at hand.

• Keep trusted contacts on your device.
• Record an SOS event and review your on-device activity log.
• Request your location when you choose, then optionally open it in a maps app.
• Start a call or prepare an SMS to a trusted person; review the message before sending.
• When monitoring is on, measure overall sound level on your device.
• Delete local contacts and activity from the app.

GuardAurora does not contact emergency services, send SOS messages automatically, or identify threats from sound. Sound measurement does not recognize speech or events. The app is not a replacement for emergency help.

No account is required. Contacts, coordinates, and activity entries are stored on your device. Calls, SMS, and maps open in the system app you choose.
```

**Keywords:** `safety,personal safety,SOS,contacts,location,offline,incident log`

## App Review notes draft

```text
GuardAurora has no sign-in or demo account. Core features work offline. The Help tab offers an optional AI assistant (Google Gemini via our server): it is used only after the user taps "Allow AI" in the chat and can be turned off in the Privacy tab; only chat text is sent, never contacts, location, or the activity log. Without consent the chat uses prepared offline answers. To review microphone behavior, open the app and manually enable monitoring; the app measures overall sound level only and stops when the app moves to the background. Location permission is requested only after the user taps the location control; if it was already granted, starting SOS takes one location reading for the local SOS entry (no background tracking). SOS records a local event only; it does not call emergency services or send a message. Calls and SMS are user-initiated, and SMS requires user confirmation. Local data deletion is available under Privacy & Legal.
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
