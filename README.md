<img width="1024" height="1024" alt="WhatsApp Image 2026-04-20 at 4 21 39 PM" src="https://github.com/user-attachments/assets/332ba011-47e4-496d-ac7b-2248d1c09963" />
# 🛡️ GuardAurora — Запуск в VS Code

## Структура проекта
```
GuardAurora/
├── App.tsx                         ← точка входа
├── app.json                        ← Expo конфиг
├── package.json                    ← зависимости (Expo 52)
├── babel.config.js
├── tsconfig.json
├── assets/
│   └── logo.png                    ← логотип GuardAurora
└── src/
    ├── theme/index.ts              ← цвета, отступы, радиусы
    ├── store/AppContext.tsx        ← глобальное состояние
    ├── hooks/
    │   ├── useAudioMonitor.ts     ← ИИ-анализ микрофона
    │   ├── useLocation.ts         ← GPS трекинг
    │   └── useShakeDetector.ts    ← тихий SOS (встряска)
    ├── components/ui.tsx          ← UI: PulseRing, SoundWave, кнопки
    ├── screens/
    │   ├── HomeScreen.tsx         ← главный экран с SOS
    │   ├── MapScreen.tsx          ← карта + безопасные маршруты
    │   ├── ChatScreen.tsx         ← ИИ чат (Claude API)
    │   ├── ContactsScreen.tsx     ← доверенные контакты
    │   └── HistoryScreen.tsx      ← журнал событий
    └── navigation/index.tsx       ← bottom tab навигация
```

---

## 🚀 Запуск (шаг за шагом в VS Code)

### 1. Открой папку в VS Code
```
Файл → Открыть папку → выбери GuardAurora
```

### 2. Открой терминал в VS Code
```
Ctrl + `  (или Terminal → New Terminal)
```

### 3. Установи зависимости
```bash
npm install
```

### 4. Запусти Expo
```bash
npx expo start
```

После этого в терминале появится QR-код.

### 5. Открой на телефоне
1. Скачай **Expo Go** из App Store (iPhone) или Play Store (Android)
2. **iPhone**: открой камеру и наведи на QR-код
3. **Android**: открой Expo Go → нажми "Scan QR code"
4. Приложение запустится на телефоне!

---

## 📱 Как пользоваться

| Действие | Результат |
|----------|-----------|
| Нажать большую кнопку SOS | Отсчёт 3 сек → активация SOS |
| Нажать "Отменить" во время отсчёта | Отмена SOS |
| Встряхнуть телефон 3 раза | Тихий SOS (без нажатий) |
| Кнопка "Включить мониторинг" | ИИ слушает микрофон |
| Вкладка Карта → "Определить местоположение" | GPS координаты |
| Вкладка Карта → нажать на место | Построить маршрут |
| Вкладка ИИ Чат | Общение с GuardAurora AI |
| Вкладка Контакты → "+" | Добавить доверенный контакт |

---

## 🔧 Если что-то не работает

### Ошибка "Metro bundler failed"
```bash
npx expo start --clear
```

### Ошибка с зависимостями
```bash
npm install --legacy-peer-deps
```

### Обновить Expo Go на телефоне
Удали и переустанови Expo Go из магазина.

### Ошибка TypeScript
В `tsconfig.json` уже отключён строгий режим — всё должно работать.

---

## 🛠️ Следующие шаги (по желанию)

### Реальные SMS через Twilio
В `src/store/AppContext.tsx` в функции `activateSOS()` добавь:
```typescript
await fetch('https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('ACCOUNT_SID:AUTH_TOKEN'),
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: `To=${contact.phone}&From=+1НОМЕР&Body=🚨 SOS! ${имя} в опасности. GPS: ${latitude},${longitude}`,
});
```

### Push уведомления
```bash
npx expo install expo-notifications
```

### Сохранение данных
```bash
npx expo install @react-native-async-storage/async-storage
```

---

## 🎨 Кастомизация цветов
Все цвета в `src/theme/index.ts`:
```typescript
Colors.rose      // #e8547a  — SOS, главный акцент
Colors.lavender  // #c084fc  — мониторинг, навигация
Colors.mint      // #67e8c4  — безопасность, GPS
Colors.danger    // #ff4757  — угроза, тревога
Colors.bg        // #0d0118  — тёмный фон
```
