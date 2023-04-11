package com.ojt.reactive.facade;

import com.ojt.reactive.service.OfferService;
import com.ojt.reactive.service.ProductService;
import com.ojt.reactive.service.SkuService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.function.Function;


@Service
public class OfferFacade {

    private final SkuService skuService;
    private final ProductService productService;
    private final OfferService offerService;

    public OfferFacade(SkuService skuService, ProductService productService, OfferService offerService) {
        this.skuService = skuService;
        this.productService = productService;
        this.offerService = offerService;
    }

    public Flux<String> getOffers() {
        return skuService.getSkus()
                .flatMapMany(Flux::fromIterable)
                .concatMap(productService::getProduct, 1)
                .flatMap(delayElements(Duration.ofSeconds(1)))
                .concatMap(offerService::getOffer, 1)
                .flatMap(delayElements(Duration.ofSeconds(1)));
    }

    private <T> Function<T, Mono<T>> delayElements(Duration duration) {
        return t -> Mono.just(t).delaySubscription(duration);
    }

}
