// Utilidades de QA (não é um script de browser-automation — sem `export default`)
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
