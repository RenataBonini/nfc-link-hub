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
            'You are an AI marketing strategist for small businesses using NFC landing pages. Return practical, short, business-ready recommendations only.',
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

Recommend the best NFC landing page and flyer strategy.

Flyer template rules:
- "classic-nfc" for simple, local, friendly, service businesses
- "luxury-card" for premium, elegant, beauty, real estate, high-end brands
- "bold-promo" for gyms, events, nightlife, offers, energetic brands
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

              flyerTemplate: {
                type: 'string',
                enum: ['classic-nfc', 'luxury-card', 'bold-promo'],
              },

              recommendedCTA: { type: 'string' },
              recommendedTagline: { type: 'string' },

              pageHeadline: { type: 'string' },
              pageDescription: { type: 'string' },

              recommendedLinks: {
                type: 'array',
                items: { type: 'string' },
              },

              colorPalette: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  background: { type: 'string' },
                  accent: { type: 'string' },
                },
                required: ['background', 'accent'],
              },

              flyerHeadline: { type: 'string' },
              flyerSubtext: { type: 'string' },
              flyerCallout: { type: 'string' },
              flyerRecommendation: { type: 'string' },

              reason: { type: 'string' },
            },
            required: [
              'personaName',
              'personaDescription',
              'recommendedTemplate',
              'flyerTemplate',
              'recommendedCTA',
              'recommendedTagline',
              'pageHeadline',
              'pageDescription',
              'recommendedLinks',
              'colorPalette',
              'flyerHeadline',
              'flyerSubtext',
              'flyerCallout',
              'flyerRecommendation',
              'reason',
            ],
          },
        },
      },
    })

    const parsed = JSON.parse(response.output_text)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to generate recommendation.' },
      { status: 500 }
    )
  }
}