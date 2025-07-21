
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataConnect } from "@/lib/dataconnect";
import { queries, mutations } from "@firebasegen/default-connector/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogIn, LogOut, Clock, Printer, Loader2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, differenceInSeconds } from 'date-fns';
import { useToast } from "@/hooks/use-toast";


function EmployeeDashboardContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: employeeDetails, isLoading: isLoadingDetails, error: employeeError } = useQuery({
    queryKey: queries.getEmployeeDetails.queryKey(employeeId ? { employeeId } : undefined),
    queryFn: () => queries.getEmployeeDetails(dataConnect, { employeeId: employeeId! }),
    enabled: !!employeeId,
  });

  const currentWeekStart = startOfWeek(currentTime, { weekStartsOn: 0 }); // Sunday
  const currentWeekEnd = endOfWeek(currentTime, { weekStartsOn: 0 });

  const { data: weeklyEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: queries.listTimeEntriesForEmployee.queryKey(
        employeeId ? {
            employeeId: employeeId!,
            startTime: currentWeekStart.toISOString(),
            endTime: currentWeekEnd.toISOString(),
        } : undefined
    ),
    queryFn: () => queries.listTimeEntriesForEmployee(dataConnect, {
      employeeId: employeeId!,
      startTime: currentWeekStart.toISOString(),
      endTime: currentWeekEnd.toISOString(),
    }),
    enabled: !!employeeId,
  });

  const { mutate: clockInMutation, isPending: isClockingIn } = useMutation({
    mutationFn: (vars: typeof mutations.clockIn.input) => mutations.clockIn(dataConnect, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queries.getEmployeeDetails.queryKey({ employeeId: employeeId! }) });
        queryClient.invalidateQueries({ queryKey: queries.listTimeEntriesForEmployee.queryKey({
            employeeId: employeeId!,
            startTime: currentWeekStart.toISOString(),
            endTime: currentWeekEnd.toISOString(),
        })});
        toast({ title: "Clocked In", description: "Your shift has started." });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });

  const { data: latestEntry } = useQuery({
    queryKey: queries.getLatestTimeEntry.queryKey(employeeId ? { employeeId } : undefined),
    queryFn: () => queries.getLatestTimeEntry(dataConnect, { employeeId: employeeId! }),
    enabled: !!employeeId,
  });

  const { mutate: clockOutMutation, isPending: isClockingOut } = useMutation({
     mutationFn: (vars: typeof mutations.clockOut.input) => mutations.clockOut(dataConnect, vars),
     onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queries.getEmployeeDetails.queryKey({ employeeId: employeeId! }) });
        queryClient.invalidateQueries({ queryKey: queries.listTimeEntriesForEmployee.queryKey({
            employeeId: employeeId!,
            startTime: currentWeekStart.toISOString(),
            endTime: currentWeekEnd.toISOString(),
        })});
        toast({ title: "Clocked Out", description: "Your shift has ended." });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
  });


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoadingDetails) {
     return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }
  
  if (!employeeId) {
     return <div className="min-h-screen flex items-center justify-center"><p>No employee ID provided.</p></div>
  }
  
  if (employeeError) {
     return <div className="min-h-screen flex items-center justify-center"><p>Error loading employee: {employeeError.message}</p></div>
  }

  if (!employeeDetails) {
     return <div className="min-h-screen flex items-center justify-center"><p>Employee not found.</p></div>
  }
  
  const lastEntry = employeeDetails?.timeEntries?.[0];
  const isClockedIn = lastEntry ? !lastEntry.clockOut : false;

  const handleClockToggle = () => {
    if (isClockedIn) {
        const latestTimeEntryId = latestEntry?.timeEntryId;
        if (latestTimeEntryId) {
            clockOutMutation({ timeEntryId: latestTimeEntryId });
        } else {
             toast({ title: "Error", description: "Cannot find entry to clock out.", variant: "destructive" })
        }
    } else {
        clockInMutation({ employeeId });
    }
  };

  const calculateDuration = (start: any, end: any | null): number => {
    if (!end) return 0;
    return differenceInSeconds(new Date(end), new Date(start)) / 3600;
  };

  const totalHours = weeklyEntries?.reduce((acc, entry) => acc + calculateDuration(entry.clockIn, entry.clockOut), 0) ?? 0;
  const regularHours = Math.min(totalHours, 40);
  const overtimeHours = Math.max(0, totalHours - 40);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto printable-area">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold text-primary">Welcome, {employeeDetails.name}</h1>
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
                disabled={isClockingIn || isClockingOut}
                className={`w-48 h-12 text-lg font-bold transition-all duration-300 transform hover:scale-105 ${isClockedIn ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'}`}
              >
                {(isClockingIn || isClockingOut) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    isClockedIn ? <LogOut className="mr-2"/> : <LogIn className="mr-2" />
                )}
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
                <CardHeader><CardTitle>Total Hours</CardTitle><CardDescription>All hours this week</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-bold">{totalHours.toFixed(2)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Regular Hours</CardTitle><CardDescription>Up to 40 hours</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-bold">{regularHours.toFixed(2)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Overtime Hours</CardTitle><CardDescription>Hours over 40</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-bold text-accent">{overtimeHours.toFixed(2)}</p></CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader><CardTitle>Time Log</CardTitle><CardDescription>Detailed log of your time entries for this week.</CardDescription></CardHeader>
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
                      {isLoadingEntries ? (
                         <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
                      ) : weeklyEntries && weeklyEntries.length > 0 ? (
                        weeklyEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{format(new Date(entry.clockIn), 'EEE, MMM d')}</TableCell>
                            <TableCell>{format(new Date(entry.clockIn), 'p')}</TableCell>
                            <TableCell>{entry.clockOut ? format(new Date(entry.clockOut), 'p') : (isClockedIn && index === weeklyEntries.length-1 ? 'In Progress...' : '-')}</TableCell>
                            <TableCell className="text-right">{calculateDuration(entry.clockIn, entry.clockOut).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No time entries for this week.</TableCell></TableRow>
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
        @media print { body { background-color: white !important; } .printable-area { max-width: 100%; margin: 0; padding: 0; } .print\\:hidden { display: none !important; } main, .timesheet, .card { color: black !important; background-color: white !important; border: 1px solid #ddd !important; box-shadow: none !important; } .card-title, .card-description, p, th, td, h1, h2 { color: black !important; } .text-muted-foreground { color: #555 !important; } .text-accent { color: #16a085 !important; } .text-primary { color: #2980b9 !important; } }
      `}</style>
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
      <EmployeeDashboardContent />
    </Suspense>
  )
}
