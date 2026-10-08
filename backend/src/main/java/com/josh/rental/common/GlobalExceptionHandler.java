package com.josh.rental.common;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Turns exceptions into clean JSON responses instead of stack traces.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Bean Validation failed (@NotBlank, @Min, @PastOrPresent, ...) -> 400 with one message per field. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
        return ResponseEntity.badRequest().body(
                ApiError.of(400, "Bad Request", "Validation failed", fieldErrors));
    }

    /**
     * JSON could not be converted to the Java types at all, e.g. "abc" for a number,
     * "2024-13-45" for a date, or "TOASTER" for an enum. -> 400 naming the field.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        if (ex.getCause() instanceof InvalidFormatException ife && !ife.getPath().isEmpty()) {
            String field = ife.getPath().get(ife.getPath().size() - 1).getFieldName();
            String expected = ife.getTargetType().isEnum()
                    ? "one of " + java.util.Arrays.toString(ife.getTargetType().getEnumConstants())
                    : "a valid " + ife.getTargetType().getSimpleName();
            fieldErrors.put(field, "Must be " + expected);
        }
        return ResponseEntity.badRequest().body(
                ApiError.of(400, "Bad Request", "Request body is malformed or has wrong data types", fieldErrors));
    }

    /** e.g. GET /api/items/abc where a number is expected. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(
                ApiError.of(400, "Bad Request", "Invalid value for parameter '" + ex.getName() + "'", Map.of()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiError.of(404, "Not Found", ex.getMessage(), Map.of()));
    }

    /** Business rule violations, e.g. deleting an item that is currently rented out. */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiError.of(409, "Conflict", ex.getMessage(), Map.of()));
    }
}
