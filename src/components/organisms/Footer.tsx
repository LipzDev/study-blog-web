import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  function handleOpenTerms() {
    setShowTerms(true);
  }

  function handleCloseTerms() {
    setShowTerms(false);
  }

  function handleOpenPrivacy() {
    setShowPrivacy(true);
  }

  function handleClosePrivacy() {
    setShowPrivacy(false);
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">StudyBlog</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Uma plataforma moderna para compartilhar conhecimento e
              experiências de estudo. Conecte-se com outros estudantes e aprenda
              juntos.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Postagens
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Entrar
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenTerms}
                  className="text-gray-300 hover:text-white transition-colors underline outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenPrivacy}
                  className="text-gray-300 hover:text-white transition-colors underline outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  Política de Privacidade
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} StudyBlog. Todos os direitos
            reservados.
          </p>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg max-w-lg w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseTerms}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 focus:outline-none"
              aria-label="Fechar"
              tabIndex={0}
            >
              <span aria-hidden="true" className="text-3xl leading-none">
                ×
              </span>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Termos de Uso
            </h2>
            <p className="text-sm text-gray-500 mb-2 text-center">
              Última atualização: 07/07/2025
            </p>
            <div className="space-y-4 text-sm">
              <p>
                Bem-vindo ao <b>StudyBlog</b>. Ao acessar ou usar nosso site,
                você concorda com os termos abaixo. Leia com atenção.
              </p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  <b>Aceitação dos Termos</b>
                  <br />
                  Ao usar o StudyBlog, você concorda em cumprir estes Termos de
                  Uso. Caso não concorde, por favor, não utilize o site.
                </li>
                <li>
                  <b>Cadastro de Usuários</b>
                  <br />
                  Você pode se cadastrar para criar e compartilhar conteúdos. O
                  uso de informações falsas ou de terceiros é proibido.
                </li>
                <li>
                  <b>Publicação de Conteúdo</b>
                  <br />
                  Você é integralmente responsável por todo conteúdo que
                  publicar. Isso inclui textos, imagens, links e qualquer outro
                  tipo de dado.
                  <br />
                  O StudyBlog não se responsabiliza por conteúdos publicados por
                  usuários.
                  <br />
                  Não é permitido publicar:
                  <ul className="list-disc pl-6 mt-1">
                    <li>
                      Conteúdo ofensivo, ilegal, discriminatório ou difamatório;
                    </li>
                    <li>
                      Spam, publicidade não autorizada ou links maliciosos;
                    </li>
                    <li>
                      Material protegido por direitos autorais sem autorização.
                    </li>
                  </ul>
                  Reservamo-nos o direito de remover qualquer conteúdo que viole
                  estes termos, sem aviso prévio.
                </li>
                <li>
                  <b>Direitos Autorais</b>
                  <br />O conteúdo publicado por você permanece seu, mas ao
                  postar no site, você nos concede uma licença não exclusiva
                  para exibir, armazenar e divulgar esse conteúdo no StudyBlog.
                </li>
                <li>
                  <b>Encerramento de Contas</b>
                  <br />
                  Podemos suspender ou excluir contas que violem estes termos,
                  sem necessidade de aviso prévio.
                </li>
                <li>
                  <b>Limitação de Responsabilidade</b>
                  <br />O uso do StudyBlog é por sua conta e risco. Não
                  garantimos a disponibilidade, exatidão ou segurança do
                  conteúdo publicado.
                </li>
                <li>
                  <b>Alterações nos Termos</b>
                  <br />
                  Estes termos podem ser atualizados a qualquer momento.
                  Recomendamos revisar periodicamente. O uso contínuo do site
                  após alterações implica aceitação.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Privacidade */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg max-w-lg w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleClosePrivacy}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 focus:outline-none"
              aria-label="Fechar"
              tabIndex={0}
            >
              <span aria-hidden="true" className="text-3xl leading-none">
                ×
              </span>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Política de Privacidade
            </h2>
            <p className="text-sm text-gray-500 mb-2 text-center">
              Última atualização: 07/07/2025
            </p>
            <div className="space-y-4 text-sm">
              <p>
                Nós respeitamos sua privacidade. Esta Política explica como
                coletamos, usamos e protegemos suas informações.
              </p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  <b>Informações Coletadas</b>
                  <br />
                  Ao usar nosso site, podemos coletar:
                  <ul className="list-disc pl-6 mt-1">
                    <li>
                      Informações fornecidas por você: nome, e-mail, conteúdos
                      publicados;
                    </li>
                    <li>
                      Informações de navegação: cookies, endereço IP, tipo de
                      navegador, data e hora de acesso.
                    </li>
                  </ul>
                </li>
                <li>
                  <b>Uso das Informações</b>
                  <br />
                  Usamos suas informações para:
                  <ul className="list-disc pl-6 mt-1">
                    <li>Permitir que você publique e interaja no site;</li>
                    <li>Manter a segurança da plataforma;</li>
                    <li>
                      Enviar comunicações, quando necessário (ex: redefinição de
                      senha).
                    </li>
                  </ul>
                </li>
                <li>
                  <b>Compartilhamento</b>
                  <br />
                  Não vendemos, alugamos ou compartilhamos suas informações
                  pessoais com terceiros, exceto quando exigido por lei ou para
                  proteção legal do site.
                </li>
                <li>
                  <b>Cookies</b>
                  <br />
                  Usamos cookies para melhorar sua experiência. Você pode
                  desativá-los nas configurações do seu navegador, mas isso pode
                  afetar a funcionalidade do site.
                </li>
                <li>
                  <b>Segurança</b>
                  <br />
                  Adotamos medidas razoáveis para proteger suas informações, mas
                  não podemos garantir segurança total contra acessos não
                  autorizados.
                </li>
                <li>
                  <b>Seus Direitos</b>
                  <br />
                  Você pode solicitar:
                  <ul className="list-disc pl-6 mt-1">
                    <li>A exclusão de sua conta e dados pessoais;</li>
                    <li>A correção de informações incorretas;</li>
                    <li>Informações sobre os dados que temos sobre você.</li>
                  </ul>
                  Entre em contato pelo e-mail:{" "}
                  <a
                    href="mailto:contato.devweb@hotmail.com"
                    className="underline text-blue-600"
                  >
                    contato.devweb@hotmail.com
                  </a>
                </li>
                <li>
                  <b>Alterações nesta Política</b>
                  <br />
                  Esta Política pode ser atualizada a qualquer momento. Ao
                  continuar usando o site, você concorda com as alterações.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
