package com.ojt.reactive.service.impl;

import com.ojt.reactive.service.OfferService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


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
                .retry(3) // Retry the call up to 3 times
                .onErrorResume(e -> Mono.just("ProductUnavailable"));
    }
}
