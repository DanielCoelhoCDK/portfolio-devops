/*
 * Schema inicial do banco de dados do Portfolio DevOps.
 *
 * Modelo relacional:
 * - technologies armazena o catálogo de tecnologias.
 * - projects armazena os projetos publicados no portfólio.
 * - project_technologies implementa o relacionamento N:N entre projetos e
 *   tecnologias.
 *
 * Índices criados implicitamente pelo PostgreSQL:
 * - Cada PRIMARY KEY cria um índice B-tree único para sua chave.
 * - technologies.name recebe um índice B-tree único por causa da restrição
 *   UNIQUE.
 * - project_technologies recebe um índice B-tree composto pela PRIMARY KEY
 *   (project_id, technology_id), eficiente para buscas iniciadas por projeto.
 *
 * Observação: restrições de FOREIGN KEY não criam índices automaticamente no
 * PostgreSQL. Consultas iniciadas por technology_id ou operações frequentes de
 * exclusão podem justificar um índice adicional nessa coluna.
 */

/*
 * technologies: catálogo reutilizável de tecnologias.
 *
 * Relacionamento: uma tecnologia pode estar associada a vários projetos por
 * meio de project_technologies. O nome é único para evitar duplicidade lógica.
 */
CREATE TABLE IF NOT EXISTS technologies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE technologies IS
    'Catálogo de tecnologias associadas aos projetos do portfólio.';
COMMENT ON COLUMN technologies.id IS
    'Identificador único da tecnologia; a PRIMARY KEY cria um índice B-tree.';
COMMENT ON COLUMN technologies.name IS
    'Nome da tecnologia; NOT NULL e UNIQUE, com índice B-tree único implícito.';

/*
 * projects: entidade principal do portfólio.
 *
 * Relacionamento: um projeto pode utilizar várias tecnologias. A associação
 * é mantida em project_technologies, e não diretamente nesta tabela.
 */
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE projects IS
    'Projetos publicados no portfólio e seus dados de apresentação.';
COMMENT ON COLUMN projects.id IS
    'Identificador único do projeto; a PRIMARY KEY cria um índice B-tree.';
COMMENT ON COLUMN projects.created_at IS
    'Data e hora de criação do registro, preenchida por padrão pelo banco.';

/*
 * project_technologies: tabela associativa do relacionamento N:N.
 *
 * Cada linha representa uma associação única entre um projeto e uma
 * tecnologia. As duas FOREIGN KEYS garantem integridade referencial:
 * - project_id referencia projects.id.
 * - technology_id referencia technologies.id.
 *
 * ON DELETE CASCADE remove automaticamente as associações quando o projeto
 * ou a tecnologia referenciada é excluída. A PRIMARY KEY composta impede
 * associações duplicadas e cria um índice B-tree em (project_id,
 * technology_id). Não há índices independentes nas FKs neste schema.
 */
CREATE TABLE IF NOT EXISTS project_technologies (
    project_id BIGINT NOT NULL,
    technology_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, technology_id),
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_technology FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE
);

COMMENT ON TABLE project_technologies IS
    'Tabela associativa que implementa o relacionamento N:N entre projetos e tecnologias.';
COMMENT ON COLUMN project_technologies.project_id IS
    'FK para projects.id; exclusão do projeto remove suas associações.';
COMMENT ON COLUMN project_technologies.technology_id IS
    'FK para technologies.id; exclusão da tecnologia remove suas associações.';