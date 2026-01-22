package unitTest;

import com.tsix.apirest.dto.req.TestSessionReq;
import com.tsix.apirest.entity.test.TestSession;
import com.tsix.apirest.mapper.TestSessionMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TestSessionMapperTest {
    @Test
    void should_map_TestSessionReq_to_TestSession_entities() {
        // GIVEN
        TestSessionReq req = new TestSessionReq();
        req.setTestId(42);
        req.setEmailCandidate(List.of(
                "user1@test.com",
                "user2@test.com"
        ));

        LocalDateTime expirationDate = LocalDateTime.now().plusDays(1);
        req.setDateExpiration(expirationDate);

        // WHEN
        List<TestSession> result = TestSessionMapper.toEntity(req);

        // THEN
        assertNotNull(result);
        assertEquals(2, result.size());

        for (int i = 0; i < result.size(); i++) {
            TestSession session = result.get(i);

            assertNotNull(session.getTest());
            assertEquals(42L, session.getTest().getId());

            assertEquals(req.getEmailCandidate().get(i), session.getEmailCandidate());

            assertNotNull(session.getCodeSession());
            assertFalse(session.getCodeSession().isBlank());

            assertEquals(expirationDate, session.getDateExpiration());
        }
    }
}
