package com.tripflow.global.exception;

import com.tripflow.account.exception.DuplicateEmailException;
import com.tripflow.account.exception.DuplicatePhoneNumberException;
import com.tripflow.account.exception.InvalidPasswordResetTokenException;
import com.tripflow.account.exception.PasswordConfirmationMismatchException;
import com.tripflow.account.exception.PhoneVerificationTargetMismatchException;
import com.tripflow.account.exception.SamePasswordException;
import com.tripflow.auth.exception.InvalidLoginException;
import com.tripflow.host.exception.BusinessVerificationFailedException;
import com.tripflow.host.exception.DuplicateBusinessNumberException;
import com.tripflow.host.exception.DuplicateHostApplicationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateHostApplicationException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateHostApplication(
            DuplicateHostApplicationException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "code", "HOST_APPLICATION_ALREADY_EXISTS",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(DuplicateBusinessNumberException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateBusinessNumber(
            DuplicateBusinessNumberException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "code", "BUSINESS_NUMBER_ALREADY_EXISTS",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(BusinessVerificationFailedException.class)
    public ResponseEntity<Map<String, String>> handleBusinessVerificationFailed(
            BusinessVerificationFailedException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of(
                        "code", "BUSINESS_VERIFICATION_FAILED",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateEmail(
            DuplicateEmailException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "code", "DUPLICATE_EMAIL",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(DuplicatePhoneNumberException.class)
    public ResponseEntity<Map<String, String>> handleDuplicatePhoneNumber(
            DuplicatePhoneNumberException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "code", "DUPLICATE_PHONE_NUMBER",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.putIfAbsent(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "code", "VALIDATION_FAILED",
                        "message", "입력값을 확인해주세요.",
                        "errors", errors
                ));
    }

    @ExceptionHandler(InvalidLoginException.class)
    public ResponseEntity<Map<String, String>> handleInvalidLogin(
            InvalidLoginException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "code", "INVALID_CREDENTIALS",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(PhoneVerificationTargetMismatchException.class)
    public ResponseEntity<Map<String, String>> handlePhoneVerificationTargetMismatch(
            PhoneVerificationTargetMismatchException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "code", "PHONE_VERIFICATION_TARGET_MISMATCH",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidPasswordResetToken(
            InvalidPasswordResetTokenException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "code", "INVALID_PASSWORD_RESET_TOKEN",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(SamePasswordException.class)
    public ResponseEntity<Map<String, String>> handleSamePassword(
            SamePasswordException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "code", "SAME_AS_CURRENT_PASSWORD",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(PasswordConfirmationMismatchException.class)
    public ResponseEntity<Map<String, String>> handlePasswordConfirmationMismatch(
            PasswordConfirmationMismatchException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "code", "PASSWORD_CONFIRMATION_MISMATCH",
                        "message", exception.getMessage()
                ));
    }
}
