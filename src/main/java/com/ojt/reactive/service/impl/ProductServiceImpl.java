package com.ojt.reactive.service.impl;

import com.ojt.reactive.service.OfferService;
import com.ojt.reactive.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


@Slf4j
@Service
public class ProductServiceImpl implements ProductService {
    private final WebClient webClient;

    @Value("${ojt.base.url: null}")
    private String baseUrl;

    public ProductServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8081").build();
    }


    @Override
    public Mono<String> getProduct(String skuId) {
        return webClient.get().uri("/getProducts?skuId=" + skuId)
                .retrieve()
                .bodyToMono(String.class)
                .retry(3)
                .doOnError(e -> log.error("Error while fetching product for skuId [{}] , thread: [{}] , exception: [{}] ", skuId, Thread.currentThread().getName(), e.getMessage()));
    }
}
