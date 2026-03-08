package com.bill_split.app.config;

import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.web.multipart.MultipartFile;

/**
 * Configures custom GraphQL scalars, including the Upload scalar for file uploads.
 */
@Configuration
public class GraphQLScalarConfiguration {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
            .scalar(GraphQLScalarType.newScalar()
                .name("Upload")
                .description("A custom scalar that represents a file upload")
                .coercing(new Coercing<MultipartFile, Void>() {
                    
                    @Override
                    public Void serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        // Upload scalar is only used for input, never output
                        throw new CoercingSerializeException("Upload scalar cannot be serialized");
                    }

                    @Override
                    public MultipartFile parseValue(Object input) throws CoercingParseValueException {
                        // Spring Boot GraphQL handles MultipartFile automatically
                        if (input instanceof MultipartFile) {
                            return (MultipartFile) input;
                        }
                        throw new CoercingParseValueException("Expected MultipartFile");
                    }

                    @Override
                    public MultipartFile parseLiteral(Object input) throws CoercingParseLiteralException {
                        // Literals are not supported for file uploads
                        throw new CoercingParseLiteralException("Upload scalar cannot be provided as a literal");
                    }
                })
                .build());
    }
}
