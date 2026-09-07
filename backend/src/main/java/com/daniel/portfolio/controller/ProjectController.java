package com.daniel.portfolio.controller;

import com.daniel.portfolio.dto.ProjectRequestDTO;
import com.daniel.portfolio.dto.ProjectResponseDTO;
import com.daniel.portfolio.model.Project;
import com.daniel.portfolio.model.Technology;
import com.daniel.portfolio.repository.ProjectRepository;
import com.daniel.portfolio.repository.TechnologyRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
/**
 * Controller REST para consulta e manutenção dos projetos do portfólio.
 *
 * <p>Recurso base: {@code /api/projects}. As respostas de sucesso usam
 * {@link ProjectResponseDTO}; as operações de criação e atualização recebem
 * {@link ProjectRequestDTO} no corpo da requisição.</p>
 *
 * <p>Contrato do corpo {@code ProjectRequest}:</p>
 * <pre>{@code
 * {
 *   "title": "Nome do projeto",
 *   "description": "Descrição do projeto",
 *   "imageUrl": "https://example.com/image.png",
 *   "githubUrl": "https://github.com/example/project",
 *   "demoUrl": "https://example.com",
 *   "technologies": ["Java", "Spring Boot"]
 * }
 * }</pre>
 */
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final TechnologyRepository technologyRepository;

    public ProjectController(ProjectRepository projectRepository, TechnologyRepository technologyRepository) {
        this.projectRepository = projectRepository;
        this.technologyRepository = technologyRepository;
    }

    /**
     * Lista todos os projetos cadastrados.
     *
     * <p><strong>HTTP:</strong> {@code GET /api/projects}</p>
     *
     * @return lista de projetos representados por {@link ProjectResponseDTO}
     * @apiNote Retorna {@code 200 OK} com uma lista JSON. Quando não existem
     * projetos, a lista retornada é vazia.
     */
    @GetMapping
    public List<ProjectResponseDTO> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(ProjectResponseDTO::fromEntity)
                .toList();
    }

            /**
             * Busca um projeto pelo identificador.
             *
             * <p><strong>HTTP:</strong> {@code GET /api/projects/{id}}</p>
             *
             * @param id identificador numérico do projeto
             * @return {@code 200 OK} com o projeto ou {@code 404 Not Found} quando o
             * projeto não existe
             */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(project -> ResponseEntity.ok(ProjectResponseDTO.fromEntity(project)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

            /**
             * Cria um novo projeto.
             *
             * <p><strong>HTTP:</strong> {@code POST /api/projects}</p>
             *
             * <p><strong>Request body:</strong> {@link ProjectRequestDTO} em JSON.
             * Os campos {@code title} e {@code description} são obrigatórios;
             * {@code imageUrl}, {@code githubUrl}, {@code demoUrl} e
             * {@code technologies} são opcionais. Cada item de {@code technologies}
             * é associado ao projeto e uma tecnologia inexistente é criada.</p>
             *
             * @param dto dados do projeto a ser criado
             * @return {@code 201 Created} com o projeto persistido e seu identificador
             * gerado
             */
    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@Valid @RequestBody ProjectRequestDTO dto) {
        Project project = new Project();
        mapDtoToEntity(dto, project);

        Project savedProject = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProjectResponseDTO.fromEntity(savedProject));
    }

    /**
     * Atualiza um projeto existente.
     *
     * <p><strong>HTTP:</strong> {@code PUT /api/projects/{id}}</p>
     *
     * <p><strong>Request body:</strong> {@link ProjectRequestDTO} em JSON.
     * O corpo segue o mesmo contrato do endpoint de criação: {@code title} e
     * {@code description} são obrigatórios e os demais campos são opcionais.</p>
     *
     * @param id identificador numérico do projeto a atualizar
     * @param dto novos dados do projeto
     * @return {@code 200 OK} com o projeto atualizado ou {@code 404 Not Found}
     * quando o projeto não existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> updateProject(@PathVariable Long id,
            @Valid @RequestBody ProjectRequestDTO dto) {
        return projectRepository.findById(id)
                .map(project -> {
                    mapDtoToEntity(dto, project);
                    Project updated = projectRepository.save(project);
                    return ResponseEntity.ok(ProjectResponseDTO.fromEntity(updated));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

            /**
             * Remove um projeto existente.
             *
             * <p><strong>HTTP:</strong> {@code DELETE /api/projects/{id}}</p>
             *
             * <p>A remoção também elimina as associações do projeto com tecnologias,
             * conforme a regra de integridade referencial do banco de dados.</p>
             *
             * @param id identificador numérico do projeto a remover
             * @return {@code 204 No Content} quando removido ou {@code 404 Not Found}
             * quando o projeto não existe
             */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void mapDtoToEntity(ProjectRequestDTO dto, Project project) {
        project.setTitle(dto.title());
        project.setDescription(dto.description());
        project.setImageUrl(dto.imageUrl());
        project.setGithubUrl(dto.githubUrl());
        project.setDemoUrl(dto.demoUrl());

        if (dto.technologies() != null) {
            Set<Technology> techEntities = new HashSet<>();
            for (String techName : dto.technologies()) {
                Technology tech = technologyRepository.findByNameIgnoreCase(techName.trim())
                        .orElseGet(() -> technologyRepository.save(new Technology(null, techName.trim())));
                techEntities.add(tech);
            }
            project.setTechnologies(techEntities);
        }
    }
}