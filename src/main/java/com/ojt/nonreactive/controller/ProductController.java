package com.ojt.nonreactive.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * @author chandraprakash
 */
@RestController
public class ProductController {

    @GetMapping("/getSku")
    public List<String> getSku() throws InterruptedException {
        Thread.sleep(5_000);
        return Arrays.asList("sku1", "sku2", "sku3", "sku4", "sku5", "sku6", "sku7", "sku8", "sku9", "sku10", "sku11", "sku12", "sku13", "sku14", "sku15", "sku16", "sku17", "sku18", "sku19", "sku20", "sku21", "sku22", "sku23", "sku24", "sku25", "sku26", "sku27", "sku28", "sku29", "sku30", "sku31", "sku32", "sku33", "sku34", "sku35", "sku36", "sku37", "sku38", "sku39", "sku40", "sku41", "sku42", "sku43", "sku44", "sku45", "sku46", "sku47", "sku48", "sku49", "sku50", "sku51", "sku52", "sku53", "sku54", "sku55", "sku56", "sku57", "sku58", "sku59", "sku60", "sku61", "sku62", "sku63", "sku64", "sku65", "sku66", "sku67", "sku68", "sku69", "sku70", "sku71", "sku72", "sku73", "sku74", "sku75", "sku76", "sku77", "sku78", "sku79", "sku80", "sku81", "sku82", "sku83", "sku84", "sku85", "sku86", "sku87", "sku88", "sku89", "sku90", "sku91", "sku92", "sku93", "sku94", "sku95", "sku96", "sku97", "sku98", "sku99", "sku100", "sku101", "sku102", "sku103", "sku104", "sku105", "sku106", "sku107", "sku108", "sku109", "sku110", "sku111", "sku112", "sku113", "sku114", "sku115", "sku116", "sku117", "sku118", "sku119", "sku120", "sku121", "sku122", "sku123", "sku124", "sku125", "sku126", "sku127", "sku128", "sku129", "sku130", "sku131", "sku132", "sku133", "sku134", "sku135", "sku136", "sku137", "sku138", "sku139", "sku140", "sku141", "sku142", "sku143", "sku144", "sku145", "sku146", "sku147", "sku148", "sku149", "sku150", "sku151", "sku152", "sku153", "sku154", "sku155", "sku156", "sku157", "sku158", "sku159", "sku160", "sku161", "sku162", "sku163", "sku164", "sku165", "sku166", "sku167", "sku168", "sku169", "sku170", "sku171", "sku172");
    }

    @GetMapping("/getProducts")
    public String getProducts(@RequestParam("skuId") String skuId) throws InterruptedException {
        Thread.sleep(5000); // Add a delay of 5 seconds
        return skuId.replace("sku", "product");
    }


    @GetMapping("/getOffers")
    public String getOffers(@RequestParam("productId") String productId) throws InterruptedException {
        Thread.sleep(5000); // Add a delay of 5 seconds
        return productId.replace("product", "offer");
    }
}
