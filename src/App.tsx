import React, { useState, useEffect, useCallback } from 'react';
import './styles/theme.css';

interface Chapter {
  id: number;
  title: string;
  content: string;
}

interface Review {
  id: number;
  username: string;
  content: string;
  timestamp: string;
}

function App() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://localhost:3001/api';

  const fetchReviews = useCallback((chapterId: number) => {
    fetch(`${API_URL}/reviews/${chapterId}`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [API_URL]);

  const loadChapter = useCallback((id: number) => {
    setIsLoading(true);
    fetch(`${API_URL}/chapters/${id}`)
      .then(res => res.json())
      .then(data => {
        setCurrentChapter(data);
        fetchReviews(id);
        setIsLoading(false);
      });
  }, [API_URL, fetchReviews]);

  useEffect(() => {
    fetch(`${API_URL}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data);
        if (data.length > 0) {
          loadChapter(data[0].id);
        }
        setIsLoading(false);
      });
  }, [API_URL, loadChapter]);


  

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !reviewText || !currentChapter) return;

    fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapter_id: currentChapter.id,
        username,
        content: reviewText
      })
    }).then(() => {
      setReviewText('');
      fetchReviews(currentChapter.id);
    });
  };

  if (isLoading && !currentChapter) {
    return <div className="container"><p className="typewriter">INITIALIZING SYSTEM...</p></div>;
  }

  return (
    <div className="container">
      {/* background set via CSS (pure black) */}
      <header>
        <h1 className="glitch" data-text="RESIDUE">RESIDUE</h1>
        <p style={{ color: 'var(--accent-green)', fontSize: '0.8rem', marginBottom: '20px' }}>
          [STATUS: DECRYPTING FIRST FRAGMENTS...]
        </p>
        <nav>
          {chapters.map(ch => (
            <a 
              key={ch.id} 
              href="#" 
              className={currentChapter?.id === ch.id ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); loadChapter(ch.id); }}
            >
              CHAPTER {ch.id}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {currentChapter && (
          <article>
            <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '30px' }}>{currentChapter.title}</h2>
            <div style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap', marginBottom: '60px' }}>
              {currentChapter.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '10px', marginBottom: '40px' }}>
              {
                (() => {
                  const idx = chapters.findIndex(c => c.id === currentChapter.id);
                  const prev = idx > 0 ? chapters[idx - 1] : null;
                  const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;
                  return (
                    <>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        {prev ? (
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); loadChapter(prev.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 'bold' }}
                          >
                            ← PREVIOUS: {prev.title}
                          </a>
                        ) : <span style={{ color: 'var(--dim-text)' }}>— beginning —</span>}
                      </div>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        {next ? (
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); loadChapter(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}
                          >
                            NEXT: {next.title} →
                          </a>
                        ) : <span style={{ color: 'var(--dim-text)' }}>— end of archive —</span>}
                      </div>
                    </>
                  );
                })()
              }
            </div>
          </article>
        )}

        <section id="feedback" style={{ borderTop: '1px solid var(--dim-text)', paddingTop: '40px' }}>
          <h3 className="glitch" data-text="TRANSMIT FEEDBACK" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            TRANSMIT FEEDBACK
          </h3>
          
          <form onSubmit={handleSubmitReview} style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="IDENTIFY YOURSELF" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  padding: '10px',
                  width: '100%',
                  fontFamily: 'var(--terminal-font)'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <textarea 
                placeholder="ENTER LOG ENTRY..." 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  padding: '10px',
                  width: '100%',
                  fontFamily: 'var(--terminal-font)',
                  resize: 'vertical'
                }}
              />
            </div>
            <button 
              type="submit"
              style={{
                background: 'var(--accent-cyan)',
                color: 'black',
                border: 'none',
                padding: '10px 20px',
                fontFamily: 'var(--terminal-font)',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              SEND TRANSMISSION
            </button>
          </form>

          <div className="reviews">
            {reviews.map(review => (
              <div key={review.id} style={{ borderLeft: '2px solid var(--accent-green)', paddingLeft: '15px', marginBottom: '20px' }}>
                <p style={{ color: 'var(--accent-green)', fontSize: '0.8rem' }}>
                  {review.username} @ {new Date(review.timestamp).toLocaleString()}
                </p>
                <p style={{ color: 'var(--text-color)' }}>{review.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ marginTop: '80px', color: 'var(--dim-text)', fontSize: '0.7rem', textAlign: 'center' }}>
        <p>© 2026 RESIDUE_ARCHIVE // NO RIGHTS RESERVED BY THE MACHINE</p>
      </footer>
    </div>
  );
}

export default App;
