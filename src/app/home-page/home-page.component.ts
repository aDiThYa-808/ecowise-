import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  searchQuery: string = '';
  watsonResponse: string = '';
  selectedCategory: string = '';
  categories: string[] = ['Water Pollution', 'Air Pollution', 'Noise Pollution', 'Soil Pollution'];

  // Sidebar open/close
  sidebarOpen: boolean = false;

  // Chat History
  chatHistory: any[] = [
    { id: 1, title: 'Welcome Chat' }
  ];
  currentChatId: number = 1;

  // Watson credentials
  private watsonUrl = 'https://api.eu-gb.assistant.watson.cloud.ibm.com/v2/assistants/YOUR_ASSISTANT_ID/sessions';
  private watsonApiKey = 'YOUR_API_KEY';
  private watsonVersion = '2021-06-14';

  constructor(private http: HttpClient) {}

  // Toggle sidebar
toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
  if (this.sidebarOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}


  sendToWatson(query: string) {
    if (!query.trim()) return;

    this.selectedCategory = query;

    const authHeader = 'Basic ' + btoa(`apikey:${this.watsonApiKey}`);

    // Create session
    this.http.post<any>(
      `${this.watsonUrl}?version=${this.watsonVersion}`,
      {},
      { headers: new HttpHeaders({ Authorization: authHeader }) }
    ).subscribe(sessionRes => {
      const sessionId = sessionRes.session_id;
      // Send message
      this.http.post<any>(
        `https://api.eu-gb.assistant.watson.cloud.ibm.com/v2/assistants/YOUR_ASSISTANT_ID/sessions/${sessionId}/message?version=${this.watsonVersion}`,
        { input: { message_type: 'text', text: query } },
        { headers: new HttpHeaders({ Authorization: authHeader }) }
      ).subscribe(res => {
        const outputText = res.output.generic.map((g: any) => g.text).join('\n');
        this.watsonResponse = outputText || 'No response from Watson.';
        this.updateCurrentChatTitle(query);
      });
    });
  }

  updateCurrentChatTitle(query: string) {
    const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
    if (chatIndex !== -1 && !this.chatHistory[chatIndex].title) {
      this.chatHistory[chatIndex].title = query.slice(0, 20) + (query.length > 20 ? '...' : '');
    }
  }

  startNewChat() {
    this.currentChatId = this.chatHistory.length + 1;
    this.chatHistory.push({ id: this.currentChatId, title: 'New Chat' });
    this.searchQuery = '';
    this.watsonResponse = '';
    this.selectedCategory = '';
  }

  openChat(chat: any) {
    this.currentChatId = chat.id;
    this.watsonResponse = `Opened ${chat.title}`;
  }

  signInWithGoogle() {
    console.log('Google Sign-In clicked!');
    alert('Google Sign-In integration coming soon!');
  }

  showKeyboard() {
    const inputEl = document.querySelector<HTMLInputElement>('input[type="text"]');
    if (inputEl) {
      setTimeout(() => inputEl.focus(), 50);
    }
  }
  
}
