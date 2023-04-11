package com.ojt.reactive.controller;

import com.ojt.reactive.facade.OfferFacade;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

/**
 * @author chandraprakash
 */
@RestController
public class ProductController {

    private final OfferFacade offerFacade;

    private static final String DEFAULT_MESSAGE = "No offers available";

    public ProductController(OfferFacade offerFacade) {
        this.offerFacade = offerFacade;
    }

    @GetMapping(value = "/getOffers", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getOffers() {
        return offerFacade.getOffers();
    }
}
