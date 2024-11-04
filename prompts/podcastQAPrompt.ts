export const podcastQAPrompt = {
  model: "gpt-4o-2024-08-06",
  temperature: 0.7,
  systemPrompt: "You are a helpful assistant that specializes in answering questions about podcast content using the provided transcript.",
  userPrompt: (transcript: string, question: string) => 
    `Using the following podcast transcript as context, please answer this question: "${question}"\n\nTranscript:\n${transcript}`,
  responseFormat: {
    "type": "json_schema",
    "json_schema": {
      "name": "podcastQAResponse",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "answer": {
            "type": "string",
            "description": "The answer to the user's question based on the podcast content"
          },
          "confidence": {
            "type": "number",
            "description": "Confidence score between 0 and 1 indicating how certain the answer is based on the transcript"
          }
        },
        "required": [
          "answer",
          "confidence"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    }
  }
}; 