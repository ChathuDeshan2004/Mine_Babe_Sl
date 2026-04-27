import { openai } from '@ai-sdk/openai';
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
  openai,
});

export const customProvider = registry.languageModel.bind(registry);
