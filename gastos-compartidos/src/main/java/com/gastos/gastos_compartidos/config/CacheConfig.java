package com.gastos.gastos_compartidos.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de caché en memoria.
 * Usa ConcurrentMapCacheManager (sin dependencias externas como Redis).
 * Los caches se reinician con el servidor.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("categorias");
    }
}
