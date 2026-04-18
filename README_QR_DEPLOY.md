# GuardAurora QR Always-On

Эта папка уже содержит публичную страницу для QR: `public-qr/index.html`.

## Что это решает

Если ноутбук и приложение выключены, QR всё равно открывается, потому что страница лежит на хостинге.

## Быстрый деплой на Vercel (5 минут)

1. Установите CLI:
   `npm i -g vercel`
2. В корне проекта выполните:
   `vercel`
3. На вопросы CLI:
   - Link to existing project? -> `No`
   - Project name -> например `guardaurora-qr`
   - Directory -> `.` (текущая)
4. После первого деплоя получите URL вида:
   `https://guardaurora-qr.vercel.app`

## Создание QR

Ссылка для QR (пример):

`https://guardaurora-qr.vercel.app/?name=Alina&status=SOS&contact=%2B77771234567`

Где:
- `name` - имя
- `status` - статус
- `contact` - номер доверенного контакта

## Обновление

После правок страницы:
`vercel --prod`
