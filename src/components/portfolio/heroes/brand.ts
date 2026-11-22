import { PROJECT_BRAND } from '../covers/brand';

export const accentCss = (id: string, root: string) => {
  const a = PROJECT_BRAND[id];
  return `.${root}{--acc:${a.color}}.site-dark .${root}{--acc:${a.colorDark}}`;
};
