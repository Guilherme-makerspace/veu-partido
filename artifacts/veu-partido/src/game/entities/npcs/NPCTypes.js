import { COLORS } from '../../constants.js';

export const NPC_CONFIGS = {
  mercador: {
    name: 'Mercador',
    color: COLORS.AMBER,
    dialogs: [
      { speaker: 'mercador', text: 'Compra e venda de mercadorias... por um preço.' },
      { speaker: 'mercador', text: 'Tenho materiais de qualidade B e C. Não é barato.' },
    ],
    shopItems: [
      { id: 'ferro_B', name: 'Peça de Aço', quality: 'B', price: 50 },
      { id: 'cristal_eco', name: 'Cristal de Eco', healEco: 30, price: 40 },
      { id: 'erva_pulso', name: 'Erva Pulsante', healPulso: 50, price: 30 },
    ],
    curseDrop: null,
  },
  sobrevivente: {
    name: 'Sobrevivente',
    color: COLORS.BLUE,
    dialogs: [
      { speaker: 'sobrevivente', text: 'Você não sabe o que está lá dentro.' },
      { speaker: 'sobrevivente', text: 'A cidade foi consumida. Nós que ficamos... mudamos.' },
      { speaker: 'sobrevivente', text: 'Se você vai lá, leve cuidado com os Guardiões.' },
    ],
    curseDrop: null,
  },
  amaldicado: {
    name: 'Amaldiçoado',
    color: COLORS.ACCENT2,
    dialogs: [
      { speaker: 'amaldicado', text: 'Esta maldição... não é minha. Alguém me a deu.' },
      { speaker: 'amaldicado', text: 'Você pode absorvê-la? Por favor.' },
    ],
    curseDrop: 'fome',
  },
  oraculo: {
    name: 'Oráculo',
    color: COLORS.ACCENT,
    dialogs: [
      { speaker: 'oraculo', text: 'O Véu se parte. Quatro marcados caminham.' },
      { speaker: 'oraculo', text: 'Dois destes já foram marcados antes de nascer.' },
      { speaker: 'oraculo', text: 'Apenas cooperando vencerão o que aguarda no centro do Véu.' },
    ],
    curseDrop: null,
  },
};
