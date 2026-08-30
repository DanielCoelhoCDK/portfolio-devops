import React, { useEffect, useState, useCallback } from 'react';
import type { Project, ProjectRequest } from './types/project';
import { getProjects, createProject, deleteProject, checkBackendHealth } from './services/api';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('Todos');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, isHealthy] = await Promise.all([
        getProjects(),
        checkBackendHealth()
      ]);
      setProjects(data);
      setBackendOnline(isHealthy);
    } catch {
      showToast('Erro ao carregar dados da API Spring Boot', 'error');
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && techInput.trim()) {
      e.preventDefault();
      const newTech = techInput.trim().replace(',', '');
      if (!technologies.includes(newTech)) {
        setTechnologies([...technologies, newTech]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Título e descrição são obrigatórios', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload: ProjectRequest = {
        title,
        description,
        githubUrl: githubUrl || undefined,
        demoUrl: demoUrl || undefined,
        imageUrl: imageUrl || undefined,
        technologies: technologies.length > 0 ? technologies : ['Docker'],
      };

      await createProject(payload);
      showToast('HTTP 201 Created: Arquitetura implantada com sucesso!');
      setModalOpen(false);
      resetForm();
      loadData();
    } catch {
      showToast('Falha ao conectar com o backend Spring Boot', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      showToast('Projeto removido com sucesso!');
      loadData();
    } catch {
      showToast('Erro ao excluir projeto', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGithubUrl('');
    setDemoUrl('');
    setImageUrl('');
    setTechInput('');
    setTechnologies([]);
  };

  const filteredProjects = selectedTag === 'Todos'
    ? projects
    : projects.filter((p) => p.technologies?.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  const defaultFilterTags = ['Todos', 'Kubernetes', 'Docker', 'Terraform', 'Spring Boot', 'AWS'];

  return (
    <div className="bg-background text-on-surface antialiased flex flex-col min-h-screen font-sans">
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-4 md:px-10 h-16 w-full max-w-7xl mx-auto">
          {/* Brand & Status */}
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#hero" className="text-xl md:text-2xl font-bold text-primary tracking-tighter cursor-pointer font-mono">
              Daniel Coelho <span className="text-on-surface text-base font-normal hidden sm:inline">| DevOps & Infra</span>
            </a>

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border ${backendOnline
              ? 'bg-secondary/10 border-secondary text-secondary'
              : 'bg-red-500/10 border-red-500 text-red-400'
              }`}>
              <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-secondary pulse-green' : 'bg-red-500'}`} />
              {backendOnline ? 'API Spring Boot: Online' : 'API: Offline'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex gap-6 h-full items-center font-mono text-sm">
            <a href="#projects" className="text-on-surface-variant hover:text-primary transition-colors h-full flex items-center px-2">
              Projetos
            </a>
            <a href="#about" className="text-on-surface-variant hover:text-primary transition-colors h-full flex items-center px-2">
              Sobre Mim
            </a>
            <a href="https://github.com/DanielCoelhoCDK" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors h-full flex items-center px-2">
              GitHub
            </a>
            <a href="https://linkedin.com/in/antoniodanielcoelho" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors h-full flex items-center px-2">
              LinkedIn
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => { resetForm(); setModalOpen(true); }}
              className="flex items-center gap-1.5 bg-primary text-on-primary px-3.5 py-1.5 rounded font-mono text-xs font-bold hover:bg-primary-fixed transition-all active:scale-95 shadow-[0_0_12px_rgba(76,215,246,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Novo Projeto
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-28 pb-16 px-4 md:px-10 w-full max-w-7xl mx-auto space-y-20">

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="hero">
          {/* Coluna da Esquerda */}
          <div className="lg:col-span-8 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs">
              <span className="material-symbols-outlined text-[14px]">terminal</span>
              Infrastructure & Cloud DevOps Engineer
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-on-surface max-w-3xl leading-tight">
              Olá, sou o <span className="text-primary drop-shadow-[0_0_10px_rgba(76,215,246,0.5)]">Daniel Coelho</span>.
            </h1>

            <p className="text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Profissional de Infraestrutura e DevOps com mais de 10 anos de experiência em redes corporativas, Linux, virtualização e arquiteturas de alta disponibilidade. Aqui apresento meus projetos práticos com contêineres, automação e orquestração.
            </p>

            {/* Quick Metrics com Efeito Glow e Leve Zoom */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 w-full max-w-xl">
              <div className="bg-surface-container border border-outline-variant/30 p-3 rounded glow-border transition-all duration-300 hover:scale-[1.03] hover:border-primary cursor-default shadow-md">
                <div className="font-mono text-xl font-bold text-primary">10+ Anos</div>
                <div className="text-xs text-on-surface-variant font-mono">Infra & Suporte</div>
              </div>
              <div className="bg-surface-container border border-outline-variant/30 p-3 rounded glow-border transition-all duration-300 hover:scale-[1.03] hover:border-primary cursor-default shadow-md">
                <div className="font-mono text-xl font-bold text-secondary">Full-Stack</div>
                <div className="text-xs text-on-surface-variant font-mono">Java + React + SQL</div>
              </div>
              <div className="bg-surface-container border border-outline-variant/30 p-3 rounded col-span-2 sm:col-span-1 glow-border transition-all duration-300 hover:scale-[1.03] hover:border-primary cursor-default shadow-md">
                <div className="font-mono text-xl font-bold text-primary">DevOps</div>
                <div className="text-xs text-on-surface-variant font-mono">Docker & K8s</div>
              </div>
            </div>

            {/* Tech Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {defaultFilterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full font-mono text-xs transition-all ${selectedTag === tag
                    ? 'ghost-badge text-primary font-bold'
                    : 'bg-surface-variant text-on-surface-variant border border-outline-variant/60 hover:border-primary hover:text-primary'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Coluna da Direita: Foto */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />

              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-primary/50 shadow-2xl bg-surface-container">
                <img
                  src="/profile.jpeg"
                  alt="Daniel Coelho"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="absolute -bottom-2 right-4 bg-surface-container-highest/90 backdrop-blur border border-primary/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-secondary pulse-green" />
                <span className="font-mono text-[11px] text-on-surface">Available for Hire</span>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid Section */}
        <section id="projects">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/30 pb-3">
            <h2 className="text-xl font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">folder_open</span>
              Projetos em Destaque
            </h2>
            <div className="font-mono text-xs text-on-surface-variant opacity-70">
              {filteredProjects.length} projeto(s) encontrado(s)
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <article key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden flex flex-col opacity-70">
                  <div className="h-48 w-full bg-surface-variant animate-pulse" />
                  <div className="p-5 flex flex-col flex-grow gap-3">
                    <div className="h-6 bg-surface-variant rounded w-3/4 animate-pulse" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-surface-variant rounded w-full animate-pulse" />
                      <div className="h-4 bg-surface-variant rounded w-5/6 animate-pulse" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 bg-surface-container/30 border border-dashed border-outline-variant/40 rounded-xl">
              <span className="material-symbols-outlined text-5xl text-outline mb-2">folder_off</span>
              <p className="font-mono text-sm text-on-surface-variant">Nenhum projeto encontrado para o filtro selecionado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden flex flex-col group glow-border transition-all duration-300 shadow-lg"
                >
                  <div className="h-48 w-full bg-surface-container relative overflow-hidden">
                    <img
                      src={project.imageUrl || 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=800&auto=format&crop=entropy'}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow gap-2">
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant flex-grow leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies?.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 border border-primary/30 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-[#334155] bg-surface-container/50 flex justify-between items-center">
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          title="View GitHub"
                        >
                          <span className="material-symbols-outlined text-[20px]">code</span>
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          title="Live Demo"
                        >
                          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-on-surface-variant hover:text-red-400 transition-colors"
                      title="Delete Project"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Seção Sobre Mim */}
        <section id="about" className="pt-6">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/30 pb-3">
            <h2 className="text-xl font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Sobre Mim
            </h2>
            <div className="font-mono text-xs text-on-surface-variant opacity-70">
              whoami & skills
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bio / Background */}
            <div className="lg:col-span-7 bg-[#1e293b] border border-[#334155] rounded-xl p-6 glow-border transition-all duration-300">
              <h3 className="font-mono text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">badge</span>
                Trajetória Profissional
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                Com mais de 10 anos de experiência na área de Tecnologia da Informação, minha atuação abrange administração de servidores Linux/Windows, redes corporativas, segurança perimetral (firewalls) e virtualização.
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Atualmente, foco na convergência entre infraestrutura e desenvolvimento através da cultura DevOps: automação de ambientes com Docker e Kubernetes, infraestrutura declarativa com Terraform e desenvolvimento de APIs modernas com Spring Boot e React.
              </p>

              <div className="flex flex-wrap gap-3 pt-2 border-t border-[#334155]">
                <a
                  href="https://linkedin.com/in/antoniodanielcoelho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0077b5]/10 border border-[#0077b5]/40 text-[#00a0dc] font-mono text-xs font-semibold hover:bg-[#0077b5]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">launch</span>
                  Conectar no LinkedIn
                </a>
                <a
                  href="https://github.com/DanielCoelhoCDK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-surface-container border border-outline-variant/50 text-on-surface font-mono text-xs font-semibold hover:border-primary hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">code</span>
                  Explorar Repositórios
                </a>
              </div>
            </div>

            {/* Core Competencies Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 glow-border">
                <div className="font-mono text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">cloud</span>
                  Cloud & DevOps
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-mono">
                  Docker, Docker Compose, Kubernetes, CI/CD Pipelines, Terraform, Linux Server, GitOps
                </p>
              </div>

              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 glow-border">
                <div className="font-mono text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">router</span>
                  Infraestrutura & Redes
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-mono">
                  Virtualização (Proxmox/VMware), Firewalls UTM/NGFW, Roteamento, DNS, VPNs, Monitoramento
                </p>
              </div>

              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 glow-border">
                <div className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">code_blocks</span>
                  Desenvolvimento & Dados
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-mono">
                  Java (Spring Boot 3), REST APIs, PostgreSQL, React, TypeScript, Tailwind CSS
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Pessoal */}
      <footer className="w-full py-8 bg-surface-container-lowest border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center px-4 md:px-10 gap-4 mt-auto">
        <div className="font-mono text-xs text-on-surface-variant">
          © 2026 Daniel Coelho • Desenvolvido com Spring Boot, React, Docker & PostgreSQL
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-on-surface-variant">
          <a href="https://github.com/DanielCoelhoCDK" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            GitHub
          </a>
          <span>•</span>
          <a href="https://linkedin.com/in/antoniodanielcoelho" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            LinkedIn
          </a>
          <span>•</span>
          <a href="#hero" className="hover:text-primary transition-colors">
            Voltar ao Topo
          </a>
        </div>
      </footer>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 glass-modal" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#1e293b] border border-outline-variant/50 rounded-xl shadow-2xl w-full max-w-xl z-10 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#334155]">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 font-mono">
                <span className="material-symbols-outlined text-primary">add_box</span>
                Deploy New Architecture
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-red-400 p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1">Project.Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Cluster EKS com Terraform"
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1">Architecture.Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva a arquitetura, fluxo e tecnologias..."
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-on-surface text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant mb-1">Repository.URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant mb-1">Endpoint / Demo URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.example.com"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1">Image.URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1">Tech.Stack [] (pressione Enter após cada tag)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  placeholder="Ex: Kubernetes, Terraform, Docker"
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-primary font-mono text-xs focus:outline-none focus:border-primary"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {technologies.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleRemoveTech(t)}
                      className="font-mono text-xs bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500 transition-colors flex items-center gap-1"
                    >
                      {t} <span className="material-symbols-outlined text-[12px]">close</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#334155] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-[#334155] text-on-surface-variant font-mono text-xs hover:bg-[#334155] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-primary text-on-primary font-mono text-xs font-bold hover:bg-primary-fixed transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(76,215,246,0.3)] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  {submitting ? 'Deploying...' : 'Deploy Architecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110]">
          <div className={`px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-[#00b954]/20 text-[#6bff8f] border-[#00b954]'
            : 'bg-red-950 text-red-300 border-red-500'
            }`}>
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-mono text-xs">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;