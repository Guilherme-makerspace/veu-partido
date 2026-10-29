# game-document.md - Documento Geral de Design (GDD)

---

## FASE 1: VISÃO GERAL DO PROJETO

### 1.1. Identidade e Filosofia de Design
* **Título do Projeto:** O Véu Partido.
* **Gênero:** RPG de Ação Hardcore 2.5D / Beat 'em Up Tático com Progressão por Caminhos.
* **Plataforma e Hospedagem:** Web moderna, hospedado na **Vercel** (Execução cliente rica via Phaser.js com renderizador WebGL acelerado).
* **Diretriz de Escopo Técnico:** O peso da build e o tamanho dos pacotes de dados não são limitações estritas. A infraestrutura foca na densidade mecânica, profundidade de sistemas, riqueza de partículas (Sprite-based particles e shaders de ondulação) e alta fidelidade visual dentro dos padrões da Universal LPC Spritesheet.
* **Regra Fundamental de Balanceamento:** **Paridade Estrita de Poder**. A escala de eficácia marcial, capacidade de sobrevivência e contribuição tática entre os quatro personagens jogáveis (Dit, Dullant, Dren e Duja/Suna) é rigorosamente fixa. Os caminhos de especialização divergem em métodos operacionais, alcance e dinâmica de combate, mas a soma de seus índices matemáticos permanece nivelada.

### 1.2. Arquitetura de Movimentação e Eixos (Core Loop)
O sistema espacial substitui a movimentação aberta desordenada por um plano 2.5D de alta precisão tática (estilo *Castle Crashers* / *Guardian Heroes* com mecânicas de *Soulslike*):
* **Eixo X (Progressão Horizontal):** Onde ocorrem o avanço da fase, o espaçamento horizontal de armas de haste, projéteis e o recuo mecânico (*knockback*).
* **Eixo Y (Profundidade Controlada):** Faixa de chão com altura estratégica de 150px a 200px. Utilizada para esquivas laterais tridimensionais, flanqueamento de escudos e posicionamento seguro para conjuração ou canalização de cura.
* **Colisores de Arena e Bloqueio:** As extremidades da tela travam a câmera durante o combate. As paredes invisíveis são liberadas exclusivamente após a eliminação da totalidade das ameaças ativas (`ON_ARENA_CLEAR`).

```
┌────────────────────────────────────────────────────────┐
│             ARENA DE COMBATE 2.5D (EIXOS)              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Y: Profundidade 150-200px]                           │
│  ▲                                                     │
│  │   [Inimigo]                                         │
│  │      \                                              │
│  │       \ (Esquiva no Eixo Y)                         │
│  │        ▼                                            │
│  │   [Marcado 1] ──── Ataque Leve/Pesado ────► [Alvo]  │
│  ▼                                                     │
│  ◄──────────────── Eixo X: Avanço ───────────────────► │
│  [Barreira Invisível]              [Barreira Invisível]│
│  (Abre com ON_ARENA_CLEAR)         (Abre com ARENA_OK) │
└────────────────────────────────────────────────────────┘
```

### 1.3. Ações Fundamentais de Combate em Tempo Real
* **Ataque Leve / Pesado:** Combos de golpes leves velozes combinados com finalizadores pesados dotados de *hitstop* (3 a 5 frames de congelamento visual para comunicar peso e massa mecânica).
* **Dash (Esquiva):** Deslocamento rápido com janela precisa de frames de invencibilidade (I-frames: 150ms de tolerância base).
* **Defesa e Parry (Escudo de Véu):** Consome Eco. Bloquear no instante exato do impacto inimigo reflete projéteis balísticos e atordoa o atacante.
* **Cura (Canalização de Pulso):** Cria uma redoma translúcida no chão. Exige tempo de espera (*cast time* vulnerável), recompensando jogadores que usam a profundidade do Eixo Y para sair da linha de ataque dos inimigos. Se os dois jogadores canalizarem juntos na mesma redoma, a regeneração é duplicada.

### 1.4. Interface do Usuário (HUD Dual) e Semiótica Visual
* **Estrutura HUD 2P:** 
  * *Player 1 (Canto Superior Esquerdo):* Barra de Vida (Verde-Esmeralda), Barra de Eco (Ciano brilhante pulsante) e 4 ícones de Talentos Ativos.
  * *Player 2 (Canto Superior Direito):* Estrutura idêntica, espelhada horizontalmente.
  * *Centro Superior:* Cronômetro da Arena, Nome do Bioma e Contador de Entidades Vivas.
* **VFX de Combate:**
  * *Flash de Dano:* O sprite que sofre impacto pisca em branco absoluto por 2 frames (60 FPS).
  * *Corte de Realidade:* Ataques críticos geram uma fenda diagonal arroxeada translúcida que rasga temporariamente o cenário por 0.1 segundo.
  * *Pós-Imagem de Raridade:* Equipamentos lendários geram um rastro espectral dourado atrás do avatar durante o Dash.
  * *Menu de Pausa Tático:* Ao acessar o inventário de 20 slots durante a arena, o jogo não pausa abruptamente; entra em *Slow Motion* (0.1x de velocidade) preservando a tensão do combate.

---

## FASE 2: OS QUATRO PERSONAGENS (OS MARCADOS)

### 2.1. Tabela Comparativa de Atributos e Papéis Iniciais

| Personagem | Quadrante | Origem Cultural | Atributos Primários | Tipo de Arma | Papel Tático Base |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dit** | Noroeste | Cobaia do Alasca / Tradição Chukchi | +Eco, +Pulso | Arma do Corpo Abatido | Mimetismo Marcial e Adaptação |
| **Dullant** | Nordeste | Inglês Aculturado / Yungdrung Bön | +Fratura, +Eco | Construtos de Matéria Bruta | Franco-Atirador e Balística Acústica |
| **Dren** | Sudeste | Toraja / Asmat | +Pulso, +Fratura | Exclusivo Armas Pesadas | Tanque Colossal e Dano de Postura |
| **Duja** | Sudoeste | Selk'nam / Mapuche | +Eco, +Limiar | Exclusivo Mágicas Leves | Controle de Área, DoT e Pactos |

---

### 2.2. Detalhamento Individual dos Personagens

