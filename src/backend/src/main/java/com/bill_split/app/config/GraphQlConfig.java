package com.bill_split.app.config;

import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

@Configuration
public class GraphQlConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        GraphQLScalarType uploadScalar = GraphQLScalarType.newScalar()
                .name("Upload")
                .description("A custom scalar that handles file uploads")
                .coercing(new graphql.schema.Coercing<Object, Object>() {
                    @Override
                    public Object serialize(Object dataFetcherResult) { return dataFetcherResult; }
                    @Override
                    public Object parseValue(Object input) { return input; }
                    @Override
                    public Object parseLiteral(Object input) { return input; }
                })
                .build();

        return wiringBuilder -> wiringBuilder.scalar(uploadScalar);
    }
}