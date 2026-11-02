INSERT INTO modulos (id, titulo, descricao, ordem) VALUES
 (1, 'Organização financeira pessoal', 'Primeiros passos para entender para onde vai seu dinheiro.', 1),
 (2, 'Planejamento de orçamento', 'Como montar e seguir um orçamento mensal.', 2),
 (3, 'Juros simples e compostos', 'Entenda como os juros trabalham a favor ou contra você.', 3),
 (4, 'Cartão de crédito e endividamento', 'Use o crédito com consciência e saia das dívidas.', 4),
 (5, 'Conceitos básicos de investimentos', 'Renda fixa, renda variável, risco e liquidez.', 5),
 (6, 'Reserva de emergência', 'Por que ter, quanto guardar e onde deixar.', 6);
SELECT setval('modulos_id_seq', 6);

INSERT INTO conteudos (modulo_id, titulo, corpo, ordem) VALUES
 (1, 'Anote tudo o que você gasta', 'Durante 30 dias registre cada gasto, por menor que seja. Esse retrato é a base de qualquer decisão financeira.', 1),
 (1, 'Gastos fixos x variáveis', 'Gastos fixos se repetem todo mês (aluguel, internet). Variáveis mudam (lazer, delivery). Comece cortando os variáveis.', 2),
 (2, 'A regra 50-30-20', '50% da renda para necessidades, 30% para desejos e 20% para objetivos e investimentos. Ajuste à sua realidade.', 1),
 (2, 'Revisão mensal do orçamento', 'No fim de cada mês compare o planejado com o realizado e ajuste as categorias do mês seguinte.', 2),
 (3, 'Juros simples', 'No juro simples a taxa incide sempre sobre o valor inicial: J = C · i · n.', 1),
 (3, 'Juros compostos', 'No juro composto os juros rendem juros: M = C · (1 + i)^n. É o motor dos investimentos de longo prazo.', 2),
 (4, 'Como funciona a fatura', 'Pagar só o mínimo leva ao rotativo, uma das taxas mais altas do mercado. Pague sempre o total.', 1),
 (4, 'Saindo das dívidas', 'Liste dívidas por taxa de juros, negocie as mais caras primeiro e evite novas parcelas até se reorganizar.', 2),
 (5, 'Risco, retorno e liquidez', 'Todo investimento equilibra três fatores: quanto pode render, quanto pode perder e quão rápido vira dinheiro.', 1),
 (5, 'Renda fixa para iniciantes', 'Tesouro Direto e CDBs com garantia do FGC são bons pontos de partida para quem está começando.', 2),
 (6, 'Quanto guardar', 'O recomendado é de 3 a 6 meses do seu custo de vida mensal, ou mais se sua renda for instável.', 1),
 (6, 'Onde deixar a reserva', 'Escolha aplicações seguras e com liquidez diária, como Tesouro Selic ou CDB com liquidez diária.', 2);