```
        DIT                     DULLANT                     DREN                      DUJA
 ┌───────────────┐        ┌────────────────┐        ┌──────────────────┐       ┌─────────────────┐
 │   .=======.   │        │   .-------.    │        │   .---------.    │       │     .-----.     │
 │   |(o _ o)|   │        │  /|  o   o|\   │        │  /  x     x  \   │       │    [=======]    │
 │   /|  *  |\   │        │  \|_  ^  _/|   │        │  \   ====   /   │       │    | (---) |    │
 │  / | === | \  │        │   |Casaca/ |   │        │  /|  (===)  |\   │       │    \  ===  /    │
 │    |[tiras   │        │   |Seda Bön|   │        │ / |  =====  | \  │       │    /|  *  |\    │
 │    |médicas] │        │   | [Tiara] |   │        │   | [Tau-   |    │       │   / | === | \   │
 │    |tain'ykvyt│        │   |        |   │        │   |  tau]   |    │       │  (o) === (o)  │
 │   /       \   │        │  /          \  │        │  /           \   │       │   \       /     │
 └───────────────┘        └────────────────┘        └──────────────────┘       └─────────────────┘
  Lona / Peles Árticas      Casaca Inglesa / Bön      Chifres / Tronco          Venda / Pintura Ocre
  Receptáculo Ósseo         Quartzo Flutuante         Martelo de Calcário       Xacrans Acústicos
```

