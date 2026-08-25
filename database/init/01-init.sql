-- Criação da tabela de tecnologias
CREATE TABLE IF NOT EXISTS technologies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Criação da tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela associativa (N:N)
CREATE TABLE IF NOT EXISTS project_technologies (
    project_id BIGINT NOT NULL,
    technology_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, technology_id),
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_technology FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE
);