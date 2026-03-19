// prisma/seed.ts
// Script de seed para popular o banco com dados iniciais
// Executar: npm run prisma:seed

import { PrismaClient, Role, WikiType, WikiStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco GerminaPedia...');

  // ─── Usuários ───────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const editorPassword = await bcrypt.hash('Editor@123', 10);
  const readerPassword = await bcrypt.hash('Reader@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@germinapedia.com' },
    update: {},
    create: {
      email: 'admin@germinapedia.com',
      name: 'Administrador',
      password: adminPassword,
      role: Role.ADMIN,
      bio: 'Administrador do sistema GerminaPedia',
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@germinapedia.com' },
    update: {},
    create: {
      email: 'editor@germinapedia.com',
      name: 'Editor Principal',
      password: editorPassword,
      role: Role.EDITOR,
    },
  });

  await prisma.user.upsert({
    where: { email: 'leitor@germinapedia.com' },
    update: {},
    create: {
      email: 'leitor@germinapedia.com',
      name: 'Leitor Exemplo',
      password: readerPassword,
      role: Role.READER,
    },
  });

  console.log('✅ Usuários criados');

  // ─── Salas ───────────────────────────────────────────────
  const sala2022 = await prisma.sala.upsert({
    where: { nome_ano: { nome: 'Turma A', ano: 2022 } },
    update: {},
    create: {
      nome: 'Turma A',
      ano: 2022,
      descricao: 'Turma A do ano de 2022',
      turno: 'Manhã',
      capacidade: 30,
    },
  });

  const sala2023 = await prisma.sala.upsert({
    where: { nome_ano: { nome: 'Turma B', ano: 2023 } },
    update: {},
    create: {
      nome: 'Turma B',
      ano: 2023,
      descricao: 'Turma B do ano de 2023',
      turno: 'Tarde',
      capacidade: 28,
    },
  });

  console.log('✅ Salas criadas');

  // ─── Alunos ───────────────────────────────────────────────
  const aluno1 = await prisma.aluno.upsert({
    where: { matricula: '2022001' },
    update: {},
    create: {
      nome: 'Ana Lima',
      matricula: '2022001',
      email: 'ana.lima@escola.com',
      salaId: sala2022.id,
      bio: 'Apaixonada por ciências e leitura.',
    },
  });

  const aluno2 = await prisma.aluno.upsert({
    where: { matricula: '2022002' },
    update: {},
    create: {
      nome: 'Carlos Souza',
      matricula: '2022002',
      email: 'carlos.souza@escola.com',
      salaId: sala2022.id,
    },
  });

  const aluno3 = await prisma.aluno.upsert({
    where: { matricula: '2023001' },
    update: {},
    create: {
      nome: 'Beatriz Santos',
      matricula: '2023001',
      salaId: sala2023.id,
    },
  });

  console.log('✅ Alunos criados');

  // ─── Eventos ─────────────────────────────────────────────
  const evento1 = await prisma.evento.create({
    data: {
      titulo: 'Formatura Turma A 2022',
      descricao: 'Cerimônia de formatura da Turma A do ano de 2022.',
      dataInicio: new Date('2022-12-10'),
      tipo: 'Formatura',
      salas: { create: [{ salaId: sala2022.id }] },
      alunos: {
        create: [{ alunoId: aluno1.id }, { alunoId: aluno2.id }],
      },
    },
  });

  const evento2 = await prisma.evento.create({
    data: {
      titulo: 'Excursão ao Museu 2023',
      descricao: 'Visita ao Museu Nacional com a Turma B.',
      dataInicio: new Date('2023-08-15'),
      tipo: 'Excursão',
      salas: { create: [{ salaId: sala2023.id }] },
      alunos: { create: [{ alunoId: aluno3.id }] },
    },
  });

  console.log('✅ Eventos criados');

  // ─── Histórias ────────────────────────────────────────────
  const historia1 = await prisma.historia.create({
    data: {
      titulo: 'A história da GerminaPedia',
      descricao: 'Como nasceu o projeto e sua missão de preservar memórias escolares.',
      destaque: true,
      alunos: {
        create: [
          { alunoId: aluno1.id },
          { alunoId: aluno2.id },
          { alunoId: aluno3.id },
        ],
      },
      eventos: { create: [{ eventoId: evento1.id }] },
    },
  });

  console.log('✅ Histórias criadas');

  // ─── Wikis ───────────────────────────────────────────────
  // Wiki da Sala 2022
  await prisma.wiki.create({
    data: {
      slug: 'turma-a-2022',
      titulo: 'Turma A — 2022',
      resumo: 'Página oficial da Turma A do ano de 2022',
      conteudo: `# Turma A — 2022

Bem-vindos à wiki da **Turma A de 2022**!

## Sobre a Turma

A Turma A foi uma das turmas mais participativas do ano de 2022, com 30 alunos dedicados.

## Principais Eventos

- 🎓 **Formatura** — Dezembro de 2022

## Alunos em Destaque

- Ana Lima — Monitora de Ciências
- Carlos Souza — Representante de Turma

## Galeria

_Em breve..._
`,
      tipo: WikiType.SALA,
      status: WikiStatus.PUBLISHED,
      tags: ['turma-a', '2022', 'sala'],
      criadoPorId: admin.id,
      editadoPorId: admin.id,
      sala: { connect: { id: sala2022.id } },
      versoes: {
        create: {
          titulo: 'Turma A — 2022',
          conteudo: '# Turma A — 2022\n\nVersão inicial.',
          numero: 1,
          autorId: admin.id,
          comentario: 'Versão inicial criada no seed',
        },
      },
    },
  });

  // Wiki do Aluno Ana Lima
  await prisma.wiki.create({
    data: {
      slug: 'aluno-ana-lima',
      titulo: 'Ana Lima',
      resumo: 'Página wiki da aluna Ana Lima',
      conteudo: `# Ana Lima

**Matrícula:** 2022001  
**Turma:** Turma A — 2022

## Sobre

Ana é apaixonada por ciências e leitura. Foi monitora voluntária durante todo o ano de 2022.

## Participações

- Formatura Turma A 2022

## Contribuições

> "A escola foi onde descobri que adoro ensinar." — Ana Lima
`,
      tipo: WikiType.ALUNO,
      status: WikiStatus.PUBLISHED,
      tags: ['aluno', 'ana-lima', '2022'],
      criadoPorId: editor.id,
      aluno: { connect: { id: aluno1.id } },
    },
  });

  // Wiki do Evento Formatura
  await prisma.wiki.create({
    data: {
      slug: 'formatura-turma-a-2022',
      titulo: 'Formatura Turma A 2022',
      resumo: 'Cerimônia de formatura da Turma A — Dezembro 2022',
      conteudo: `# Formatura Turma A 2022

**Data:** 10 de Dezembro de 2022  
**Local:** Auditório Principal  

## Sobre o Evento

A cerimônia de formatura marcou o encerramento do ano letivo de 2022 com emoção e celebração.

## Programação

1. Abertura com o Hino Nacional
2. Discurso da Diretoria
3. Entrega dos diplomas
4. Discurso do representante dos alunos — Carlos Souza
5. Celebração

## Participantes

- **Turma A** — 30 alunos
`,
      tipo: WikiType.EVENTO,
      status: WikiStatus.PUBLISHED,
      tags: ['formatura', '2022', 'evento', 'turma-a'],
      criadoPorId: admin.id,
      evento: { connect: { id: evento1.id } },
    },
  });

  // Wiki da História
  await prisma.wiki.create({
    data: {
      slug: 'historia-germinapedia',
      titulo: 'A História da GerminaPedia',
      resumo: 'Como o projeto nasceu e evoluiu',
      conteudo: `# A História da GerminaPedia

A GerminaPedia nasceu da necessidade de **preservar as memórias escolares** de forma colaborativa.

## Origem

O projeto foi iniciado por alunos e professores que perceberam que as histórias da escola se perdiam com o tempo.

## Missão

> Germinar significa fazer crescer. A GerminaPedia faz crescer a memória coletiva da nossa escola.

## Como Contribuir

Qualquer membro da comunidade escolar pode criar e editar wikis sobre:
- Alunos e suas trajetórias
- Salas e turmas ao longo dos anos
- Eventos e acontecimentos marcantes
- Histórias que merecem ser contadas
`,
      tipo: WikiType.HISTORIA,
      status: WikiStatus.PUBLISHED,
      tags: ['historia', 'germinapedia', 'sobre'],
      criadoPorId: admin.id,
      historia: { connect: { id: historia1.id } },
    },
  });

  console.log('✅ Wikis criadas');
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('  Admin:  admin@germinapedia.com  | Admin@123');
  console.log('  Editor: editor@germinapedia.com | Editor@123');
  console.log('  Leitor: leitor@germinapedia.com | Reader@123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
