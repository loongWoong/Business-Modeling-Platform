package com.jianmo.platform.meta.validation;

import com.jianmo.platform.meta.MetaModel;
import com.jianmo.platform.meta.MetaProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ValidationResult {
    private boolean valid;
    private List<String> errors;

    private ValidationResult(boolean valid, List<String> errors) {
        this.valid = valid;
        this.errors = errors;
    }

    public static ValidationResult success() {
        return new ValidationResult(true, new ArrayList<>());
    }

    public static ValidationResult failure(String error) {
        List<String> errors = new ArrayList<>();
        errors.add(error);
        return new ValidationResult(false, errors);
    }

    public static ValidationResult failure(List<String> errors) {
        return new ValidationResult(false, errors);
    }

    public static ValidationResult from(List<String> errors) {
        if (errors == null || errors.isEmpty()) {
            return success();
        }
        return failure(errors);
    }

    public void addError(String error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
        this.valid = false;
    }

    public void addErrors(List<String> errors) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.addAll(errors);
        this.valid = false;
    }

    public String getErrorMessage() {
        if (errors == null || errors.isEmpty()) {
            return "";
        }
        return String.join("; ", errors);
    }
}
