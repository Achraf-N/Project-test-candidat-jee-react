-- Create candidate_answer table for storing candidate test submissions
CREATE TABLE IF NOT EXISTS candidate_answer (
    id BIGSERIAL PRIMARY KEY,
    test_session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer_id BIGINT,
    open_answer_text TEXT,
    is_correct BOOLEAN,
    points_earned DOUBLE PRECISION,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_candidate_answer_test_session 
        FOREIGN KEY (test_session_id) 
        REFERENCES test_session(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_candidate_answer_question 
        FOREIGN KEY (question_id) 
        REFERENCES Question(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_candidate_answer_selected_answer 
        FOREIGN KEY (selected_answer_id) 
        REFERENCES Answer(id) 
        ON DELETE SET NULL,
    
    -- Unique constraint to prevent duplicate answers for same question in same session
    CONSTRAINT unique_test_session_question 
        UNIQUE (test_session_id, question_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidate_answer_test_session 
    ON candidate_answer(test_session_id);

CREATE INDEX IF NOT EXISTS idx_candidate_answer_question 
    ON candidate_answer(question_id);

CREATE INDEX IF NOT EXISTS idx_candidate_answer_submitted_at 
    ON candidate_answer(submitted_at);
