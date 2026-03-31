export const SKILL_TREES = {
  metamorfo: {
    branches: {
      fratura: {
        name: 'Bruch-Linie',
        nodes: [
          { id: 'bruch1', tier: 1, name: 'Absorção de Fratura', desc: 'Golpe absorve 5% da essência bruta', cost: 1, requires: [] },
          { id: 'bruch2', tier: 2, name: 'Potência de Essência', desc: 'Essência potencializa Fratura em +20% por stack', cost: 2, requires: ['bruch1'] },
          { id: 'bruch3', tier: 3, name: 'Fragmento Composto', desc: 'Funde 3 essências em ataque único', cost: 3, requires: ['bruch2'], ultimate: true },
        ],
      },
      pulso: {
        name: 'Puls-Kern',
        nodes: [
          { id: 'puls1', tier: 1, name: 'Regeneração por Absorção', desc: 'Regenera 5 Pulso ao absorver essência', cost: 1, requires: [] },
          { id: 'puls2', tier: 2, name: 'Escudo Resistente', desc: 'Essência de criatura resistente concede escudo temporário', cost: 2, requires: ['puls1'] },
          { id: 'puls3', tier: 3, name: 'Núcleo Híbrido', desc: 'Pulso máximo +30% quando 5+ essências ativas', cost: 3, requires: ['puls2'], ultimate: true },
        ],
      },
      eco: {
        name: 'Echo-Spur',
        nodes: [
          { id: 'eco1', tier: 1, name: 'Absorção Eficiente', desc: 'Reduz custo de absorção em 1 Eco', cost: 1, requires: [] },
          { id: 'eco2', tier: 2, name: 'Eco Extra', desc: 'Essência duplicada gera Eco extra', cost: 2, requires: ['eco1'] },
          { id: 'eco3', tier: 3, name: 'Ressonância Primordial', desc: 'Absorção gratuita por 3 turnos', cost: 3, requires: ['eco2'], ultimate: true },
        ],
      },
      veu: {
        name: 'Schleier-Schritt',
        nodes: [
          { id: 'veu1', tier: 1, name: 'Passo Voador', desc: 'Essência voadora concede +1 Véu', cost: 1, requires: [] },
          { id: 'veu2', tier: 2, name: 'Mobilidade Absorvida', desc: 'Usa mobilidade de qualquer essência ativa', cost: 2, requires: ['veu1'] },
          { id: 'veu3', tier: 3, name: 'Passo Composto', desc: 'Teleporte curto 1×/batalha', cost: 3, requires: ['veu2'], ultimate: true },
        ],
      },
      limiar: {
        name: 'Schwelle-Form',
        nodes: [
          { id: 'lim1', tier: 1, name: 'Slot Adicional', desc: '+1 slot de essência ativa', cost: 1, requires: [] },
          { id: 'lim2', tier: 2, name: 'Essências Opostas', desc: 'Essências opostas não causam instabilidade', cost: 2, requires: ['lim1'] },
          { id: 'lim3', tier: 3, name: 'Além da Forma', desc: 'Assume traço de essência sem custo de Limiar', cost: 3, requires: ['lim2'], ultimate: true },
        ],
      },
    },
  },
  duelista: {
    branches: {
      fratura: { name: 'Bruch-Schuss', nodes: [
        { id: 'df1', tier: 1, name: 'Penetração Leve', desc: 'Projéteis improvisados penetram armadura leve', cost: 1, requires: [] },
        { id: 'df2', tier: 2, name: 'Penetração Média', desc: 'Arma B+ perfura armadura média', cost: 2, requires: ['df1'] },
        { id: 'df3', tier: 3, name: 'Disparo de Ruptura', desc: 'Ignora toda armadura por 1 tiro', cost: 3, requires: ['df2'], ultimate: true },
      ]},
      pulso: { name: 'Puls-Reflex', nodes: [
        { id: 'dp1', tier: 1, name: 'Esquiva Instantânea', desc: 'Esquiva instantânea quando Véu ≥ 3', cost: 1, requires: [] },
        { id: 'dp2', tier: 2, name: 'Contra-Ataque', desc: 'Esquiva dispara contra-ataque automático', cost: 2, requires: ['dp1'] },
        { id: 'dp3', tier: 3, name: 'Fluxo de Combate', desc: '2 ações no mesmo turno se esquivou', cost: 3, requires: ['dp2'], ultimate: true },
      ]},
      eco: { name: 'Echo-Bau', nodes: [
        { id: 'de1', tier: 1, name: 'Crafting Eficiente', desc: 'Crafting custa -1 Eco', cost: 1, requires: [] },
        { id: 'de2', tier: 2, name: 'Arma de Eco', desc: 'Material S cria arma com habilidade de Eco', cost: 2, requires: ['de1'] },
        { id: 'de3', tier: 3, name: 'Arquiteto de Fluxo', desc: '1 arma ativa por batalha sem custo', cost: 3, requires: ['de2'], ultimate: true },
      ]},
      veu: { name: 'Schleier-Zug', nodes: [
        { id: 'dv1', tier: 1, name: 'Velocidade Ranged', desc: '+2 Véu ao segurar arma ranged', cost: 1, requires: [] },
        { id: 'dv2', tier: 2, name: 'Reposicionamento', desc: 'Pode reposicionar após cada disparo', cost: 2, requires: ['dv1'] },
        { id: 'dv3', tier: 3, name: 'Linha de Fluxo', desc: 'Atravessa campo de batalha em 1 ação', cost: 3, requires: ['dv2'], ultimate: true },
      ]},
      limiar: { name: 'Schwelle-Sinn', nodes: [
        { id: 'dl1', tier: 1, name: 'Detectar Qualidade', desc: 'Detecta qualidade de materiais no chão', cost: 1, requires: [] },
        { id: 'dl2', tier: 2, name: 'Pontos Fracos', desc: 'Enxerga pontos fracos (crit +15%)', cost: 2, requires: ['dl1'] },
        { id: 'dl3', tier: 3, name: 'Intuição Total', desc: 'Sempre sabe a melhor arma possível disponível', cost: 3, requires: ['dl2'], ultimate: true },
      ]},
    },
  },
  xama: {
    branches: {
      fratura: { name: 'Разлом-Слово', nodes: [
        { id: 'xf1', tier: 1, name: 'Mantra Barato', desc: 'Mantras de Depredação custam -1 Eco', cost: 1, requires: [] },
        { id: 'xf2', tier: 2, name: 'Maldição Duradoura', desc: 'Maldição física dura +1 turno', cost: 2, requires: ['xf1'] },
        { id: 'xf3', tier: 3, name: 'Palavra de Ruína', desc: 'Maldição que reduz Fratura inimiga em 50%', cost: 3, requires: ['xf2'], ultimate: true },
      ]},
      pulso: { name: 'Пульс-Щит', nodes: [
        { id: 'xp1', tier: 1, name: 'Absorção Defensiva', desc: 'Mantra defensivo absorve 10 de dano', cost: 1, requires: [] },
        { id: 'xp2', tier: 2, name: 'Cura por Desastre', desc: 'Desastre cura aliado em 15% do dano causado', cost: 2, requires: ['xp1'] },
        { id: 'xp3', tier: 3, name: 'Pulso Inverso', desc: 'Converte dano recebido em Pulso por 2 turnos', cost: 3, requires: ['xp2'], ultimate: true },
      ]},
      eco: { name: 'Эхо-Закон', nodes: [
        { id: 'xe1', tier: 1, name: 'Lei Quebrada', desc: '+2 Eco ao quebrar uma lei da realidade', cost: 1, requires: [] },
        { id: 'xe2', tier: 2, name: 'Regeneração Mística', desc: 'Mantras Místicos regeneram Eco ao acertar', cost: 2, requires: ['xe1'] },
        { id: 'xe3', tier: 3, name: 'Lei do Eco', desc: 'Próximo mantra gratuito após 3 mantras seguidos', cost: 3, requires: ['xe2'], ultimate: true },
      ]},
      veu: { name: 'Покров-Путь', nodes: [
        { id: 'xv1', tier: 1, name: 'Alcance Extendido', desc: 'Mantras de Desastre têm alcance +30%', cost: 1, requires: [] },
        { id: 'xv2', tier: 2, name: 'Lançamento em Movimento', desc: 'Pode lançar mantra em movimento', cost: 2, requires: ['xv1'] },
        { id: 'xv3', tier: 3, name: 'Cobertura do Véu', desc: 'Mantras afetam área 2× e não gastam posição', cost: 3, requires: ['xv2'], ultimate: true },
      ]},
      limiar: { name: 'Порог-Разум', nodes: [
        { id: 'xl1', tier: 1, name: 'Dissonância Reduzida', desc: 'Dissonância entre caminhos -20%', cost: 1, requires: [] },
        { id: 'xl2', tier: 2, name: 'Limiar Estável', desc: 'Baixo Limiar não cancela mantras', cost: 2, requires: ['xl1'] },
        { id: 'xl3', tier: 3, name: 'Além do Limiar', desc: 'Usa os 3 caminhos sem penalidade de Dissonância', cost: 3, requires: ['xl2'], ultimate: true },
      ]},
    },
  },
  voraz: {
    branches: {
      fratura: { name: 'Разлом-Гнев', nodes: [
        { id: 'vf1', tier: 1, name: 'Burst Corrosivo', desc: 'Burst de Revenge acerta -10% Fratura inimiga', cost: 1, requires: [] },
        { id: 'vf2', tier: 2, name: 'Fome Potencializada', desc: 'Maldição de Fome: burst causa dano bônus', cost: 2, requires: ['vf1'] },
        { id: 'vf3', tier: 3, name: 'Ira Entrópica', desc: 'Burst triplo com 3 maldições ativas', cost: 3, requires: ['vf2'], ultimate: true },
      ]},
      pulso: { name: 'Пульс-Дрен', nodes: [
        { id: 'vp1', tier: 1, name: 'Absorção Vital', desc: 'Absorver maldição restaura 10 Pulso', cost: 1, requires: [] },
        { id: 'vp2', tier: 2, name: 'Colapso Reativo', desc: 'Em Colapso, ativa Revenge automaticamente', cost: 2, requires: ['vp1'] },
        { id: 'vp3', tier: 3, name: 'Consumo Total', desc: 'Se Pulso zerar com maldição ativa, revive com 30%', cost: 3, requires: ['vp2'], ultimate: true },
      ]},
      eco: { name: 'Эхо-Поток', nodes: [
        { id: 'vee1', tier: 1, name: 'Preguiça Eficiente', desc: 'Maldição de Preguiça -2 custo de Eco', cost: 1, requires: [] },
        { id: 'vee2', tier: 2, name: 'Acúmulo de Eco', desc: 'Acumular 2 maldições gera +5 Eco', cost: 2, requires: ['vee1'] },
        { id: 'vee3', tier: 3, name: 'Fluxo Corrompido', desc: 'Habilidades gratuitas por 2 turnos após burst', cost: 3, requires: ['vee2'], ultimate: true },
      ]},
      veu: { name: 'Покров-Голод', nodes: [
        { id: 'vv1', tier: 1, name: 'Fome Veloz', desc: 'Fome: +2 Véu, -3 Pulso/turno', cost: 1, requires: [] },
        { id: 'vv2', tier: 2, name: 'Esquiva Dupla', desc: 'Com 2 maldições, esquiva não gasta ação', cost: 2, requires: ['vv1'] },
        { id: 'vv3', tier: 3, name: 'Fuga do Amaldiçoado', desc: 'Teleporte de emergência ao atingir Colapso', cost: 3, requires: ['vv2'], ultimate: true },
      ]},
      limiar: { name: 'Порог-Хаос', nodes: [
        { id: 'vl1', tier: 1, name: 'Limiar Caótico', desc: 'Baixo Limiar: Revenge acumula 20% mais rápido', cost: 1, requires: [] },
        { id: 'vl2', tier: 2, name: 'Estabilidade por Preguiça', desc: 'Maldição de Preguiça estabiliza Limiar', cost: 2, requires: ['vl1'] },
        { id: 'vl3', tier: 3, name: 'Caos Controlado', desc: 'Com Limiar crítico, converte instabilidade em dano puro', cost: 3, requires: ['vl2'], ultimate: true },
      ]},
    },
  },
};

export default class SkillTreeSystem {
  constructor(classType) {
    this.classType = classType;
    this.tree = SKILL_TREES[classType] || SKILL_TREES.metamorfo;
    this.unlocked = new Set();
    this.points = 0;
  }

  canUnlock(nodeId) {
    const node = this.findNode(nodeId);
    if (!node) return false;
    if (this.unlocked.has(nodeId)) return false;
    if (this.points < node.cost) return false;
    return node.requires.every(r => this.unlocked.has(r));
  }

  unlock(nodeId) {
    if (!this.canUnlock(nodeId)) return false;
    const node = this.findNode(nodeId);
    this.points -= node.cost;
    this.unlocked.add(nodeId);
    return true;
  }

  findNode(nodeId) {
    for (const branch of Object.values(this.tree.branches)) {
      const node = branch.nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  }

  addPoints(n) {
    this.points += n;
  }

  isUnlocked(nodeId) {
    return this.unlocked.has(nodeId);
  }

  getBranches() {
    return this.tree.branches;
  }
}
