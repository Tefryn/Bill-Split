package com.bill_split.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;

/**
 * Configures a RedisTemplate that stores raw bytes instead of strings. This
 * lets you push/pop Protobuf-serialized messages to Redis queues.
 *
 * Usage (injecting): private final RedisTemplate<String, byte[]> redis;
 *
 * Usage (pushing): redis.opsForList().rightPush("queue-name",
 * myProtoMessage.toByteArray());
 *
 * Usage (popping): byte[] data = redis.opsForList().leftPop("queue-name",
 * Duration.ofSeconds(30)); MyMessage msg = MyMessage.parseFrom(data);
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, byte[]> byteArrayRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, byte[]> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(RedisSerializer.string());
        template.setValueSerializer(RedisSerializer.byteArray());
        return template;
    }
}
