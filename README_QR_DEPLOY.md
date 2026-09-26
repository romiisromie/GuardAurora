# GuardAurora QR Always-On

Эта папка содержит публичную аварийную страницу для QR: `public-qr/index.html`.
Основная ссылка Vercel открывает веб-версию приложения, а аварийная страница доступна по адресу `/emergency`.

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

`https://guardaurora-qr.vercel.app/emergency?name=Alina&status=SOS&contact=%2B77771234567`

Старые QR-ссылки с параметрами `name`, `status` или `contact` в корне домена также перенаправляются на аварийную страницу.

Где:
- `name` - имя
- `status` - статус
- `contact` - номер доверенного контакта

## Обновление

После правок страницы:
`vercel --prod`
