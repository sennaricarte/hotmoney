import { stripMarkdown } from './strip-markdown';

export interface PostFaqItem {
  question: string;
  answer: string;
}

/** Extrai pares pergunta/resposta após H2 "Perguntas frequentes" no corpo Markdown. */
export function extractPostFaq(markdown: string): PostFaqItem[] {
  const lines = markdown.split('\n');
  let inFaq = false;
  const items: PostFaqItem[] = [];
  let currentQuestion: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    if (!currentQuestion) return;
    const answer = answerLines.join(' ').trim();
    if (answer) items.push({ question: currentQuestion.trim(), answer });
    currentQuestion = null;
    answerLines = [];
  };

  for (const line of lines) {
    if (/^##\s+.*perguntas frequentes/i.test(line)) {
      flush();
      inFaq = true;
      continue;
    }

    if (!inFaq) continue;

    if (/^##\s+/.test(line)) {
      flush();
      break;
    }

    if (/^###\s+/.test(line)) {
      flush();
      currentQuestion = line.replace(/^###\s+/, '');
      continue;
    }

    if (currentQuestion && line.trim()) {
      answerLines.push(line.trim());
    }
  }

  flush();
  return items;
}

export function getPostFaqPageSchema(items: PostFaqItem[]) {
  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: stripMarkdown(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripMarkdown(item.answer),
      },
    })),
  };
}
