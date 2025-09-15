# Projeto Exemplo

Projeto para a disciplina de backend.

---

## Primeiro passo — rodar com Docker Compose

1. Certifique-se de ter Docker e Docker Compose instalados.
2. No diretório do projeto, execute:
```bash
docker-compose up --build
```

---

## Segundo passo — rodar localmente com npm

1. Instale dependências:
```bash
npm install
```
2. Inicie em modo de desenvolvimento:
```bash
npm run dev
```

---

## Rodando as migrations do Prisma

1. Configure a variável de ambiente `DATABASE_URL` (por exemplo em um `.env`) apontando para seu banco de dados.

2. Instale o Prisma CLI (se ainda não estiver instalado):
```bash
npm install prisma --save-dev
npm install @prisma/client
```

3. Gere o cliente Prisma (após alterar `schema.prisma`):
```bash
npx prisma generate
```

4. Crie e aplique migrations:
```bash
# Criar uma nova migration com uma descrição
npx prisma migrate dev --name descricao_da_migration

# Aplicar migrations existentes (em ambientes de produção, usar migrate deploy)
npx prisma migrate deploy
```

5. Opcional — inspecionar o esquema e banco:
```bash
# Abrir o Studio para visualizar dados
npx prisma studio
```

---