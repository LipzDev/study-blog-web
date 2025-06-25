# StudyBlog Frontend

Frontend moderno para o StudyBlog, desenvolvido com Next.js 12, TypeScript, Tailwind CSS e React Hook Form.

## 🚀 Tecnologias

- **Next.js 12** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **Atomic Design** - Metodologia de organização de componentes

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── atoms/          # Componentes básicos (Button, Input, etc.)
│   ├── molecules/      # Componentes compostos (LoginForm, PostCard, etc.)
│   ├── organisms/      # Componentes complexos (Header, Footer, etc.)
│   └── templates/      # Layouts (Layout principal)
├── hooks/              # Hooks personalizados (useAuth)
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── types/              # Definições de tipos TypeScript
├── utils/              # Utilitários (schemas, helpers)
└── styles/             # Estilos globais
```

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

5. Acesse [http://localhost:3001](http://localhost:3001)

## 📋 Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Registro de nova conta
- Recuperação de senha
- Verificação de email
- Redefinição de senha

### 📝 Postagens
- Visualização de postagens recentes na página inicial
- Listagem completa com paginação
- Busca e filtros por data
- Visualização individual de postagens
- Criação, edição e exclusão (para usuários autorizados)

### 👥 Usuários
- Sistema de roles (USER, ADMIN, SUPER_ADMIN)
- Controle de acesso baseado em permissões
- Perfil do usuário

### 🎨 Interface
- Design responsivo e moderno
- Componentes reutilizáveis
- Animações e transições suaves
- Acessibilidade

## 🔧 Configuração da API

O frontend se conecta com a API backend através do serviço `apiService`. Certifique-se de que:

1. A API está rodando na URL configurada em `NEXT_PUBLIC_API_URL`
2. As rotas da API estão funcionando corretamente
3. O CORS está configurado adequadamente

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (até 767px)

## 🎯 Próximos Passos

- [ ] Implementar dashboard do usuário
- [ ] Adicionar sistema de comentários
- [ ] Implementar upload de imagens
- [ ] Adicionar notificações em tempo real
- [ ] Implementar sistema de tags/categorias
- [ ] Adicionar busca avançada
- [ ] Implementar modo escuro

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
