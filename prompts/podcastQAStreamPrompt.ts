export const podcastQAStreamPrompt = {
  model: "gpt-4o-2024-08-06",
  temperature: 0.7,
  systemPrompt: "You are a helpful assistant that answers questions about podcasts. Use the transcript when relevant, but you may also provide general knowledge if the topic isn't covered in the transcript. If using information outside the transcript, clearly indicate this.",
  userPrompt: (transcript: string, question: string) => 
    `Please answer: "${question}"\n\nPodcast transcript for reference:\n${transcript}`
}; 