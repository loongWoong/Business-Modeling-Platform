package com.jianmo.platform.config;

import com.jianmo.platform.meta.factory.MetaModelFactory;
import com.jianmo.platform.meta.registry.MetaRegistry;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetaConfig {

    @Bean
    public CommandLineRunner initMetaRegistry(MetaRegistry metaRegistry, MetaModelFactory factory) {
        return args -> {
            metaRegistry.register(factory.createModelMetaModel());
            metaRegistry.register(factory.createPropertyMetaModel());
            metaRegistry.register(factory.createDatasourceMetaModel());
            metaRegistry.register(factory.createETLTaskMetaModel());
            metaRegistry.register(factory.createDomainMetaModel());
            metaRegistry.register(factory.createMappingMetaModel());
            metaRegistry.register(factory.createRelationMetaModel());
            // 注册语义层元模型
            metaRegistry.register(factory.createSharedAttributeMetaModel());
            metaRegistry.register(factory.createIndicatorMetaModel());
            metaRegistry.register(factory.createFunctionMetaModel());
            // 注册数据血缘元模型
            metaRegistry.register(factory.createDataLineageMetaModel());
        };
    }
}
