// src/app/home-page/home-page.component.ts
import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { interval, Subscription } from 'rxjs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  currentMessage: string = '';
  messages: ChatMessage[] = [];
  isLoading: boolean = false;
  categories: string[] = ['Water Pollution', 'Air Pollution', 'Noise Pollution', 'Soil Pollution'];
  
  // Health check properties
  isServerHealthy: boolean = true;
  isCheckingHealth: boolean = false;
  healthCheckSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Check server health immediately on component load
    this.checkServerHealth();
    
    // Set up periodic health checks every 30 seconds
    this.healthCheckSubscription = interval(30000).subscribe(() => {
      this.checkServerHealth();
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  checkServerHealth(): void {
    this.isCheckingHealth = true;
    
    this.http.get('https://ecowise-qmb1.onrender.com/api/health', {
      responseType: 'text', // Expect text response, not JSON
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe({
      next: (response) => {
        console.log('Health check successful:', response);
        this.isServerHealthy = true;
        this.isCheckingHealth = false;
      },
      error: (error) => {
        console.error('Health check failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        this.isServerHealthy = false;
        this.isCheckingHealth = false;
      }
    });
  }

  // Simple method to format basic markdown without external libraries
  formatMessage(content: string): SafeHtml {
    let formattedContent = content
      // Convert **text** to <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *text* to <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert numbered lists (1. text)
      .replace(/^\d+\.\s+(.+)$/gm, '<div class="list-item numbered">$1</div>')
      // Convert bullet points (- text or • text)
      .replace(/^[-•]\s+(.+)$/gm, '<div class="list-item bullet">$1</div>')
      // Convert line breaks to <br>
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(formattedContent);
  }

  sendMessage(message: string) {
    // Check if server is healthy before sending message
    if (!this.isServerHealthy) {
      this.checkServerHealth(); // Try to reconnect
      return;
    }

    if (!message || !message.trim() || this.isLoading) return;

    // Add user message to chat
    this.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Clear input
    this.currentMessage = '';
    this.isLoading = true;

    // Call backend
    this.http.post<any>(
      'https://ecowise-qmb1.onrender.com/watsonx/query',
      { prompt: message.trim() },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isServerHealthy = true; // Server responded, so it's healthy
        
        // Add assistant response to chat
        let assistantMessage = '';
        if (response.success && response.data) {
          assistantMessage = response.data.message || 'No response from AI.';
        } else if (response.message) {
          assistantMessage = response.message || 'No response from AI.';
        } else {
          assistantMessage = 'Unexpected response format from server.';
        }

        this.messages.push({
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error calling backend:', error);
        
        // Check if error is due to server being down
        if (error.status === 0) {
          this.isServerHealthy = false;
        }

        let errorMessage = '';
        if (error.status === 400) {
          errorMessage = 'Please provide a valid question.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the server is running.';
        } else {
          errorMessage = `Error: ${error.error?.message || 'Something went wrong'}`;
        }

        this.messages.push({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        });
      }
    });
  }

  // Manual retry button for when server is down
  retryConnection(): void {
    this.checkServerHealth();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollAnchor) {
        this.scrollAnchor.nativeElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    } catch (err) {
      console.log('Scroll error:', err);
    }
  }

  // Clear chat history (optional - you can add a button for this)
  clearChat() {
    this.messages = [];
  }
}