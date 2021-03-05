# Squad Admin

Sistema admistrativo criado para demonstrar um CRUD completo, utilizando uma API [GraphQL](https://graphql.org/) com [Apollo Server](https://www.apollographql.com/docs/apollo-server/) e o frondend em [React JS](https://pt-br.reactjs.org/).

## Sobre o projeto

---

O projeto foi desenvolvido com o tema [SB Admin 2](https://startbootstrap.com/theme/sb-admin-2) oferecido gratuitamente pelo [Start Bootstrap](https://startbootstrap.com/), feito em HTML/CSS com [Bootstrap 4](https://getbootstrap.com/docs/4.6/getting-started/introduction/).

O mesmo foi convertido em [React JS](https://pt-br.reactjs.org/) por [Fabricio Pereira Rabelo](https://fabricioprabelo.com.br/) para se comunicar de forma fluente com as funcionalidades do React.

## Estrutura de pastas

---

O Projeto foi desenvolvido em duas partes, sendo o **backend** nosso servidor API [GraphQL](https://graphql.org/) e o **frondend** a interface do usuário projetada em React.

## Configuração e instalação

---

É necessário que você possua instalado em seu computador o [Node JS](https://nodejs.org/en/) (prefenrêncialmente uma versão do tipo LTS), o servidor de banco de dados [MongoDB](https://www.mongodb.com/) e um editor de texto, recomendo o [Visual Studio Code](https://code.visualstudio.com/) para edição.

### Configurando e instalando o servidor

1 - Crie um arquivo .env na raiz da pasta **backend**, copie o exemplo abaixo para o seu .env e configure de acordo com a sua necessidade.

```env
APP_NAME="nome do seu servidor: ex. squad"
SERVER_PORT="porta do servidor. ex: 4000"
SERVER_HOST="endereço host do servidor sem http. ex: localhost"
SERVER_URL="endereço público da aplicação. ex: http://localhost:4000 <- se barra no final"

TOKEN_EXPIRES="tempo de expiração do token, em dias. ex: 7"
TOKEN_SECRET="chave para criptografia do token. ex: a1s2d3f4z1x2c3v4"

PAGING_MAX_RESULTS_PER_PAGE="resultado máximo de registros por página, para paginação. ex: 100"
PAGING_RESULTS_PER_PAGE="resultado padrão de registros por página. ex: 15"

TIMEZONE="timezone do seu servidor: ex. america/sao_paulo"
LOG_LEVEL="nível de exibição e gravação de logs. aceita: fatal, info, erro, debug e warn"

USER_ACTIVATION_EMAIL="endereço de recebimento de e-mails de ativação de contas"
SMTP_FROM="endereço de e-mail remetente para envio de mensagens"
SMTP_HOST="endereço do servidor de e-mails smtp"
SMTP_USER="usuário do servidor de e-mails smtp"
SMTP_PASS="senha do usuário do servidor de e-mails smtp"
SMTP_PORT="porta do servidor de e-mails smtp"
SMTP_ENABLE_SSL="servidor smtp usa ssl? valors aceitos: true ou false"

COMPANY_NAME="nome da empresa ou do seu site público"
COMPANY_URL="endereço url da sua empresa"
COMPANY_ADDRESS="endereço da empresa"

```

As configurações **COMPANY_NAME**, **COMPANY_URL** e **COMPANY_ADDRESS**, são utilizadas no corpo dos templates de emails, localizado em _backend/views_ que podem ser editadas conforme sua necessidade.

2 - Crie um arquivo **ormconfig.json** na raiz do servidor em _backend_ com as seguintes configurações:

```json
{
    "type": "mongodb",
    "host": "database host",
    "port": 27017,
    "database": "database",
    "username": "database username",
    "password": "database password",
    "useUnifiedTopology": true,
    "entities": ["src/types/*.ts"]
}
```

3 - Tendo configurado o **_.env_** e **_ormconfig.json_** acesse um terminal Linux/Mac ou prompt de comando Windows, altere para a pasta do projeto _path/backend_ e execute os seguintes comando:

```bash
npm install ou yarn install
npm run seed:dev ou yarn seed:dev
```

4 - Ainda no terminal ou prompt você já pode rodar o servidor executando o comando:

```bash
npm run dev ou yarn dev
```

### Configurando a aplicação de interface

1 - Configure um arquivo _.env_ na raíz da pasta _frontend/_ com as seguintes configurações:

```env
REACT_APP_SITE_NAME="nome da aplicação"
REACT_APP_TOKEN_SECRET="a mesma chave de criptografia de token usada no .env do servidor"
REACT_APP_RECORDS_PER_PAGE="número de registros por páginas"
REACT_APP_GRAPHQL_SERVER="endereço do servidor api"
REACT_APP_DATETIME_FORMAT="formato de fata e hora. padrão: DD/MM/YYYY HH:mm"
REACT_APP_TIMEZONE="timezone do servidor de aplicação. ex: America/Sao_Paulo"
```

2 - Execute o comando abaixo para instalar as dependências da aplicação:

```bash
npm install ou yarn install
```

3 - Execute o comando abaixo para executar o servidor de desenvolvimento da aplicação:

```bash
npm start ou yarn start
```

**OBS:** Você pode encontrar um arquivo .env de exemplo tanto para o servidor de api quanto para o servidor de aplicação em suas respectivas pastas, nomeados como .env.example.
