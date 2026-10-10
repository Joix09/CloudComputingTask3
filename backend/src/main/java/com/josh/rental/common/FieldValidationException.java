package com.josh.rental.common;

/** A field broke a rule that annotations can't express, e.g. more days than this item allows. -> 400 */
public class FieldValidationException extends RuntimeException {

    private final String field;

    public FieldValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
