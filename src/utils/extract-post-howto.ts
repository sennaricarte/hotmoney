import { stripMarkdown } from './strip-markdown';

export interface HowToStep {
  name: string;
  text: string;
}

/** Extrai passos (H3) após H2 com "passo a passo" no corpo Markdown. */
export function extractPostHowTo(markdown: string): HowToStep[] {
  const lines = markdown.split('\n');
  let inHowTo = false;
  const steps: HowToStep[] = [];
  let currentName: string | null = null;
  let textLines: string[] = [];

  const flush = () => {
    if (!currentName) return;
    const text = textLines.join(' ').trim();
    steps.push({ name: currentName.trim(), text: text || currentName.trim() });
    currentName = null;
    textLines = [];
  };

  for (const line of lines) {
    if (/^##\s+.*passo a passo/i.test(line)) {
      flush();
      inHowTo = true;
      continue;
    }

    if (!inHowTo) continue;

    if (/^##\s+/.test(line)) {
      flush();
      break;
    }

    if (/^###\s+/.test(line)) {
      flush();
      currentName = line.replace(/^###\s+/, '').replace(/^\d+\.\s*/, '');
      continue;
    }

    if (currentName && line.trim()) {
      textLines.push(line.trim());
    }
  }

  flush();
  return steps;
}

export function getPostHowToSchema(options: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  if (options.steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: stripMarkdown(options.name),
    description: stripMarkdown(options.description),
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: stripMarkdown(step.name),
      text: stripMarkdown(step.text),
    })),
  };
}
