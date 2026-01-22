package unitTest;

import com.tsix.apirest.entity.test.*;
import com.tsix.apirest.service.TestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestServiceTest {

    private TestService service;

    @BeforeEach
    void setUp() {
        service = new TestService();
    }

    @Test
    void shouldReturnTrueForQcmWhenAtLeastOneCorrectAnswer() {
        Question q = new Question();
        Answer a1 = new Answer(0, q, "A", false);
        Answer a2 = new Answer(0, q, "B", true);

        q.setAnswers(Set.of(a1, a2));

        assertTrue(service.checkAnswer(q, QuestionType.QCM));
    }

    @Test
    void shouldReturnFalseForQcmWhenNoCorrectAnswer() {
        Question q = new Question();
        Answer a1 = new Answer(0, q, "A", false);
        Answer a2 = new Answer(0, q, "B", false);

        q.setAnswers(Set.of(a1, a2));

        assertFalse(service.checkAnswer(q, QuestionType.QCM));
    }


    @Test
    void shouldReturnTrueForTrueFalseWhenTrueIsCorrect() {
        Question q = new Question();

        Answer aTrue = new Answer(0, q, "true", true);
        Answer aFalse = new Answer(0, q, "false", false);

        q.setAnswers(Set.of(aTrue, aFalse));

        assertTrue(service.checkAnswer(q, QuestionType.TRUE_OR_FALSE));
    }
    @Test
    void should_Return_False_For_True_False_When_More_Than_One_Correct_Answer() {
        Question q = new Question();
        Answer aTrue = new Answer(0, q, "true", true);
        Answer aFalse = new Answer(0, q, "true", false);
        q.setAnswers(Set.of(aTrue, aFalse));
        assertFalse(service.checkAnswer(q, QuestionType.TRUE_OR_FALSE));
    }

    @Test
    void should_Return_False_For_True_False_When_More_Than_One_is_correct() {
        Question q = new Question();
        Answer aTrue = new Answer(0, q, "true", true);
        Answer aFalse = new Answer(0, q, "false", true);
        q.setAnswers(Set.of(aTrue, aFalse));
        assertFalse(service.checkAnswer(q, QuestionType.TRUE_OR_FALSE));
    }

    @Test
    void shouldReturnTrueForOpenQuestionWithKeywords() {
        Question q = new Question();
        OpenAnswer oa = new OpenAnswer();

        oa.setKeyWords(Set.of(
                new KeyWords(0, oa, "jvm"),
                new KeyWords(0, oa, "bytecode")
        ));

        q.setOpenAnswers(oa);

        assertTrue(service.checkOpenAnswer(q, QuestionType.OPEN_QUESTION));
    }

    @Test
    void shouldReturnFalseForOpenQuestionWithoutKeywords() {
        Question q = new Question();
        OpenAnswer oa = new OpenAnswer();

        oa.setKeyWords(Set.of());

        q.setOpenAnswers(oa);

        assertFalse(service.checkOpenAnswer(q, QuestionType.OPEN_QUESTION));
    }
}
