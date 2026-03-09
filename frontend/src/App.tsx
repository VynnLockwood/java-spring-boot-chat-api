import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am your Java Spring Boot AI assistant. How can I help you build amazing things today?', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [healthStatus, setHealthStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll the backend health API on load
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        setHealthStatus('checking');
        const response = await fetch('/api/health'); // Routed by Nginx!
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'UP') {
            setHealthStatus('up');
          } else {
            setHealthStatus('down');
          }
        } else {
          setHealthStatus('down');
        }
      } catch (error) {
        setHealthStatus('down');
      }
    };

    checkServerHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI thinking and replying
    setTimeout(() => {
      const aiResponse = getSimulatedResponse(input);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' }]);
    }, 800);
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('spring')) return 'Spring Boot is amazing! Do you want to learn about @RestController or Dockerizing an app?';
    if (lowerQuery.includes('nginx')) return 'Nginx acts as our reverse proxy routing traffic from port 23000 to our frontend and backend APIs!';
    if (lowerQuery.includes('hello')) return 'Hi there! Ready to write some code?';
    return "That's an interesting thought! Keep going, I'm analyzing your input.";
  };

  return (
    <div className="app-container">
      
      {/* Sidebar Area */}
      <aside className="sidebar">
        <div className="brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
              <linearGradient id="paint1_linear" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
              <linearGradient id="paint2_linear" x1="2" y1="12" x2="22" y2="17" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
            </defs>
          </svg>
          <h1>Nova AI</h1>
        </div>

        {/* Dynamic Backend Status Indicator */}
        <div className={`health-status ${healthStatus}`}>
          <div className="status-dot"></div>
          {healthStatus === 'checking' && 'Pinging Backend...'}
          {healthStatus === 'up' && 'Backend Connected'}
          {healthStatus === 'down' && 'Backend Offline'}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form onSubmit={handleSend} className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Nova AI..."
            />
            <button type="submit" disabled={!input.trim()}>
              Send
            </button>
          </form>
        </div>
      </main>
      
    </div>
  )
}

export default App
