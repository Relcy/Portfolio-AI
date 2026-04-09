export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  // Check API key is configured
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
 
  try {
    // Extract the prompt from the incoming request
    const { messages, max_tokens } = req.body;
 
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: max_tokens || 1000,
        messages: messages
      })
    });
 
    const data = await response.json();
 
    // Convert Groq response format to match Anthropic format
    // so the frontend code doesn't need to change
    const converted = {
      content: [
        {
          type: 'text',
          text: data.choices?.[0]?.message?.content || 'Something went wrong — please try again.'
        }
      ]
    };
 
    res.status(response.status).json(converted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reach Groq API' });
  }
}
