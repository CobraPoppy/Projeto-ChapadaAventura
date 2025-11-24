# Chapada Trilhas - Portfólio de Trilhas da Chapada Diamantina

Projeto full-stack para divulgação de trilhas da Chapada Diamantina, com:

- Frontend estático (HTML, CSS, JS)
- Backend Node.js + Express + TypeScript
- PostgreSQL
- Arquitetura limpa + SOLID
- AOP via wrapper `withAspects` (logging, auth, validações, auditoria)
- Painel administrativo
- Docker & Docker Compose

## Requisitos

- Docker e Docker Compose
OU
- Node 20+
- PostgreSQL 16+

## Instalação com Docker

```bash
cp .env.example .env
docker-compose up --build
