package com.tripflow.global.config;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.http.server.PathContainer;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * SecurityConfig 의 화이트리스트가 실제 컨트롤러와 어긋나지 않는지 검증한다.
 *
 * 스프링 컨텍스트를 띄우지 않고 클래스패스 스캔만 하므로 DB·환경변수가 필요 없다.
 */
class SecurityWhitelistTest {

    private static final String BASE_PACKAGE = "com.tripflow";

    private static final PathPatternParser PARSER = new PathPatternParser();

    @Test
    void 공개_화이트리스트의_모든_항목은_실제_핸들러를_가진다() {
        Set<String> mappedPaths = scanControllerPaths();

        assertFalse(mappedPaths.isEmpty(), "컨트롤러 스캔 결과가 비어 있습니다. BASE_PACKAGE 설정을 확인하세요.");

        for (String whitelisted : SecurityConfig.PUBLIC_API_WHITELIST) {
            PathPattern pattern = PARSER.parse(whitelisted);

            boolean covered = mappedPaths.stream()
                    .anyMatch(path -> pattern.matches(PathContainer.parsePath(toConcretePath(path))));

            assertTrue(
                    covered,
                    "화이트리스트 '" + whitelisted + "' 에 해당하는 컨트롤러가 없습니다. "
                            + "삭제된 엔드포인트라면 SecurityConfig 에서도 제거하세요. "
                            + "방치하면 나중에 같은 경로의 컨트롤러가 생겼을 때 "
                            + "인증 없이 열립니다."
            );
        }
    }

    @Test
    void 공개_화이트리스트에_중복_항목이_없다() {
        List<String> whitelist = List.of(SecurityConfig.PUBLIC_API_WHITELIST);

        assertTrue(whitelist.size() == new HashSet<>(whitelist).size(),
                "PUBLIC_API_WHITELIST 에 중복 항목이 있습니다: " + whitelist);
    }

    /**
     * 클래스 레벨 @RequestMapping 과 메서드 레벨 매핑을 합쳐 전체 경로를 모은다.
     */
    private Set<String> scanControllerPaths() {
        Set<String> paths = new HashSet<>();

        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);

        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));

        for (BeanDefinition definition : scanner.findCandidateComponents(BASE_PACKAGE)) {
            Class<?> controller = resolve(definition.getBeanClassName());

            for (String base : basePathsOf(controller)) {
                for (java.lang.reflect.Method method : controller.getDeclaredMethods()) {
                    RequestMapping mapping = AnnotatedElementUtils
                            .findMergedAnnotation(method, RequestMapping.class);

                    if (mapping == null) {
                        continue;
                    }

                    String[] suffixes = mapping.path().length > 0
                            ? mapping.path()
                            : new String[]{""};

                    for (String suffix : suffixes) {
                        paths.add(join(base, suffix));
                    }
                }
            }
        }

        return paths;
    }

    private String[] basePathsOf(Class<?> controller) {
        RequestMapping mapping = AnnotatedElementUtils
                .findMergedAnnotation(controller, RequestMapping.class);

        if (mapping == null || mapping.path().length == 0) {
            return new String[]{""};
        }

        return mapping.path();
    }

    private String join(String base, String suffix) {
        String left = base.endsWith("/")
                ? base.substring(0, base.length() - 1)
                : base;

        if (suffix.isEmpty()) {
            return left.isEmpty() ? "/" : left;
        }

        String right = suffix.startsWith("/") ? suffix : "/" + suffix;

        return left + right;
    }

    /**
     * {id} 같은 경로 변수는 패턴 매칭이 안 되므로 임의 값으로 치환한다.
     */
    private String toConcretePath(String path) {
        return path.replaceAll("[{][^/}]+[}]", "1");
    }

    private Class<?> resolve(String className) {
        try {
            return Class.forName(className);
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("컨트롤러 클래스를 로드할 수 없습니다: " + className, e);
        }
    }
}
