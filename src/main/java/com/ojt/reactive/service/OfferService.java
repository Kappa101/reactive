package com.ojt.reactive.service;

import reactor.core.publisher.Mono;


public interface OfferService {

    /**
     * Get offer details
     *
     * @param productId
     * @return offer details
     */
    Mono<String> getOffer(String productId);

}
