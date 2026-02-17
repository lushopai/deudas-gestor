package com.gastos.gastos_compartidos.config;

import com.gastos.gastos_compartidos.security.RateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig implements WebMvcConfigurer {

        private final RateLimitInterceptor rateLimitInterceptor;

        @Override
        public void addInterceptors(InterceptorRegistry registry) {
                registry.addInterceptor(rateLimitInterceptor)
                                .addPathPatterns("/api/**")
                                .excludePathPatterns(
                                                "/api/public/**",
                                                "/actuator/**",
                                                "/swagger-ui/**",
                                                "/v3/api-docs/**");
        }

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {

                registry.addResourceHandler("/**")
                                .addResourceLocations("classpath:/static/")
                                .resourceChain(true);
        }

        @Override
        public void addViewControllers(ViewControllerRegistry registry) {

                registry.addViewController("/{spring:[^\\.]*}")
                                .setViewName("forward:/index.html");
                registry.addViewController("/**/{spring:[^\\.]*}")
                                .setViewName("forward:/index.html");
        }
}
