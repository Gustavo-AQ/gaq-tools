# GAQ Tools

Hub de ferramentas da GAQ CLOUD, feito com Vite, React, TypeScript e React Router no modo declarativo.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Verificação

```sh
npm test
npm run lint
npm run build
npm run preview
```

## Estrutura

- `src/layouts/AppLayout.tsx`: navegação, cabeçalho, rodapé e acessibilidade na troca de páginas.
- `src/pages/`: início, salário, fusos e página não encontrada.
- `src/components/`: ícones e estrutura compartilhada de prévia das ferramentas.
- `src/index.css`: estilos globais.
- `src/App.css`: layout e adaptações para telas menores.

Rotas: `/`, `/salary` e `/timezones`. URLs desconhecidas mostram uma página 404 dentro da aplicação.

A calculadora de salário está funcional: valores anuais, mensais, semanais e por hora; jornada ajustável; BRL → BRL; oito moedas; cotação diária, cache local e taxa manual. O conversor de fusos também está funcional, com conversão por data e comparação de jornadas.

## Cálculos e câmbio

O cálculo normaliza o valor para o ano e deriva os demais períodos usando 12 meses, horas por semana e semanas remuneradas por ano. Os padrões são 44 h/semana e 52 semanas/ano. Não inclui impostos, taxas, benefícios ou 13º. Valores monetários aceitam formato brasileiro (5.000,50); ponto com três dígitos é interpretado como milhar.

A API https://open.er-api.com/v6/latest/BRL é consultada apenas para moedas diferentes no modo automático. Nenhum valor salarial é enviado. O cache guarda somente taxas e datas até a próxima atualização informada. Em falhas, a última cotação salva é sinalizada; sem cache, o usuário pode informar uma taxa manual. Não são usadas taxas fixas inventadas. O cache pode ser indisponível sem impedir a consulta. A atribuição ao provedor é exibida junto da cotação.

Testes usam o executor nativo do Node 24, sem dependências adicionais, e cobrem períodos, limites, formato numérico, câmbio e falhas de rede/cache.

## Publicação futura

O build gera `dist/`. Como a navegação usa BrowserRouter, configure a hospedagem estática para servir `index.html` nas rotas da aplicação (fallback SPA). Isso permite acessar e recarregar `/salary` e `/timezones` diretamente. Nenhuma publicação faz parte desta etapa.

Referência: https://reactrouter.com/start/declarative/routing

## Fusos e jornadas

- `/timezones` converte data e hora entre fusos IANA, com UTC na origem e America/Sao_Paulo no destino inicial.
- As cidades mais usadas aparecem primeiro; outros fusos disponíveis no navegador também podem ser escolhidos.
- O resultado mostra data completa, offset UTC, diferença de horário e mudança de dia.
- A comparação usa um expediente e uma disponibilidade em datas explícitas, com duração real e janela em comum. Não há repetição semanal nem desconto automático de pausas.
- Fim anterior ao início significa dia seguinte; início igual ao fim é rejeitado.
- A data da disponibilidade acompanha o início convertido até o usuário escolher outra data.
- Horários inexistentes em transições de relógio são rejeitados. Horários repetidos exigem escolher a primeira ou segunda ocorrência, com a mesma escolha aplicada aos campos da página.
- Os cálculos são locais, usando @js-temporal/polyfill e a base de fusos do navegador. Nenhuma data ou jornada é enviada a APIs. A rota é carregada sob demanda.
- Datas aceitas: 1900 a 2100. Regras futuras podem mudar; manter o navegador atualizado mantém sua base de fusos atualizada.

Os testes de fusos cobrem horário de verão, horários inexistentes/repetidos, fusos fracionários, mudança de dia, duração real, intervalos noturnos e sobreposição total/parcial/ausente.

Referência da biblioteca: https://github.com/js-temporal/temporal-polyfill
By - https://github.com/Gustavo-AQ