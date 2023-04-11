package com.ojt.reactive.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * @author chandraprakash
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @Autowired
    private ObjectMapper mapper;

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<String> handleWebClientResponseException(WebClientResponseException e) {
        HttpStatus status = e.getStatusCode();
        String message = "An error occurred while calling the external API: ";

        ErrorDetail error = ErrorDetail.of(message, e.getMessage());

        return ResponseEntity.status(status).body(error.toString());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception e) throws JsonProcessingException {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = "An internal error occurred: ";
        ErrorDetail error = ErrorDetail.of(message, e.getMessage());
        String errorResp = mapper.writeValueAsString(error);
        return ResponseEntity.status(status).body(errorResp);
    }
}
