
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Employee = {
  id: string;
  name: string;
  role: 'Yard' | 'Sales' | 'Management' | 'Admin';
  status: 'Clocked In' | 'Clocked Out';
  totalHours: number;
};

// Mock data, to be replaced with real data later
const initialEmployees: Employee[] = [
    { id: 'emp1', name: 'John Doe', role: 'Yard', status: 'Clocked Out', totalHours: 40.5 },
    { id: 'emp2', name: 'Jane Smith', role: 'Sales', status: 'Clocked In', totalHours: 38.0 },
    { id: 'emp3', name: 'Peter Jones', role: 'Management', status: 'Clocked Out', totalHours: 42.25 },
];

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeRole, setNewEmployeeRole] = useState<'Yard' | 'Sales' | 'Management'>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddEmployee = () => {
    if (newEmployeeName && newEmployeeRole) {
      const newEmployee: Employee = {
        id: `emp${employees.length + 2}`, // simple id generation
        name: newEmployeeName,
        role: newEmployeeRole,
        status: 'Clocked Out',
        totalHours: 0,
      };
      setEmployees([...employees, newEmployee]);
      // Reset form
      setNewEmployeeName("");
      setNewEmployeeRole(undefined);
      setIsDialogOpen(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the details for the new employee.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                   <Select onValueChange={(value: any) => setNewEmployeeRole(value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yard">Yard</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                <Button onClick={handleAddEmployee} disabled={!newEmployeeName || !newEmployeeRole}>
                  Save Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Hours (Week)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
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
