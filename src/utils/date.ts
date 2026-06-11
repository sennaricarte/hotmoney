const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
