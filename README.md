<p align="center">
  <img src="assets/guardaurora-icon.png" alt="GuardAurora" width="120" />
</p>

<h1 align="center">GuardAurora</h1>

<p align="center">
  Офлайн-приложение-компаньон для личной безопасности на Expo и React Native.<br/>
  <em>Privacy-first personal safety companion app built with Expo &amp; React Native.</em>
</p>

<p align="center">
  <a href="https://apps.apple.com/kz/app/guardaurora/id6828550040"><img alt="App Store" src="https://img.shields.io/badge/App%20Store-GuardAurora-0D96F6?logo=apple&logoColor=white" /></a>
  <a href="https://guard-aurora.vercel.app/"><img alt="Web demo" src="https://img.shields.io/badge/web-guard--aurora.vercel.app-000?logo=vercel" /></a>
  <a href="https://github.com/romiisromie/GuardAurora/releases"><img alt="Release" src="https://img.shields.io/github/v/release/romiisromie/GuardAurora" /></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <img alt="Expo SDK 54" src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo" />
  <img alt="React Native 0.81" src="https://img.shields.io/badge/React%20Native-0.81-61dafb?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
</p>

<p align="center">
  <a href="https://apps.apple.com/kz/app/guardaurora/id6828550040"><strong>App Store</strong></a> ·
  <a href="https://guard-aurora.vercel.app/">Веб-версия</a> ·
  <a href="https://guard-aurora.vercel.app/privacy">Политика конфиденциальности</a> ·
  <a href="https://guard-aurora.vercel.app/support">Поддержка</a> ·
  <a href="docs/APP_STORE_RELEASE.md">Release guide</a>
</p>

> [!IMPORTANT]
> GuardAurora **не заменяет** экстренные службы и ничего не отправляет сам. После SOS звонок 112 и SMS близким открываются в одно касание, но звонит и отправляет сообщение сам пользователь. В опасной ситуации звоните 112 или в местную экстренную службу.

## Где скачать

