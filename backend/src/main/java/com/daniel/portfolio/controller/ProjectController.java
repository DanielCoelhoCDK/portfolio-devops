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
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final TechnologyRepository technologyRepository;

    public ProjectController(ProjectRepository projectRepository, TechnologyRepository technologyRepository) {
        this.projectRepository = projectRepository;
        this.technologyRepository = technologyRepository;
    }

    @GetMapping
    public List<ProjectResponseDTO> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(ProjectResponseDTO::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(project -> ResponseEntity.ok(ProjectResponseDTO.fromEntity(project)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@Valid @RequestBody ProjectRequestDTO dto) {
        Project project = new Project();
        mapDtoToEntity(dto, project);

        Project savedProject = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProjectResponseDTO.fromEntity(savedProject));
    }

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