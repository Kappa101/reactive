package com.ojt.reactive.service.impl;

import com.ojt.reactive.service.OfferService;
import com.ojt.reactive.service.ProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


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
                .onErrorResume(e -> Mono.just("OfferUnavailable"));
    }
}
