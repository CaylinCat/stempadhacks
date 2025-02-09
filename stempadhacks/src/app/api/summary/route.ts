import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

async function getSummary(text: string, gradeLevel: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  // The prompt
  const sysprompt = 'You are an expert assistant. Your task is to generate a long summary of documents you are given. Your primary goal is to allow children to understand documents, using language they will understand. When summarizing a document with multiple sections, you will give a summary of each section within the document.';
  const prompt = `Summarize the following text in language appropriate for a ${gradeLevel} grade student:\n\n${text}`;


  try {
    // Requesting OpenAI's GPT-3.5 Turbo using the chat completion endpoint
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',  // Or you can use gpt-4 if available
        messages: [
          { role: 'system', content: sysprompt },
          { role: 'user', content: prompt },
        ],
        // max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract and return the summary from the response
    const summary = response.data.choices[0].message.content.trim();
    return summary;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw new Error('Error generating summary');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, gradeLevel } = await req.json();

    if (!text || !gradeLevel) {
      return NextResponse.json({ error: 'Text and grade level are required' }, { status: 400 });
    }

    const summary = await getSummary(text, gradeLevel);
    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}