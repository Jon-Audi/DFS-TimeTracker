
"use client";

import { useEffect, useState } from 'react';

// Type definition for the event data received from the server
type ClockEvent = {
  employeeId: string;
  name: string;
  action: 'in' | 'out';
};

export default function Kiosk() {
  const [lastEvent, setLastEvent] = useState<ClockEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect to set up the Server-Sent Events (SSE) connection
  useEffect(() => {
    // Establish a connection to our SSE endpoint
    const eventSource = new EventSource('/api/events');

    // Handler for incoming messages
    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        setLastEvent(eventData);

        // Display the overlay for 3 seconds, then hide it
        setTimeout(() => setLastEvent(null), 3000);
      } catch (error) {
        console.error("Failed to parse event data:", error);
      }
    };

    // Handler for any errors with the connection
    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to update the current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-screen bg-background text-foreground flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">DFS Time Tracker Kiosk</h1>
        <p className="text-2xl text-muted-foreground mb-8">Scan your RFID tag to clock in or out.</p>
        <div className="text-8xl font-mono tracking-widest p-4 rounded-lg bg-card border">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
      
      {/* Full-screen overlay that appears when an event is received */}
      {lastEvent && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white text-5xl p-4 animate-in fade-in-50">
          <div className="mb-6 font-semibold">Welcome, {lastEvent.name}!</div>
          <div className="text-6xl font-bold">
            {lastEvent.action === 'in' ? (
              <span className="text-green-400">Clocked In ✅</span>
            ) : (
              <span className="text-yellow-400">Clocked Out ⏰</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
