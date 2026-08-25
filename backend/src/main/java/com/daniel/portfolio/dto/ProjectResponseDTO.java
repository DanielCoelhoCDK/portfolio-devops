package com.daniel.portfolio.dto;

import com.daniel.portfolio.model.Project;
import com.daniel.portfolio.model.Technology;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.stream.Collectors;

public record ProjectResponseDTO(
        Long id,
        String title,
        String description,
        String imageUrl,
        String githubUrl,
        String demoUrl,
        OffsetDateTime createdAt,
        Set<String> technologies) {
    public static ProjectResponseDTO fromEntity(Project project) {
        Set<String> techNames = project.getTechnologies()
                .stream()
                .map(Technology::getName)
                .collect(Collectors.toSet());

        return new ProjectResponseDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getImageUrl(),
                project.getGithubUrl(),
                project.getDemoUrl(),
                project.getCreatedAt(),
                techNames);
    }
}