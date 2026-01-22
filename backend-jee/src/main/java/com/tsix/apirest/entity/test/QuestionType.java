package com.tsix.apirest.entity.test;

public enum QuestionType {
    QCM("qcm"),
    TRUE_OR_FALSE("true or false"),
    OPEN_QUESTION("open question");

    private final String displayName;

    QuestionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static QuestionType fromString(String type) {
        if (type == null) {
            return null;
        }
        for (QuestionType qt : QuestionType.values()) {
            if (qt.displayName.equalsIgnoreCase(type.trim())) {
                return qt;
            }
        }
        throw new IllegalArgumentException("Unknown question type: " + type);
    }
}