#### Personagem 1: Dit - O Metamorfo
* **Origem Cultural e Lore:** Fruto de um teste laboratorial militar clandestino no permafrost do Alasca ("Espécime D-17"), submetido a infusões de biomassa do Limiar para criar resistência celular extrema. O teste fracassou: Dit perdeu a coesão morfológica, sofrendo dissolução biológica contínua se mantivesse uma forma fixa. Abandonado nas geleiras com a quebra do mundo, foi acolhido por caçadores nômades de renas da costa do Estreito de Bering. Adotou os ritos ancestrais Chukchi e o culto do osso incorruptível (*uviryn*), descobrindo que podia conter sua liquefação se vestisse o esqueleto e a força de animais e inimigos mortos.
* **Aparência e Sprite LPC:** Silhueta instável e predatória. Veste tiras de lona de contenção hospitalar/militar presas com fivelas enferrujadas, recobertas por uma *kamleika* de tiras de pele de lobo e foca com os pelos voltados para dentro. Carrega o *tain'ykvyt* (colar sagrado de ossos e dentes esculpidos). Durante ataques fortes, o sprite projeta silhuetas ósseas transitórias das feras assimiladas.
* **Mecânica Central de Armas:** Dit não empunha armas permanentes nem compra equipamentos manufaturados. Ele empunha a arma e adota o moveset característico da última criatura abatida, assimilando seus status temporariamente.
* **Caminhos de Evolução:**
  * **Metamorfo Múltiplo:** Consegue armazenar até 3 matrizes de armas e habilidades de inimigos abatidos em seu cordão de ossos (*tain'ykvyt*), alternando rapidamente entre elas no combate para construir sequências de combos híbridos.
  * **Metamorfo Evolutivo:** Escolhe a carcaça de um inimigo de elite como seu "Corpo Soberano". Cada novo cadáver abatido não troca sua forma, mas funde mutações permanentes à sua habilidade soberana (ex: carapaça óssea, espinhos de gelo ou lâminas nas articulações).

#### Personagem 2: Dullant - O Duelista
* **Origem Cultural e Lore:** Oficial britânico, engenheiro de balística e cavalheiro educado na Inglaterra imperial pré-colapso. Enviado às cordilheiras do sudoeste chinês e Tibete em missão cartográfica e geológica, viu seu regimento ser aniquilado pelo Grande Estilhaço. Resgatado por sacerdotes Dongba e monges do Yungdrung Bön ("O Bön Eterno"), foi despojado de sua soberba europeia e aculturado: adotou os preceitos de apaziguamento dos deuses minerais (*Gnyan*) e o estudo dos manuscritos pictográficos. Consagrado com ligas de ferro meteórico e quartzo, suas mãos adquiriram frequência harmônica permanente: armas forjadas comuns desmoronam em pó ao seu toque. Mantendo sua postura de duelista de Oxford, ele projeta construtos balísticos flutuantes de pura pedra, quartzo e urânio.
* **Aparência e Sprite LPC:** Porte nobre, postura ereta de atirador e esgrimista britânico. Veste uma fusão entre uma casaca militar vitoriana de corte aristocrático e robes budistas/Bön em azul-índigo com bordados da svastika levógira (*yungdrung*). Usa uma tiara ritualística de cinco lâminas de cobre na testa. Suas mãos permanecem enfaixadas com bandagens rúnicas brilhantes; os construtos flutuam ao redor de seus ombros.
* **Mecânica Central de Armas:** Dullant não utiliza as 60 armas comuns da tabela de loot. Ele carrega reagentes minerais brutos, sucata e urânio, forjando instantaneamente arcos, snipers e canhões acústicos que se materializam no instante do disparo.
* **Caminhos de Evolução:**
  * **Duelista Eco:** Especialização mágica à distância. Constrói arcos compósitos e bestas sônicas que disparam feixes puros de som condensado. Transmuta dano físico em anomalias sônicas (Radiação vira *Estilhaçamento Radiante* com estonteamento em área).
  * **Duelista Fratura:** Especialização balística física pesada. Projeta canhões de fragmentação, rifles pesados de precisão e bacamartes de obsidiana e urânio. Transmuta reações químicas em fissão (Radiação vira *Decaimento de Fissão*, corroendo blindagens).

#### Personagem 3: Dren - O Voraz
* **Origem Cultural e Lore:** Nascido nos planaltos calcários de Tana-Rambu. Submetido ao rito fúnebre incompleto dos Toraja, Dren habitou o mundo dos homens como um *to makula* (cadáver embalsamado vivo). Sua filosofia é a reciclagem voraz da força vital (*ji*) através da massa inquebrável da matéria.
* **Aparência e Sprite LPC:** Silhueta monumental e massiva, quase duas vezes a largura dos outros personagens. Veste uma couraça feita com pranchas de madeira esculpidas (*tau-tau*) amarradas ao peito por correntes de ferro fundido. Ombros adornados por chifres monumentais de búfalo sagrado. A pele tem a tonalidade de pedra calcária seca com incrustações de cinábrio.
* **Mecânica Central de Armas:** Dren opera estritamente com armas pesadas (Martelos, Machados de duas mãos, Montantes colossais). Ele não possui a agilidade dos outros Marcados, mas seus ataques possuem *hyper-armor* inquebrável.
* **Caminhos de Evolução:**
  * **Espelhado:** Lapida sua couraça como as paredes dos nichos funerários. Desenvolve a capacidade de refletir 35% dos golpes inimigos e ganha uma técnica de *Parry Pesado*, readquirindo agilidade humana e a capacidade de empunhar armas de peso intermediário.
  * **Corcovado:** Renuncia completamente à postura ereta e à defesa. Sua espinha se funde a blocos de rocha e ferrolhos. Ele perde a capacidade de bloquear ou esquivar com rapidez e sua vida decai logaritmicamente conforme sofre dano, mas seu status de *Estiramento Visceral* (lifesteal) cresce em escala absurda, curando-o a cada esmagamento efetuado.

#### Personagem 4: Duja (Suna) - A Shamã
* **Origem Cultural e Lore:** Originária dos pântanos e florestas de névoa de Fueguina. Iniciada na ordem esotérica do *Hain* (Selk'nam) e portadora dos cânticos de cura e flagelo da *Machi* (Mapuche). Para Duja, a fala é a única arma que a Entropia não pode oxidar.
* **Aparência e Sprite LPC:** Silhueta esguia e fantasmagórica. Anda com passos rítmicos que parecem flutuar milímetros acima da lama. O corpo está pintado da cabeça aos pés com listras de carvão, argila branca e ocre vermelho imitando o espírito ancestral *Shoort*. Os olhos estão vendados com tiras de pele de foca; ela empunha xacrans de vidro e grimórios de casca vegetal que giram pelo magnetismo de sua voz.
* **Mecânica Central de Armas:** Proibida de empunhar espadas, machados ou lanças mundanas. Utiliza exclusivamente catalisadores sonoros, livros de sangue, xacrans e armas mágicas leves.
* **Caminhos de Evolução:**
  * **Maldito:** Transforma suas melodias em maldições corrosivas (dano por segundo contínuo), exorcismos que implodem as aflições dos inimigos em ondas de choque e pactos perigosos de aumento de poder concedidos a seus aliados sob pena de sacrifício vital.
  * **Imaculado:** Canaliza as frequências mais serenas do Véu. Suas canções criam zonas sagradas de beatificação onde a degeneração celular é interrompida, concedendo escudos temporários e limpando debuffs da equipe.
  * **Cético:** Rejeita os deuses e espíritos, operando a magia como química prática. Arremessa compostos de cinábrio, enxofre e fósforo, e constrói homúnculos de lama e raízes de faia que atraem o fogo inimigo e explodem em ácido.

---

## FASE 3: SISTEMAS E MECÂNICAS DE JOGO

### 3.1. Os 5 Pilares do Marcado (Atributos e Estados)
Cada atributo determina diretamente as capacidades ativas e passivas dos combatentes:
1. **Fratura (FRA):** Força física, quebra de guarda e taxa de atordoamento. Ataques pesados aplicam o status *Rachadura* (-5% de defesa cumulativo no alvo por 3 segundos).
2. **Pulso (PUL):** Integridade biológica e eficácia de cura. Quando os dois Marcados lutam em proximidade no Eixo Y, ativa-se a *Ressonância*, distribuindo o dano sofrido igualmente entre ambos.
3. **Eco (ECO):** Capacidade mental e energia arcana. Reduz tempos de recarga de habilidades ativas. Golpes de Eco deixam *Rastros de Eco* no solo que detonam em contato com ataques físicos de Fratura.
4. **Véu (VEU):** Aceleração cinemática e alcance do Dash. Esquivas perfeitas na janela de 150ms conferem o estado de *Intangibilidade* total por 0.5 segundo.
5. **Limiar (LIM):** Resiliência da mente perante a loucura da Entropia. Reduz o tempo de debuffs sofridos e ativa a *Mente Ancorada* (impede que o HP caia abaixo de 1 por 1 segundo sob dano letal).

### 3.2. Catálogo Geral dos 120 Talentos (Proporção 10/8/6/4/2)

#### Talentos Comuns (20 de 40 Amostrados no GDD - Requisitos: 2 a 5 pontos)
1. **Impacto Ressonante (FRA 3):** Onda frontal em ataques pesados (120px de alcance, 30% de dano base).
2. **Pulso Partilhado (PUL 4):** Aliado próximo recebe 20% da cura gerada por suas ações.
3. **Passo Cortante (VEU 3):** O Dash causa dano físico de contato se atravessar a hitbox do inimigo no Eixo X (Escala com FRA).
4. **Eco Residual (ECO 4):** Reaplica 25% do dano de qualquer habilidade mágica após 1 segundo de intervalo.
5. **Reflexo Instável (VEU 4):** Cria um clone ilusório estático ao acertar uma esquiva perfeita (dura 0.5s).
6. **Sangue Aquecido (FRA 4):** Aumenta a velocidade de ataque em +15% por 3s logo após sofrer dano.
7. **Mente Ancorada (LIM 4):** Aumenta em +25% a resistência contra efeitos de controle de grupo (atordoamento e lentidão).
8. **Corte Reativo (FRA 4):** O alcance do primeiro golpe desferido após a conclusão de um Dash aumenta em +40%.
9. **Eco de Impacto (ECO 3):** Ataques básicos recuperam 2 unidades de Eco por golpe conectado.
10. **Ritmo Compartilhado (PUL 3):** Ataques sincronizados dos dois jogadores contra o mesmo alvo curam 2% de vida máxima de ambos.
11. **Pele de Vidro (LIM 3):** Concede 5% de chance passiva de ignorar inteiramente qualquer dano físico sofrido.
12. **Sombra Ágil (VEU 5):** Acelera a velocidade de animação do Dash em +20%.
13. **Pulso Vital (PUL 5):** Aumenta o montante de vida máxima do Marcado em +10%.
14. **Fratura Exposta (FRA 5):** Ataques leves causam +5% de dano adicional contra adversários atordoados.
15. **Eco Silencioso (ECO 5):** A primeira habilidade ativada em uma nova arena tem seu custo de Eco reduzido em 50%.
16. **Resiliência do Marcado (LIM 5):** Recupera instantaneamente 1% de vida máxima ao cruzar a barreira de uma nova arena.
17. **Golpe de Vento (VEU 4):** O primeiro ataque após um Dash possui 10% de chance de repelir o oponente em 80px no Eixo X.
18. **Harmonia (PUL 4):** Enquanto seu parceiro estiver com 100% de vida, seu dano físico e mágico é aumentado em +5%.
19. **Foco do Estilhaço (ECO 4):** Recupera 1 unidade de Eco por segundo se permanecer imóvel no Eixo X e Y.
20. **Punho de Pedra (FRA 4):** Amplia a eficácia de quebra de guarda contra inimigos protegidos por escudo em +15%.

#### Talentos Incomuns (16 de 32 Amostrados - Requisitos: 6 a 9 pontos)
21. **Estilhaço Expansivo (FRA 7):** Inimigos derrotados por ataques pesados explodem em estilhaços físicos (Escala com FRA).
22. **Vínculo Vital (PUL 8):** Enquanto estiver acima de 70% de vida, você absorve passivamente 15% do dano recebido pelo aliado.
23. **Véu Ofuscante (VEU 7):** O Dash libera uma cortina de cinzas que reduz a precisão dos ataques inimigos em 30% por 2s.
24. **Ressonância de Eco (ECO 8):** Ativar uma habilidade garante +20% de dano ao combo de ataques básicos subsequente.
25. **Ponte de Pulso (PUL 7):** A cura que exceder o valor de vida máxima é convertida em um escudo temporário de 10s.
26. **Limiar Defensivo (LIM 8):** O bloqueio no tempo exato (Parry) reflete 50% do dano do atacante de volta a ele.
27. **Inércia do Vácuo (VEU 8):** Abater um oponente zera instantaneamente o tempo de recarga da esquiva (Dash).
28. **Pulso Ecoado (PUL 6):** Receber qualquer fonte de cura externa emite uma onda de choque que empurra inimigos laterais.
29. **Fratura de Impacto (FRA 9):** Ataques pesados degradam a armadura do adversário em 10% por 5 segundos.
30. **Mente Blindada (LIM 9):** Concede imunidade total contra aflições de veneno por 3s após utilizar a cura.
31. **Vento Cortante (VEU 9):** O rastro percorrido pelo Dash torna-se uma lâmina invisível que aplica sangramento contínuo.
32. **Eco Explosivo (ECO 9):** Se a sua reserva de Eco for completamente esgotada, uma detonação sônica é emitida ao redor.
33. **Sifão de Pulso (PUL 8):** 10% de todo o dano causado por ataques sincronizados em dupla retorna sob a forma de cura direta.
34. **Golpe Fantasma (VEU 8):** O terceiro golpe da sequência de combo leve ignora a colisão e atravessa o corpo do inimigo.
35. **Entropia Controlada (LIM 7):** Amplia a duração de todos os efeitos de buffs e auras ativas em +2 segundos.
36. **Fúria do Marcado (FRA 8):** O dano físico aumenta proporcionalmente à perda de vida (até um teto de +20% de dano).

#### Talentos Raros (12 de 24 Amostrados - Requisitos: 10 a 14 pontos)
37. **Fuga Fraturada (FRA 12, VEU 10):** O rastro do Dash aplica a aflição *Rachadura* (Dano contínuo de sangramento por 4s).
38. **Coroa do Vazio (LIM 12, ECO 10):** A cada 5 ataques básicos conectados, sua próxima habilidade ativa ganha +50% de eficácia.
39. **Vitalidade de Pedra (PUL 13, FRA 11):** Concede imunidade incondicional a atordoamentos enquanto seu HP estiver abaixo de 30%.
40. **Carga Anímica (ECO 12, LIM 11):** 20% de chance de invocar qualquer habilidade mágica ativa sem consumir barras de Eco.
41. **Véu Partilhado (VEU 13, PUL 10):** Executar um Dash com timing perfeito duplica a velocidade de deslocamento do seu aliado por 3s.
42. **Ruína de Campo (FRA 11, ECO 13):** O finalizador do combo pesado quebra o chão em uma zona de Entropia persistente.
43. **Mestre do Limiar (LIM 14):** Reflete 100% do dano de qualquer projétil balístico ou mágico bloqueado com escudo.
44. **Sopro de Eco (ECO 14, PUL 10):** Disparar uma habilidade restaura instantaneamente 5% da vida máxima de seu parceiro.
45. **Punho de Urânio (FRA 14):** Ataques pesados passam a ignorar 30% das reduções de armadura física dos oponentes.
46. **Esquiva Quântica (VEU 14):** Encadear um segundo Dash consecutivo garante 100% de I-frames durante toda a animação.
47. **Eco Sincronizado (ECO 13, FRA 12):** Golpes físicos desferidos em sincronia com o aliado geram o dobro de partículas de Eco.
48. **Ancoragem Espacial (LIM 13, VEU 12):** O Marcado torna-se completamente imune a ser empurrado ou movido enquanto defender.

#### Talentos Épicos (8 de 16 Amostrados - Requisitos: 15 a 17 pontos)
49. **Colapso Binário (FRA 16, VEU 14):** Golpes sincronizados da dupla desencadeiam uma reação em cadeia de explosões na tela.
50. **Vínculo Terminal (PUL 17, LIM 15):** Concede +100% de dano total a ambos os jogadores caso os dois entrem em estado crítico de HP (<20%).
51. **Eco Primordial (ECO 16, LIM 16):** Todas as habilidades ativas ignoram 50% das resistências mágicas naturais das aberrações.
52. **Manto do Estilhaço (VEU 17, PUL 15):** Permanecer imóvel por 1.5 segundo concede invisibilidade e invulnerabilidade até a próxima ação.
53. **Avatar da Fratura (FRA 17):** Ataques pesados não podem ser interrompidos por nenhum ataque inimigo, incluindo chefes.
54. **Ressurreição de Pulso (PUL 17):** Uma vez por bioma, traz o parceiro caído instantaneamente de volta ao combate com 25% de HP.
55. **Tempestade de Eco (ECO 17):** Duplica o raio geométrico e a área de impacto (AoE) de todas as habilidades de área.
56. **Domínio do Vácuo (LIM 17):** Converte 50% de todo o dano recebido por veneno ou ácido diretamente em energia de Eco.

#### Talentos Lendários (4 de 8 Amostrados - Requisitos: 18 a 20+ pontos)
57. **Ruína Sincronizada (FRA 20, ECO 18):** Um ataque pesado duplo perfeitamente sincronizado aniquila instantaneamente inimigos normais (*Instakill*).
58. **Véu Absoluto (VEU 20, LIM 20):** Encadear 3 esquivas perfeitas consecutivas ativa o *Modo Deus* (5 segundos de invulnerabilidade total e velocidade extrema).
59. **Coração do Estilhaço (PUL 20, FRA 18):** Ao sofrer dano fatal, o corpo do Marcado não cai; converte-se em um espectro imortal por 8 segundos antes de expirar.
60. **Eco Infinito (ECO 20, LIM 18):** Sequências de combos longos (10+ hits ininterruptos) zeram todos os custos de Eco por 5 segundos.

---

### 3.3. Sistema de Status Negativos e Aflições (Debuffs)
1. **Hemorragia do Véu (Sangramento):** Causado por cortes críticos. Dano contínuo (DoT) a cada 0.5s que ignora 50% da blindagem.
2. **Entropia Ativa (Corrupção):** Causada por fendas e ataques de chefes. Inverte os comandos do Eixo Y ou corta em 30% a velocidade de ataque. Indicado pelo ícone de um olho estilhaçado sobre o personagem.
3. **Estilhaçamento (Fragilidade):** Causado por impactos contundentes e quebra de guarda. Eleva todo o dano recebido em +20% durante 3 segundos.
4. **Fadiga de Eco:** Sobrecarga arriscada por spam de magias sem recolhimento de fragmentos. Desabilita o Dash temporariamente e bloqueia a profundidade no Eixo Y até que o Marcado cesse ações por 2 segundos.

---

### 3.4. Sistema de Inventário, Raridades e Economia
* **Estrutura da Grade:** Cada jogador dispõe de um painel individual de **20 Slots (matriz 5x4)** com navegação *Snap* instantânea no D-Pad e tooltips descritivos laterais.
* **Empilhamento (Stacking):** Consumíveis acumulam até 5 unidades por slot; Reagentes Brutos (Urânio, Quartzo, Obsidiana) acumulam até 99; Armas e Mantos ocupam 1 slot único.
* **Lógica de Descarte e Coleta:** Ao descartar um item no chão da arena, é gerado um sprite de loot com trava de 2 segundos para quem o jogou, garantindo que o parceiro possa recolhê-lo sem recolhimento acidental.
* **Fragmentação:** Equipamentos inúteis podem ser destruídos diretamente na interface para produzir **Poeira de Eco**, recurso empregado na evolução dos graus dos talentos.
* **Escala de Raridade:**

| Raridade | Multiplicador de Dano | Multiplicador de Valor | Aura Visual | Propriedades Especiais |
| :--- | :--- | :--- | :--- | :--- |
| **Comum** | 1.1x | 1.1x | Branca / Cinza | Sem efeitos adicionais |
| **Incomum** | 1.5x | 1.5x | Verde | 1 atributo secundário |
| **Raro** | 2.0x | 2.0x | Azul | Emite arcos elétricos em dupla |
| **Épico** | 2.5x | 2.5x | Roxa | Habilidade passiva de combate |
| **Lendário** | 3.0x | 3.0x | Dourada / Laranja | Efeito exclusivo e pós-imagem |

---

### 3.5. O Arsenal Completo das Classes (60 Armas Fixas + 15 de Dullant)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MAPA DE DISTRIBUIÇÃO DO ARSENAL                 │
├────────────────────┬───────────────────────────────────────────────────┤
│ ESPADAS (1 A 15)   │ Foco em Véu / Corte rápido (Uso: Dit e Adaptados) │
├────────────────────┼───────────────────────────────────────────────────┤
│ MARTELOS E         │ Foco em Fratura / Impacto e Hyper-Armor           │
│ MACHADOS (16 A 30) │ (Uso Primário: Dren; Secundário: Dit)             │
├────────────────────┼───────────────────────────────────────────────────┤
│ LANÇAS E           │ Foco em Véu e Limiar / Alcance no Eixo X          │
│ HASTES (31 A 45)   │ (Uso: Dit, Dren Espelhado e Inimigos Mimetizados) │
├────────────────────┼───────────────────────────────────────────────────┤
│ ARMAS MÁGICAS      │ Foco em Eco e Limiar / Controle de Área           │
│ (46 A 60)          │ (Uso Exclusivo: Duja / Suna)                      │
├────────────────────┼───────────────────────────────────────────────────┤
│ CONSTRUTOS (D1-D15)│ Construtos de Matéria Bruta moldados por Dullant  │
└────────────────────┴───────────────────────────────────────────────────┘
```

#### Categoria I: Espadas e Lâminas (Foco: Véu / Velocidade)
1. **Gládio de Ferro:** Espada padrão balanceada sem efeitos passivos.
2. **Cimitarra do Deserto:** Amplia o alcance do Dash em +15%.
3. **Rapieira de Prata:** Estocadas precisas perfuram e ignoram 10% da defesa inimiga.
4. **Katana de Cinzas:** O primeiro golpe conectado após uma esquiva causa +50% de dano.
5. **Espada Larga Estilhaçada:** Golpes pesados arremessam fragmentos que cobrem 50px de profundidade no Eixo Y.
6. **Lâmina de Mercúrio:** Cada golpe consecutivo aumenta a cadência de ataque em +2% (acumula até 5 vezes).
7. **Montante do Guardião:** Concede +20% de postura enquanto o portador permanecer parado.
8. **Sabre do Pirata de Véu:** Inimigos abatidos oferecem 10% de probabilidade de conceder dobro de fragmentos de Eco.
9. **Espada Curta Rúnica:** Acertos críticos regeneram 2 unidades de Eco.
10. **Kopis de Bronze:** Garante +15% de dano adicional contra criaturas classificadas como Feras.
11. **Alfange da Maré:** O golpe finalizador da cadeia de ataques leves empurra oponentes em 100px no Eixo X.
12. **Zweihander de Chumbo:** Diminui a velocidade de locomoção, mas concede estabilidade contra atordoamento durante o golpe.
13. **Lâmina de Vento:** Lança uma foice de ar comprimido que atravessa até 3 alvos em linha reta horizontal.
14. **Corta-Almas:** Aplica dano diretamente na energia de Eco das aberrações, impedindo conjurações adversárias.
15. **Espada de Kallyadranoch (Lendária):** Deixa uma trilha de vidro vulcânico no solo que inflige o letal *Veneno de Sílica*.

#### Categoria II: Martelos e Machados (Foco: Fratura / Impacto Pesado)
16. **Malho de Carga:** O carregamento do ataque pesado é acelerado em +20%.
17. **Machado de Batalha:** Aumenta a eficácia de danos por sangramento infligidos no mesmo alvo em +10%.
18. **Marreta de Demolição:** Causa 3x o dano base contra barreiras de madeira, barris e carapaças.
19. **Mangual Estrelado:** Seus impactos curvam-se sobre escudos, anulando o bônus defensivo de oponentes armados.
20. **Martelo de Juiz:** Golpes críticos aplicam o debuff *Lentidão* por 3 segundos.
21. **Machado Duplo:** O ataque carregado realiza um giro de 360 graus que limpa toda a profundidade do Eixo Y ao redor.
22. **Quebra-Crânios:** Eleva o multiplicador de dano em finalizações (*stagger*) em +25%.
23. **Maça do Inquisidor:** Causa dano sagrado ampliado contra inimigos corrompidos pela Entropia.
24. **Martelo de Vapor:** A defesa bem-sucedida expeli uma nuvem de vapor que reduz a precisão dos agressores.
25. **Machado de Gelo Negro:** Resfria a musculatura do oponente, cortando sua regeneração de fôlego.
26. **Grande Malho de Pedra:** Requer 40 de Fratura; cada batida no solo gera tremores que desestabilizam inimigos menores.
27. **Estrela da Manhã:** Golpes críticos provocam simultaneamente *Sangramento* e *Fragilidade*.
28. **Machado de Execução:** Elimina sumariamente qualquer inimigo normal que possua menos de 10% de vida.
29. **Martelo Sísmico:** O choque no pavimento gera uma onda elástica que derruba inimigos de porte leve.
30. **O Esmagador de Mundos (Lendária):** Habilidade Ativa: golpeia o chão e congela a totalidade dos inimigos na tela por 1 segundo.

#### Categoria III: Lanças e Hastes (Foco: Véu e Limiar / Distância)
31. **Lança de Caça:** Garante dano crítico adicional se o impacto ocorrer exclusivamente na ponta da haste.
32. **Pique de Falange:** O usuário recebe +15% de armadura frontal durante os frames ativos do ataque.
33. **Tridente Real:** O comando de estocada perfura 3 vezes em sucessão ultrarrápida.
34. **Glaive de Lótus:** Possui uma área de corte ampliada na verticalidade do Eixo Y.
35. **Lança de Luz:** Deixa um rastro luminoso cintilante que revela entidades ocultas na escuridão.
36. **Arpão de Sangue:** Puxa o adversário fisgado em 50px na direção do jogador.
37. **Pique de Cristal:** Ao cravar-se no chão, gera um geodo que explode em fragmentos após 2 segundos.
38. **Lança de Vime:** Leve e flexível; acelera a recuperação de fôlego do portador em +10%.
39. **Lança Sombria:** Capaz de atingir alvos mesmo quando estes se encontram intangíveis dentro do Véu.
40. **Alabarda de Ouro:** O poder do golpe escala proporcionalmente à quantidade de Eco acumulada na barra.
41. **Lança Elétrica:** O terceiro golpe da sequência dispara um arco voltaico que ricocheteia em um segundo alvo.
42. **Naginata de Seda:** Amplia a tolerância de invulnerabilidade (I-frames) da esquiva em +20%.
43. **Lança de Cinzas:** Libera uma cortina opaca de fumaça ao fim do combo, ocultando a posição do jogador por 1s.
44. **Pique do Vácuo:** Atrai automaticamente fragmentos de Eco soltos na arena para as mãos do portador.
45. **O Alinhador do Véu (Lendária):** Dispara uma flecha de energia cósmica que atravessa a tela de ponta a ponta horizontalmente.

#### Categoria IV: Armas Mágicas e Implementos Acústicos (Foco: Eco e Limiar / Controle)
46. **Tomo dos Sussurros:** Lança esferas de tinta escura que cegam os inimigos atingidos por 2 segundos.
47. **Xacran de Vidro:** Disco giratório que retorna à mão; seu dano no trajeto de volta é duplicado.
48. **Grimório Estilhaçado:** Dispara fragmentos de realidade condensada que detonam em área.
49. **Cajado da Serpente:** Deixa uma névoa venenosa persistente no ponto exato de colisão do projétil.
50. **Xacran Magnético:** Gera um campo gravitacional no centro do giro que atrai inimigos pequenos.
51. **Códice do Medo:** Inimigos expostos a seus versos sofrem uma redução de 10% em seu potencial ofensivo por 5s.
52. **Esfera Entrópica:** Artefato passivo que orbita a shamã e dispara projéteis autônomos a cada 4 segundos.
53. **Xacran de Plasma:** Deixa um rastro de fogo azul no Eixo X que incendeia a linha de solo por onde passa.
54. **Livro de Sangue:** Drena 5% do Pulso atual do conjurador para elevar o poder do próximo feitiço em +40%.
55. **Pêndulo de Prata:** Iguala temporariamente as porcentagens de barra de vida entre o Jogador 1 e o Jogador 2.
56. **Incensário de Cinzas:** Gera uma redoma de fumaça onde projéteis inimigos sofrem uma desaceleração de 50%.
57. **Xacran de Gelo Sombrio:** Aplica congelamento que veda temporariamente as habilidades dos inimigos.
58. **Tomo do Alquimista:** Altera ciclicamente o dano elemental entre Fogo, Gelo e Eletricidade a cada invocação.
59. **Orbe de Pulso:** Emite uma onda de choque de baixa frequência que limpa a linha de projéteis menores no Eixo Y.
60. **O Eco Primordial (Lendária):** Dispara feixes celestiais contínuos que perseguem automaticamente todos os alvos visíveis.

#### Categoria V: O Arsenal Improvisado de Dullant (15 Construtos Minerais D01 a D15)
* **D01 - Arco Curto de Bétula com Fio de Tendão:** Fabricação ultrarrápida com galhos e resina; cadência alta e dano leve.
* **D02 - Balista de Pedra Calcária:** Dispara lanças de pedra que esmagam escudos no Eixo X.
* **D03 - Sniper de Quartzo Lapidado:** Projeta flechas de luz perfurante com alcance de tela cheia.
* **D04 - Bacamarte de Sucata de Ferro:** Disparo cônico de curto alcance com altíssimo potencial de knockback.
* **D05 - Arco Longo de Obsidiana:** Dispara flechas de vidro negro que aplicam sangramento profundo.
* **D06 - Canhão Portátil de Bronze Rúnico:** Consome 3 barras de sucata; dispara balas explosivas que limpam o Eixo Y.
* **D07 - Besta de Repetição de Salgueiro:** Rajadas de 5 dardos envenenados disparados em rápida sucessão.
* **D08 - Lança-Dardos Magnético de Magnetita:** Dardos que curvam sua trajetória em direção ao inimigo de maior Fratura.
* **D09 - Fuzil de Cinábrio Tóxico:** Aplica envenenamento e névoa cáustica que consome armaduras.
* **D10 - Arco de Osso de Baleia Marinha:** Projeta flechas pesadas que reduzem a velocidade do alvo em 40%.
* **D11 - Canhão Sísmico de Granito:** O projétil colide com o solo e emite uma fissura que levanta os alvos no ar.
* **D12 - Besta Pesada de Chumbo Líquido:** Disparos abrasivos que reduzem a resistência física do inimigo.
* **D13 - Rifle de Sílica Férrica:** Dispara estilhaços de vidro aquecido que explodem em brasas.
* **D14 - Canhão de Fissão de Urânio (Épico):** Exige minério de urânio bruto; causa dano massivo contínuo por radiação.
* **D15 - O Olho do Bön (Lendário):** Construto de cristal puro e ferro meteórico que orbita o duelo, disparando raios laser contínuos guiados pela vontade mental de Dullant.

---

## FASE 4: ARQUITETURA DE FASES, MUNDO E BESTIÁRIO

### 4.1. Anatomia Universal de uma Fase (Template Universal)
Cada nível da jornada obedece rigorosamente a este ciclo de fluxo de arena:
1. **Segmento de Entrada:** Apresentação da mecânica ambiental ou diálogo introdutório. Sem perigo mortal imediato.
2. **Arena 1 (Combate):** Introdução aos inimigos padrão do bioma. Câmera trava nas bordas.
3. **Transição 1:** Curto corredor com barris, caixas destrutíveis e recolhimento de materiais e Ecos.
4. **Arena 2 (Pressão):** Inimigos híbridos (combinação de unidades aéreas e terrestres simultâneas).
5. **Mini-Evento / Checkpoint:** Ponto de recuperação, interação entre a dupla e acesso à árvore de talentos.
6. **Arena Final (Clímax):** Horda em grande escala que exige sincronização rigorosa de combos dos dois jogadores.
7. **Boss ou Transição:** Enfrentamento de chefe de bioma ou transição cênica para a zona de descanso.

---

### 4.2. Detalhamento dos Biomas e Fases de Campanha

```
[FASE 1: Cidade Destruída] ──► [FASE 2: Esgoto Limpo] ──► [FASE 3: Gruta Gelada (Boss: Anansi)]
           │
           ▼
[FASE 4: Bosque em Chamas (Boss: Cernunnos)] ──► [FASE 5: Vila de Fogo (Interregno/Comércio)]
           │
           ▼
[FASE 6: Pântano dos Monólitos] ──► [FASE 6.5: Vila Abandonada] ──► [FASE 7: Vale de Pedras (Boss: Mithra)]
           │
           ▼
[FASE 8: Picos Desérticos (Boss: Kallyadranoch)] ──► [FASE FINAL: O Estilhaço (Chefe: Mefitis)]
```

#### Fase 1: Cidade Destruída (Apresentação da Entropia)
* **Ambiente:** Ruínas de arquitetura gótica e basalto tomadas por névoa violeta e poeira de vidro.
* **Inimigos:** Ratos Grandes (ataques rasteiros rápidos) e Cidadãos Famintos (golpes pesados e mordidas).
* **Foco Didático:** Ensinar o uso da profundidade (Eixo Y) para escapar do cerco lateral.
* **Talento Sugerido:** *Ritmo Compartilhado* (Ataques sincronizados curam 2% de vida).

#### Fase 2: Esgoto Limpo (O Corredor de Tensão)
* **Ambiente:** Galerias subterrâneas de alvenaria antiga com reflexos dinâmicos nas poças d'água.
* **Inimigos:** Cidadãos Gordos (unidades tanque com knockback) e Baratas Humanoides (saltam do teto).
* **Mecânica de Arena:** O Eixo Y é reduzido para 120px, dificultando esquivas e exigindo defesas firmes e parry.
* **Evento de Loot:** Apresentação da escala de raridades e primeiras armas Incomuns.

#### Fase 3: Gruta Gelada (O Desafio de Precisão)
* **Ambiente:** Cavernas de gelo translúcido com formações reflexivas que duplicam feixes de luz.
* **Inimigos:** Corvos Aéreos e Corvos Humanos bípedes armados com lanças compridas.
* **Mecânica de Arena:** Pavimento de gelo com atrito reduzido; o Dash percorre +20% de distância com menor controle.
* **CHEFE: Aranha de Diamante (Anansi):**
  * *Fase 1:* Carapaça de diamante refletora de projéteis. Lança teias de vidro que imobilizam os pés no solo. Os jogadores devem focar ataques pesados nas articulações traseiras para expor o abdômen.
  * *Fase 2:* Sobe para o teto e invoca enxames de corvos gélidos. Os Marcados devem manobrar no Eixo Y para escapar de suas quedas em estaca.

#### Fase 4: Bosque em Chamas (Pressão Temporal)
* **Ambiente:** Troncos calcinados com brasas em suspensão cósmica e rasgos visíveis no céu.
* **Inimigos:** Insetos de Fogo explosivos, Árvores Bravas com raízes perfurantes e Bois-Cobra venenosos.
* **Mecânica de Arena:** *Auto-scrolling* horizontal forçado; a câmera avança inexoravelmente empurrando os jogadores contra uma barreira de chamas se hesitarem.
* **CHEFE: Lobo de Duas Cabeças (Cernunnos):**
  * *Visual:* Lobo monstruoso coberto por abcessos de sangue fervente; uma cabeça em esqueleto e outra em carne viva.
  * *Mecânica:* Dispara bolhas de sangue negro que aplicam a letal aflição *Veneno de Sangue* (drena 20% da vida total do personagem ao longo do tempo além do dano do impacto).

#### Fase 5: Vila de Fogo (Interregno Seguro)
* **Ambiente:** Refúgio protegido por Diapasões de Eco ainda intactos. Sem inimigos ativos.
* **Atividades:** Coleta de caixas de provisões, diálogo de lore, redefinição de talentos com Poeira de Eco e o **Comerciante Negro** (troca armas e armaduras aleatórias por fragmentos).

#### Fase 6: Pântano dos Monólitos Móveis
* **Ambiente:** Turfas escuras saturadas de carcaças fundidas e miasmas venenosos.
* **Inimigos:** Monólitos Móveis (blocos de lama e rocha sedimentar que despertam ao serem tocados, alguns com corpos de animais fundidos que desferem ataques inesperados).

#### Fase 6.5: Vila Abandonada (Os Sussurros do Vácuo)
* **Ambiente:** Ruínas de um povoado de madeira fossilizada envolto em silêncio fúnebre.
* **Atividades:** Baús de alto nível e presença do **NPC Polvo** (entidade do Limiar que troca habilidades ativas raras por materiais lendários).

#### Fase 7: Vale de Pedras (O Domínio Mineral)
* **Ambiente:** Desfiladeiros com monólitos e geodos flutuantes em gravidade invertida.
* **Inimigos:** Geodos Antigravitacionais mutáveis (Pedra 35%, Ferro 30%, Obsidiana 30%, Urânio 5%). Inimigos de Urânio causam radiação ao toque e garantem minério para armas lendárias.
* **CHEFE: Mithra (O Geodo de Geodos):**
  * *Mecânica Adaptativa:* Modifica seus membros instantaneamente conforme a distância da dupla: lâmina de cristal em curto alcance, canhão de lascas em médio alcance e barreira prismática em longo alcance. Periodicamente emite um feixe de laser de alta energia.

#### Fase 8: Picos Desérticos (A Fúria de Sílica)
* **Ambiente:** Dunas de areia violeta fustigadas por tempestades com vento lateral que empurra o avanço.
* **Inimigos:** Cobras de Areia subterrâneas, Louva-a-Deus de Areia, Baleias de Areia submersas e Abutres de Luz.
* **CHEFE: Kallyadranoch (O Dragão de Sílica):**
  * *Visual:* Dragão colossal de carapaça transparente com reflexos de fogo interno que ocupa metade da tela.
  * *Mecânica:* Totalmente imune a eletricidade. Emerge do subsolo quebrando o chão. Seu sopro de radiação pura derrete a areia em poças de *Vidro Fundido*, impondo lentidão e queimadura severa. A dupla deve atacar sincronizadamente as patas para derrubá-lo e acertar o núcleo de seu pescoço.

#### Fase Final: O Estilhaço (O Confronto Cósmico com Mefitis)
* **Segmento 1 (A Ascensão):** Plataformas de basalto flutuantes suspensas sobre o vácuo púrpuro do Limiar. Inimigos do tipo carrinho de mina corrompido sem trilhos e elites com auras vermelhas.
* **Segmento 2 (O Dilema do Cordeiro):** A dupla encontra um Cordeiro Imóvel atrelado a um altar. Se decidirem matá-lo, recebem o buff *Fúria do Marcado* (+50% de dano), mas Mefitis despertará em sua manifestação mais violenta e vingativa; se o pouparem, o chefe final terá 20% menos vida e os Marcados desbloquearão o final benevolente da restauração do mundo.
* **CHEFE FINAL: Mefitis (Batalha em 3 Atos):**
  * *Ato 1 (O Pesadelo Esquelético):* Luta travada em breu absoluto com iluminação restrita aos pés dos Marcados. Mefitis atua como uma monstruosidade insetoide esquelética com ataques de agarrão físico e mental que mesclam temporariamente os atributos dos dois jogadores.
  * *Ato 2 (A Lacraia de Clones):* A cabeça de Mefitis despenca, revelando uma mandíbula de lacraia abissal que cospe clones sombrios perfeitos de Dit, Dullant, Dren e Duja. Os clones utilizam exatamente os mesmos talentos e armas equipados pelos jogadores, emulando seus padrões de movimento e dash dos últimos 5 minutos de jogo.
  * *Ato 3 (O Prisma de Luz Vermelha):* Transição marcada por distorção e falhas gráficas na interface (*glitch visual*). Mefitis converte-se no coração geométrico do Véu quebrado. A batalha transforma-se em um combate de altíssima precisão espacial: o prisma flutua no centro disparando terremotos sísmicos no Eixo X (exigem pulo) e rajadas contínuas de laser que varrem o Eixo Y (exigem movimentação tridimensional para cima e para baixo).
* **Desfecho:** Ao estilhaçar o prisma, a Fenda da Entropia colapsa sobre si mesma. O Véu é religado; as águas e a gravidade voltam à calmaria, mas as cicatrizes geológicas e as marcas na carne dos sobreviventes permanecem para sempre como lembrança do Cataclismo.

---

## FASE 5: ROADMAP DE PRODUÇÃO E DIRETRIZES DE BALANCEAMENTO

### 5.1. Marcos de Desenvolvimento e Entregas (Milestones)

```
[MARCO 1: FUNDAÇÃO CORE] ──► [MARCO 2: COMBATE & 4 CLASSES] ──► [MARCO 3: FASES & LEVEL DESIGN]
         │                                                                   │
         ▼                                                                   ▼
[MARCO 4: ARSENAL & TALENTOS] ────────────────────────────────► [MARCO 5: POLIMENTO & VERCEL DEPLOY]
```

* **Marco 1: Fundação do Motor e Movimento 2.5D (Sprints 1 a 4)**
  * Configuração do motor Phaser.js em pipeline WebGL nativo sem limites de hardware.
  * Implementação da física dos eixos X (avanço) e Y (profundidade com 150-200px).
  * Criação dos colisores de arena dinâmica com disparo de `ON_ARENA_CLEAR`.
  * Sistema de animações básicas sobre a base Universal LPC Spritesheet.
* **Marco 2: As Quatro Classes e Paridade de Combate (Sprints 5 a 8)**
  * Codificação da máquina de estados marciais: Dit (Mimetismo de armas), Dullant (Forja de reagentes), Dren (Hyper-armor e armas pesadas) e Duja (Cânticos e catalisadores leves).
  * Implementação da barra de Eco, Pulso e I-frames do Dash (150ms).
  * Ensaios laboratoriais de balanceamento matemático para assegurar equivalência de DPS e tempo de sobrevivência das 4 classes.
* **Marco 3: Estrutura de Biomas e Bestiário (Sprints 9 a 14)**
  * Construção das Fases 1 a 8 e Zonas de Interregno (Vila de Fogo e Vila Abandonada).
  * Inteligência Artificial de inimigos normais e implementação dos chefes: Anansi, Cernunnos, Mithra, Kallyadranoch e Mefitis (3 Atos).
  * Integração dos perigos de arena (chão de gelo escorregadio, auto-scrolling e plataformas de vidro).
* **Marco 4: Catálogo de Talentos e Economia de Loot (Sprints 15 a 18)**
  * Programação da árvore com os 120 talentos e validação dos pré-requisitos de pontos.
  * Sistema de inventário de 20 slots com navegação D-Pad, lógica de descarte e fragmentação para Poeira de Eco.
  * Catalogação e balanceamento numérico das 60 armas fixas e dos 15 construtos de Dullant.
* **Marco 5: Polimento Audiovisual e Lançamento na Vercel (Sprints 19 a 22)**
  * Renderização de efeitos de hitstop (3 a 5 frames), flash de dano e distorção de corte de realidade.
  * Balanceamento do modo cooperativo local/online com sincronia via WebSockets.
  * Otimização do bundle no ecossistema da Vercel garantindo carregamento instantâneo de assets via CDN.

### 5.2. Protocolo de Testes de Balanceamento e Paridade
Para assegurar que nenhuma classe quebre a regra de ouro de paridade de poder, os testes em ambiente de homologação obedecem a métricas rígidas:
1. **Métrica TTK (Time-To-Kill):** Em arenas de controle contra 6 inimigos normais de mesmo nível, o tempo médio de eliminação deve permanecer na janela de **22 a 26 segundos** para todas as 4 classes em suas builds base.
2. **Métrica EHP (Effective Health Pool):** A tolerância a dano antes do abatimento em combate contínuo não pode variar mais de 10% entre os quatro Marcados (levando em consideração que a menor vida de Duja é compensada por seu distanciamento e escudos, e a lentidão de Dren é compensada por seu lifesteal e armadura).
3. **Auditoria de Talentos de Risco:** Monitoramento rigoroso dos talentos *Ruína Sincronizada* (Instakill) e *Véu Absoluto* (Modo Deus) para certificar que seus pré-requisitos de atributos altos (18-20 pontos) e condições de ativação (3 dashes perfeitos seguidos) impeçam o abuso desmedido em lutas de chefes.
