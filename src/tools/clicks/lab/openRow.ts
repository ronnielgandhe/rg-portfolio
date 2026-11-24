export const OPEN_ROW = 'clk-open-row';
export const openRow = (id: string) => window.dispatchEvent(new CustomEvent(OPEN_ROW, { detail: id }));
