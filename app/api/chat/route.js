import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
Unit Test Case Generator: Your task is to create comprehensive unit test cases for the given code. 
Ensure the following:
1. Cover edge cases, typical cases, and invalid inputs.
2. Include meaningful assertions for the behavior of each function.
3. Use a popular testing framework (e.g., Pytest for Python, JUnit for Java).
4. Provide the expected outputs where applicable.
5. Ensure clarity and correctness in the test cases.
6. Format the test cases in a structured, readable style for clean display in Markdown.
7. Include explanations for each test case where necessary.

Input: A code snippet.
Output: Well-structured, readable unit test cases with clear formatting.
`;

export async function POST(req) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const data = await req.json(); // Input data containing the code snippet.

    // Send the system prompt and input code to the LLaMA model.
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data],
      model: "meta-llama/llama-3.1-8b-instruct:free",
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          let responseText = ''; // Accumulate the response text.

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              responseText += content;
            }
          }

          // Format the accumulated response in Markdown for readability.
          const formattedResponse = `# Unit Test Cases\n\n${responseText}`;

          controller.enqueue(encoder.encode(formattedResponse));
        } catch (err) {
          controller.error(err); // Handle errors in the stream.
        } finally {
          controller.close(); // Close the stream.
        }
      },
    });

    // Return the stream response with formatted test cases.
    return new NextResponse(stream);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new NextResponse('Error processing request', { status: 500 });
  }
}
