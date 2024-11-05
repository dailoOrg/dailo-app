export const podcastQAStreamPrompt = {
  model: "gpt-4o-2024-08-06",
  temperature: 0.7,
  systemPrompt: "You are a helpful assistant that specializes in answering questions about podcast content using the provided transcript. Format your response in a clear and concise way.",
  userPrompt: (transcript: string, question: string) => 
    `Using the following podcast transcript as context, please answer this question: "${question}"\n\nTranscript:\n${transcript}`
}; 