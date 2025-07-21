
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogIn, LogOut, Clock, Printer } from "lucide-react";
import { format, startOfWeek, endOfWeek, differenceInSeconds, isWithinInterval } from 'date-fns';

type TimeEntry = {
  start: Date;
  end: Date | null;
};

export default function EmployeeDashboard() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedIsClockedIn = localStorage.getItem('isClockedIn');
      const savedEntries = localStorage.getItem('entries');
      if (savedIsClockedIn) {
        setIsClockedIn(JSON.parse(savedIsClockedIn));
      }
      if (savedEntries) {
        const parsedEntries: { start: string; end: string | null }[] = JSON.parse(savedEntries);
        setEntries(parsedEntries.map(e => ({
          start: new Date(e.start),
          end: e.end ? new Date(e.end) : null,
        })));
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('isClockedIn', JSON.stringify(isClockedIn));
        localStorage.setItem('entries', JSON.stringify(entries));
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }
  }, [isClockedIn, entries, isClient]);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockToggle = () => {
    const now = new Date();
    if (isClockedIn) {
      // Clocking out
      setEntries(prevEntries => {
        const newEntries = [...prevEntries];
        const lastEntry = newEntries[newEntries.length - 1];
        if (lastEntry && !lastEntry.end) {
          lastEntry.end = now;
        }
        return newEntries;
      });
    } else {
      // Clocking in
      setEntries(prevEntries => [...prevEntries, { start: now, end: null }]);
    }
    setIsClockedIn(!isClockedIn);
  };

  const calculateDuration = (start: Date, end: Date | null): number => {
    if (!end) return 0;
    return differenceInSeconds(end, start) / 3600;
  };
  
  const currentWeekStart = startOfWeek(currentTime, { weekStartsOn: 0 }); // Sunday
  const currentWeekEnd = endOfWeek(currentTime, { weekStartsOn: 0 }); // Saturday

  const weeklyEntries = entries.filter(entry => 
    isWithinInterval(entry.start, { start: currentWeekStart, end: currentWeekEnd })
  );

  const totalHours = weeklyEntries.reduce((acc, entry) => acc + calculateDuration(entry.start, entry.end), 0);
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(0, totalHours - 40);

  const handlePrint = () => {
    window.print();
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto printable-area">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold text-primary">Employee Dashboard</h1>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Timesheet
          </Button>
        </header>

        <main className="flex flex-col gap-8">
          <Card className="w-full max-w-md mx-auto shadow-lg transition-all duration-300 print:hidden">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 text-muted-foreground mb-2">
                <Clock size={16} />
                <span>{format(currentTime, 'PPPP p')}</span>
              </div>
              <CardTitle className={`text-2xl font-semibold transition-colors ${isClockedIn ? 'text-accent' : 'text-primary'}`}>
                {isClockedIn ? 'You are Clocked In' : 'You are Clocked Out'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={handleClockToggle} 
                className={`w-48 h-12 text-lg font-bold transition-all duration-300 transform hover:scale-105 ${isClockedIn ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isClockedIn ? <LogOut className="mr-2"/> : <LogIn className="mr-2" />}
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </Button>
            </CardContent>
          </Card>

          <div className="timesheet">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold">Weekly Timesheet</h2>
              <p className="text-muted-foreground">
                {format(currentWeekStart, 'MMM d, yyyy')} - {format(currentWeekEnd, 'MMM d, yyyy')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total Hours</CardTitle>
                  <CardDescription>All hours this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalHours.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Regular Hours</CardTitle>
                   <CardDescription>Up to 40 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{regularHours.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Overtime Hours</CardTitle>
                  <CardDescription>Hours over 40</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">{overtimeHours.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Time Log</CardTitle>
                 <CardDescription>Detailed log of your time entries for this week.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead className="text-right">Duration (Hours)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyEntries.length > 0 ? (
                        weeklyEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{format(entry.start, 'EEE, MMM d')}</TableCell>
                            <TableCell>{format(entry.start, 'p')}</TableCell>
                            <TableCell>{entry.end ? format(entry.end, 'p') : 'In Progress...'}</TableCell>
                            <TableCell className="text-right">{calculateDuration(entry.start, entry.end).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No time entries for this week.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <footer className="text-center text-muted-foreground mt-8 text-sm print:hidden">
          <p>DFS Time Tracker | © {new Date().getFullYear()}</p>
        </footer>
      </div>

       <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          .printable-area {
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          main, .timesheet, .card {
            color: black !important;
            background-color: white !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          .card-title, .card-description, p, th, td, h1, h2 {
             color: black !important;
          }
           .text-muted-foreground {
             color: #555 !important;
          }
          .text-accent {
            color: #16a085 !important; /* a darker shade of turquoise for print */
          }
          .text-primary {
             color: #2980b9 !important; /* a darker shade of skyblue for print */
          }
        }
      `}</style>
    </div>
  );
}
