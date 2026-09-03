package com.tripflow.global.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordPolicyTest {

    @Test
    @DisplayName("영문·숫자·특수문자를 모두 포함한 10자 이상이면 통과한다")
    void allowsPasswordWithEveryCharacterType() {
        for (String password : new String[]{"abcd1234!@", "Tripflow01!", "a1!aaaaaaa", "P@ssw0rd12"}) {
            assertNull(PasswordPolicy.validate(password), password);
            assertTrue(PasswordPolicy.isValid(password), password);
        }
    }

    @Test
    @DisplayName("10자 미만이면 길이 안내를 반환한다")
    void rejectsShortPassword() {
        assertEquals(PasswordPolicy.TOO_SHORT_MESSAGE, PasswordPolicy.validate("abc123!@#"));
    }

    @Test
    @DisplayName("64자를 넘으면 길이 안내를 반환한다")
    void rejectsLongPassword() {
        assertEquals(PasswordPolicy.TOO_LONG_MESSAGE, PasswordPolicy.validate("a1!".repeat(22)));
    }

    @Test
    @DisplayName("문자 종류가 하나라도 빠지면 조합 안내를 반환한다")
    void rejectsMissingCharacterType() {
        for (String password : new String[]{"abcdefghij", "abcd123456", "abcd!@#$%^", "1234567890"}) {
            assertEquals(PasswordPolicy.MISSING_CHARACTER_TYPE_MESSAGE, PasswordPolicy.validate(password), password);
        }
    }

    @Test
    @DisplayName("허용하지 않는 문자가 있으면 문자 안내를 반환한다")
    void rejectsNotAllowedCharacter() {
        for (String password : new String[]{"abcd1234!@ ", "비밀번호1234!@", "abcd1234!é"}) {
            assertEquals(PasswordPolicy.NOT_ALLOWED_CHARACTER_MESSAGE, PasswordPolicy.validate(password), password);
        }
    }

    @Test
    @DisplayName("빈 값은 기본 안내를 반환한다")
    void rejectsEmptyPassword() {
        assertEquals(PasswordPolicy.DEFAULT_MESSAGE, PasswordPolicy.validate(""));
        assertEquals(PasswordPolicy.DEFAULT_MESSAGE, PasswordPolicy.validate(null));
    }
}
