package com.ojt.reactive.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author chandraprakash
 */

@Data
@AllArgsConstructor(staticName = "of")
public class ErrorDetail {
    private String message;
    private String details;




}
