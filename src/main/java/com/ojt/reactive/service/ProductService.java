package com.ojt.reactive.service;

import reactor.core.publisher.Mono;


public interface ProductService {

    /**
     * Get product details
     * @param skuId
     * @return product details
     */
    Mono<String> getProduct(String skuId);
}
