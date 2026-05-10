import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are an AI marketing strategist for small businesses using NFC landing pages. Return practical recommendations only.',
        },
        {
          role: 'user',
          content: `
Business type: ${body.businessType}
Target audience: ${body.targetAudience}
Customer age: ${body.customerAge}
Brand style: ${body.brandStyle}
Main goal: ${body.mainGoal}
Primary platform: ${body.primaryPlatform}
Tone: ${body.tone}

Recommend the best landing page strategy.
          `,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'persona_recommendation',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              personaName: { type: 'string' },
              personaDescription: { type: 'string' },
              recommendedTemplate: {
                type: 'string',
                enum: ['classic-dark', 'minimal-light', 'warm-card'],
              },
              recommendedCTA: { type: 'string' },
              recommendedTagline: { type: 'string' },
              recommendedLinks: {
                type: 'array',
                items: { type: 'string' },
              },
              flyerRecommendation: { type: 'string' },
              reason: { type: 'string' },
            },
            required: [
              'personaName',
              'personaDescription',
              'recommendedTemplate',
              'recommendedCTA',
              'recommendedTagline',
              'recommendedLinks',
              'flyerRecommendation',
              'reason',
            ],
          },
        },
      },
    })

    const text = response.output_text
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to generate recommendation.' },
      { status: 500 }
    )
  }
}