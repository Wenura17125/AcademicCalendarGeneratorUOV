import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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",
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const response = await openai.chat.completions.create({
      model: "qwen",
      messages: [
        {
          role: "system",
          content: "You are an expert academic calendar assistant that helps generate and optimize academic calendars for universities. You provide concise, accurate advice about scheduling semester dates, vacations, exam periods, orientation weeks, etc."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      success: true,
      data: response.choices[0]?.message?.content || "Sorry, I couldn't generate a response."
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
