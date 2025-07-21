
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

// Mock data, to be replaced with real data later
const employees = [
    { id: 'emp1', name: 'John Doe', status: 'Clocked Out', totalHours: 40.5 },
    { id: 'emp2', name: 'Jane Smith', status: 'Clocked In', totalHours: 38.0 },
    { id: 'emp3', name: 'Peter Jones', status: 'Clocked Out', totalHours: 42.25 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </header>

        <main>
          <Card>
            <CardHeader>
              <CardTitle>Employee Time Summary</CardTitle>
              <CardDescription>Overview of employee hours for the current week.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Hours (Week)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'Clocked In' ? 'bg-accent/20 text-accent' : 'bg-muted'}`}>
                          {employee.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{employee.totalHours.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
