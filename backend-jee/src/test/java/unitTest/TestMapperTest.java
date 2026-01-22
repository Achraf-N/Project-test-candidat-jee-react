package unitTest;

import com.tsix.apirest.dto.req.TestRequest;
import com.tsix.apirest.entity.test.Question;
import com.tsix.apirest.mapper.TestMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class TestMapperTest {
    private final TestMapper mapper = new TestMapper();

    @Test
    void should_map_test_request_to_test_entity() {
        Question question = new Question();
        List<Question> questions = List.of(question);
        UUID enterpriseId = UUID.randomUUID();
        // GIVEN
        TestRequest request = new TestRequest(
                "Java Test",
                enterpriseId,
                10000L,
                60,
                questions
        );

        // WHEN
        com.tsix.apirest.entity.test.Test test = mapper.toTest(request);

        // THEN
        assertNotNull(test);
        assertEquals("Java Test", test.getName());
        assertEquals(enterpriseId, test.getEnterprise().getId());
        assertEquals(10000, test.getAdminAccount().getId());
        assertEquals(60, test.getDurationMinute());
    }
}
