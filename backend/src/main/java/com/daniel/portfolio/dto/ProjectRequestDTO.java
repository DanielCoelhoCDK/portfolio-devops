package com.daniel.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record ProjectRequestDTO(
        @NotBlank(message = "O título é obrigatório") @Size(max = 100, message = "O título deve ter no máximo 100 caracteres") String title,

        @NotBlank(message = "A descrição é obrigatória") String description,

        String imageUrl,
        String githubUrl,
        String demoUrl,
        Set<String> technologies) {
}