package com.ojt.reactive.service.impl;

import com.ojt.reactive.service.SkuService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


@Slf4j
@Service
public class SkuServiceImpl implements SkuService {
    private final WebClient webClient;

    private static final List<String> EMPTY_LIST = new ArrayList<>();

    @Value("${ojt.base.url: null}")
    private String baseUrl;

    public SkuServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8081").build();
    }

    @Override
    public Mono<List<String>> getSkus() {
        return webClient.get().uri("/getSku")
                .retrieve()
                .bodyToMono(String.class)
                .map(skuList -> Arrays.asList(skuList.split(",")))
                .retry(3)
                .doOnError(e -> log.error("Error while fetching sku list: {}", e.getMessage()))
                .onErrorReturn(EMPTY_LIST);

    }
}
