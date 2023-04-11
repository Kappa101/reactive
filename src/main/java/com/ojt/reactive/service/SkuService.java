package com.ojt.reactive.service;

import reactor.core.publisher.Mono;

import java.util.List;

public interface SkuService {


    /**
     * Get all skus
     *
     * @return list of skus
     */
    Mono<List<String>> getSkus();
}