- **iPhone** — [GuardAurora в App Store](https://apps.apple.com/kz/app/guardaurora/id6828550040) (iOS 15.1+, бесплатно, 13+).
- **Браузер** — [guard-aurora.vercel.app](https://guard-aurora.vercel.app/): предпросмотр без установки. Датчики и разрешения в браузере работают не так, как на телефоне.
- **Android** — сборка готовится, в Google Play приложения пока нет.

## Возможности

| Функция | Как работает |
| --- | --- |
| 🆘 **SOS** | Отменяемый трёхсекундный отсчёт. После него — кнопки «Позвонить 112», «Написать близким, где я» и звонок первому контакту. Событие записывается в журнал на устройстве; если доступ к геолокации уже есть, координаты определяются один раз. |
| 👥 **Доверенные контакты** | Контакты и до 50 событий SOS хранятся только на устройстве. |
| 📞 **Звонок и SMS** | Звонок контакту в одно касание с главного экрана. SMS всем доверенным контактам с готовым текстом и ссылкой на место на карте — пользователь сам проверяет и отправляет его. |
| 📍 **Карта** | Координаты по нажатию, ссылка «где я» для близких и быстрый поиск ближайших полиции, больниц и аптек в Google Maps. |
| 🎙️ **Мониторинг звука** | Измеряет общий уровень громкости локально, пока мониторинг включён и приложение на экране. Аудио не сохраняется; распознавания звуков и опасности нет. |
| 📳 **Встряхивание** | При включённом мониторинге три быстрых встряхивания открытого приложения фиксируются как локальное событие SOS. |
| 💬 **Помощь** | Справка с заранее подготовленными офлайн-ответами. По желанию и после согласия пользователя можно включить ИИ-ответы через Groq (см. ниже). |
| 👋 **Первый запуск** | Три коротких подсказки: SOS, свои люди, тихий SOS. Можно пропустить, показываются один раз. |
| 🔒 **Конфиденциальность** | Политика конфиденциальности в приложении и функция удаления локальных данных. |
| 🌐 **Языки** | Қазақша, русский, English — по умолчанию выбирается язык устройства. |

**Чего в приложении нет:** учётных записей, облачной синхронизации, push-уведомлений, автоматического звонка или отправки сообщений, аналитики, встроенной карты и оценки маршрутов.

## Технологии

- [Expo SDK 54](https://docs.expo.dev/) · React Native 0.81 · React 19 · TypeScript
- React Navigation (нижние вкладки), AsyncStorage для локальных данных
- `expo-location`, `expo-av`, `expo-sensors`, `expo-haptics`
- Expo Web + Vercel для веб-версии и серверной функции чата (`api/chat.mjs`)
- EAS Build для сборок iOS и Android, опционально Sentry для отчётов об ошибках

## Быстрый старт

Нужны Node.js 20+ и приложение [Expo Go](https://expo.dev/go) на телефоне (или эмулятор).

```sh
npm ci
npm run typecheck
npx expo start
```

Отсканируйте QR-код из терминала: на iPhone — камерой, на Android — в Expo Go.

### Веб-сборка для Vercel

```sh
npm run build:web
```

Команда собирает Expo Web в `dist`. Веб-версия подходит для предварительного просмотра; разрешения браузера и доступ к датчикам отличаются от iOS и Android. Каждый push в `main` автоматически деплоится на Vercel — история доступна в разделе [Deployments](https://github.com/romiisromie/GuardAurora/deployments).

## Структура проекта

```
GuardAurora/
├── App.tsx                 # точка входа
├── app.json, app.config.js # конфигурация Expo
├── eas.json                # профили EAS Build
├── api/chat.mjs            # серверная функция ИИ-чата (Vercel)
├── locales/                # переводы: kk, ru, en
├── public/                 # страницы privacy и support
├── public-qr/              # публичная страница для QR-кода
├── scripts/                # подготовка веб-сборки
├── docs/                   # гайды по публикации в магазинах
└── src/
    ├── components/         # UI, онбординг, ErrorBoundary
    ├── hooks/              # звук, геолокация, встряхивание
    ├── lib/                # чат, SOS, диалоги, мониторинг
    ├── legal/              # текст политики конфиденциальности
    ├── navigation/         # нижние вкладки
    ├── screens/            # Home, Map, Chat, Contacts, History, Legal
    ├── store/              # глобальное состояние
    └── theme/              # цвета и отступы
```

## ИИ-помощник в чате

Вкладка «Помощь» может отвечать через ИИ-сервис Groq. Ключ API хранится только на сервере: функция `api/chat.mjs` работает на Vercel и читает переменные окружения проекта Vercel.

| Переменная (Vercel) | Нужна | Назначение |
| --- | --- | --- |
| `GROQ_API_KEY` | Да, для ИИ | Ключ из [GroqCloud](https://console.groq.com/keys). Без него чат автоматически использует офлайн-ответы. |
| `GROQ_MODEL` | Нет | По умолчанию `openai/gpt-oss-120b`. |

ИИ включается только после согласия пользователя в чате и выключается в разделе «Право». В Groq уходит только текст сообщений чата; контакты, координаты и журнал не отправляются. Groq по умолчанию не хранит запросы и не обучает на них модели.

## Сборка для App Store и Google Play

Добавьте переменные в окружение EAS для production-сборки (пример — [`.env.example`](.env.example)). Не коммитьте настоящие `.env`-файлы, токены и пароли.

| Переменная | Нужна | Назначение |
| --- | --- | --- |
| `GUARDAURORA_PRIVACY_POLICY_URL` | Нет | По умолчанию `https://guard-aurora.vercel.app/privacy`. |
| `GUARDAURORA_SUPPORT_URL` | Нет | По умолчанию `https://guard-aurora.vercel.app/support`. URL поддержки для карточки App Store. |
| `GUARDAURORA_SUPPORT_EMAIL` | Нет | По умолчанию `romiisromie@gmail.com`, отображается в приложении и на страницах помощи/политики. |
| `GUARDAURORA_CHAT_API_URL` | Нет | По умолчанию `https://guard-aurora.vercel.app/api/chat`. Адрес серверной функции ИИ-чата. |
| `SENTRY_DSN` | По желанию | Включает отправку отчётов об ошибках в Sentry. Пустое значение отключает отправку. Если включено, это нужно отразить в политике и формах магазинов. |
| `SENTRY_AUTH_TOKEN` | Только для загрузки source maps | Секретный токен Sentry; сам по себе не включает загрузку карт исходников. Не храните его в Git и клиентском приложении. |

Отчёты Sentry выключены, пока `SENTRY_DSN` пуст. Аналитический SDK не подключён. Не заявляйте, что мониторинг сбоев работает, пока не проверите событие из production-сборки в панели Sentry.

```sh
npx eas-cli login
npx eas-cli build --platform ios --profile production
npx eas-cli build --platform android --profile production
```

Версия 1.0 опубликована в App Store в ноябре 2026 года. Сама EAS-сборка приложение в магазин не публикует: нужны аккаунты Apple Developer и Play Console, карточки приложения, signing credentials, сведения о конфиденциальности, скриншоты и заметки для модерации. Подробности — в [docs/APP_STORE_RELEASE.md](docs/APP_STORE_RELEASE.md) и [docs/PUBLISH_GUIDE_RU.md](docs/PUBLISH_GUIDE_RU.md).

### Чек-лист перед отправкой обновления

- [ ] Поднять `version` в `app.json` и номер сборки.
- [ ] Обновить описание и «Что нового» в карточке по [release guide](docs/APP_STORE_RELEASE.md), если поменялись функции.
- [ ] Решить, включать ли Sentry; проверить production-отчёт и раскрыть сбор данных SDK в формах магазинов.
- [ ] Проверить privacy report iOS и актуальные требования к privacy manifest сторонних SDK.
- [ ] Заполнить возрастной рейтинг, регионы, скриншоты, описание, URL поддержки и privacy/data safety в App Store Connect и Play Console.
- [ ] Проверить на реальных устройствах iOS и Android разрешения, звонки/SMS-черновики, отмену/остановку SOS, офлайн-режим, отказ в геолокации и удаление данных.
- [ ] Выполнить store-сборки и пройти модерацию через реальные аккаунты разработчика.

Изменения исходного кода сами по себе не гарантируют одобрение магазина. Результат зависит от итоговой сборки, сторонних SDK, карточки приложения, данных владельца, проверки на устройствах и аккаунтов разработчика.

## Поддержка

Вопросы и ошибки — через [Issues](https://github.com/romiisromie/GuardAurora/issues) или на странице [поддержки](https://guard-aurora.vercel.app/support).

## Лицензия

Распространяется по лицензии [MIT](LICENSE). © 2026 Ramina Ibraimova.
