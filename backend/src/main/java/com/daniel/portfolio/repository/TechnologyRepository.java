package com.daniel.portfolio.repository;

import com.daniel.portfolio.model.Technology;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechnologyRepository extends JpaRepository<Technology, Long> {
    Optional<Technology> findByNameIgnoreCase(String name);
}