package com.ojt.reactive.service.impl;

import com.ojt.reactive.service.OfferService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class OfferServiceImpl implements OfferService {
    private final WebClient webClient;

    @Value("${ojt.base.url: null}")
    private String baseUrl;

    public OfferServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8081").build();
    }

    @Override
    public Mono<String> getOffer(String productId) {
        return webClient.get().uri("/getOffers?productId=" + productId)
                .retrieve()
                .bodyToMono(String.class)
                .retry(3)
                .doOnError(e -> log.error("Error while fetching offer for productId : [{}] , thread: [{}] , exception: [{}] ", productId, Thread.currentThread().getName(), e.getMessage()));
    }
}
