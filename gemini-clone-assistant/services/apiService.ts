
const API_BASE = 'https://bailian.cdut.edu.cn/cre_llm/application';
const AUTH_KEY = 'b8cc3f295398df338425e91b831d135e';
const APP_ID = 'a7169d00-dd66-11f0-b4b9-d28b20064f4d';

// Using a CORS proxy is often necessary when calling third-party APIs directly from the browser.
const PROXY = 'https://corsproxy.io/?';

export class ExternalApiService {
  private getProxyUrl(url: string): string {
    return `${PROXY}${encodeURIComponent(url)}`;
  }

  async getChatId(): Promise<string> {
    const targetUrl = `${API_BASE}/open_chat`;
    const response = await fetch(this.getProxyUrl(targetUrl), {
      method: 'POST',
      headers: {
        'AK': AUTH_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        application_id: APP_ID,
        is_debug: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.code === 200) {
      return result.data;
    }
    throw new Error(result.message || 'Failed to get chat_id');
  }

  async *streamChat(chatId: string, question: string) {
    const targetUrl = `${API_BASE}/chat`;
    const response = await fetch(this.getProxyUrl(targetUrl), {
      method: 'POST',
      headers: {
        'AK': AUTH_KEY,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        chat_id: chatId,
        stream: true,
        question: question
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) throw new Error('ReadableStream not supported');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        try {
          // Handle SSE 'data: ' prefix if present, otherwise try raw JSON
          let jsonStr = trimmed;
          if (trimmed.startsWith('data:')) {
            jsonStr = trimmed.slice(5).trim();
          }
          
          if (jsonStr === '[DONE]') continue;
          
          const json = JSON.parse(jsonStr);
          yield json;
        } catch (e) {
          // If a chunk is not valid JSON, we log and continue
          console.debug("Skipping non-JSON chunk:", trimmed);
        }
      }
    }
    
    // Process remaining buffer
    if (buffer.trim()) {
      try {
        let jsonStr = buffer.trim();
        if (jsonStr.startsWith('data:')) jsonStr = jsonStr.slice(5).trim();
        if (jsonStr !== '[DONE]') {
          const json = JSON.parse(jsonStr);
          yield json;
        }
      } catch (e) {}
    }
  }
}

export const apiService = new ExternalApiService();
