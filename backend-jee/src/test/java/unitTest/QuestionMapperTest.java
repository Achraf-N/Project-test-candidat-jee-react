package unitTest;

import com.tsix.apirest.dto.res.AnswerResponse;
import com.tsix.apirest.dto.res.QuestionResponse;
import com.tsix.apirest.entity.test.*;
import com.tsix.apirest.mapper.QuestionMapper;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class QuestionMapperTest {
    private final QuestionMapper mapper = new QuestionMapper();

    @Test
    void should_map_question_to_dto_correctly() {

        // ===== GIVEN =====

        Question question = new Question();
        question.setId(1);
        question.setLabel("What is Java?");
        question.setHint("Programming language");
        question.setPoints(5);
        question.setQuestionType(QuestionType.QCM);

        Answer a1 = new Answer();
        a1.setId(10);
        a1.setLabel("Programming language");
        a1.setCorrect(true);
        a1.setQuestion(question);

        Answer a2 = new Answer();
        a2.setId(11);
        a2.setLabel("Database");
        a2.setCorrect(false);
        a2.setQuestion(question);

        question.setAnswers(Set.of(a1, a2));

        OpenAnswer openAnswer = new OpenAnswer();
        openAnswer.setId(20);
        openAnswer.setExpectedAnswer("Java is a programming language");
        openAnswer.setQuestion(question);

        KeyWords k1 = new KeyWords();
        k1.setId(30);
        k1.setKeyword("java");
        k1.setOpenAnswer(openAnswer);

        KeyWords k2 = new KeyWords();
        k2.setId(31);
        k2.setKeyword("language");
        k2.setOpenAnswer(openAnswer);

        openAnswer.setKeyWords(Set.of(k1, k2));
        question.setOpenAnswers(openAnswer);

        // ===== WHEN =====

        QuestionResponse dto = mapper.toDto(question);

        // ===== THEN =====

        assertNotNull(dto);
        assertEquals(1, dto.getId());
        assertEquals("What is Java?", dto.getLabel());
        assertEquals("Programming language", dto.getHint());
        assertEquals("qcm", dto.getTypes()); // Display name from enum
        assertEquals(5, dto.getPoints());

        // Answers
        assertNotNull(dto.getAnswers());
        assertEquals(2, dto.getAnswers().size());

        AnswerResponse correctAnswer = dto.getAnswers().stream()
                .filter(AnswerResponse::isCorrect)
                .findFirst()
                .orElseThrow();

        assertEquals("Programming language", correctAnswer.getLabel());

        // Open Answer
        assertNotNull(dto.getOpenAnswers());
        assertEquals("Java is a programming language",
                dto.getOpenAnswers().getExpectedAnswer());

        // Keywords
        assertEquals(2, dto.getOpenAnswers().getKeywords().size());
    }
}
