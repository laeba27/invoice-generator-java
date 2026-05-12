package com.invoice.config;

import com.invoice.template.entity.PredefinedTemplate;
import com.invoice.template.repository.PredefinedTemplateRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class TemplateSeeder {

    @Bean
    CommandLineRunner initTemplates(PredefinedTemplateRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(Arrays.asList(
                        new PredefinedTemplate(null, "Standard", 120L, "/templates/standard.png"), // Mock initial counts for "popularity" data
                        new PredefinedTemplate(null, "Classy", 350L, "/templates/classy.png"),
                        new PredefinedTemplate(null, "Modern", 85L, "/templates/modern.png")
                ));
            }
        };
    }
}
