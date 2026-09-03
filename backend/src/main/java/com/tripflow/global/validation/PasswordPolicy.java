package com.tripflow.global.validation;

import java.util.regex.Pattern;

/**
 * 비밀번호 정책 한 곳. 회원가입·비밀번호 초기화·마이페이지 비밀번호 변경이 모두 이 규칙을 사용한다.
 * 프론트엔드 {@code frontend/src/utils/passwordPolicy.ts}와 판정 결과가 같아야 한다. 한쪽만 바꾸지 않는다.
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 10;
    public static final int MAX_LENGTH = 64;

    public static final String DEFAULT_MESSAGE =
            "비밀번호는 영문, 숫자, 특수문자를 모두 포함해 10자 이상 64자 이하로 입력해주세요.";
    public static final String TOO_SHORT_MESSAGE = "비밀번호는 10자 이상 입력해주세요.";
    public static final String TOO_LONG_MESSAGE = "비밀번호는 64자 이하로 입력해주세요.";
    public static final String NOT_ALLOWED_CHARACTER_MESSAGE =
            "비밀번호에는 영문, 숫자, 특수문자만 사용할 수 있습니다.";
    public static final String MISSING_CHARACTER_TYPE_MESSAGE =
            "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.";

    private static final Pattern ALLOWED =
            Pattern.compile("^[A-Za-z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]+$");
    private static final Pattern LETTER = Pattern.compile("[A-Za-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL =
            Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]");

    private PasswordPolicy() {
    }

    /**
     * @return 정책을 만족하면 {@code null}, 아니면 어긋난 이유 메시지
     */
    public static String validate(String password) {
        if (password == null || password.isEmpty()) {
            return DEFAULT_MESSAGE;
        }
        if (!ALLOWED.matcher(password).matches()) {
            return NOT_ALLOWED_CHARACTER_MESSAGE;
        }
        if (password.length() < MIN_LENGTH) {
            return TOO_SHORT_MESSAGE;
        }
        if (password.length() > MAX_LENGTH) {
            return TOO_LONG_MESSAGE;
        }
        if (!LETTER.matcher(password).find()
                || !DIGIT.matcher(password).find()
                || !SPECIAL.matcher(password).find()) {
            return MISSING_CHARACTER_TYPE_MESSAGE;
        }
        return null;
    }

    public static boolean isValid(String password) {
        return validate(password) == null;
    }
}
