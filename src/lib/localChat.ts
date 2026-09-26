export function localAssistantReply(text: string, translate: (russian: string) => string = value => value): string {
  const q = text.toLowerCase();
  if (q.includes('sos') || q.includes('угроз') || q.includes('преслед') || q.includes('опасн') || q.includes('threat') || q.includes('danger') || q.includes('қауіп') || q.includes('қудал')) {
    return translate('Если тебе угрожают, перейди в людное место и позвони в местную экстренную службу. Кнопка SOS только запускает отсчёт и сохраняет событие в журнале: приложение не вызывает службы и не отправляет сообщения контактам.');
  }
  if (q.includes('маршрут') || q.includes('карт') || q.includes('map') || q.includes('location') || q.includes('карта')) {
    return translate('В этой версии карта получает только координаты телефона и может открыть их в Google Maps. Проверенных безопасных мест и оценки маршрута нет.');
  }
  if (q.includes('контакт') || q.includes('contact') || q.includes('байланыс')) {
    return translate('Добавь доверенные контакты на вкладке «Контакты». Автоматической рассылки SOS в этой версии нет.');
  }
  if (q.includes('спокой') || q.includes('паник') || q.includes('страх') || q.includes('calm') || q.includes('afraid') || q.includes('тыныш') || q.includes('қорқ')) {
    return translate('Сделай несколько медленных вдохов и выдохов. Если можешь, позвони или напиши человеку, которому доверяешь.');
  }
  return translate('Я локальный помощник GuardAurora. Могу подсказать, как пользоваться SOS и контактами. Ответы формируются на устройстве. В реальной опасности звони в местную экстренную службу.');
}
