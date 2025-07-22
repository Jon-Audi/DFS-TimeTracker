
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
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
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { dataConnect } from "@/lib/dataconnect";
// import { mutations, queries } from "@firebasegen/default-connector/react";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, endOfWeek, differenceInSeconds } from 'date-fns';

type EmployeeRole = 'Yard' | 'Sales' | 'Management' | 'Admin';


export default function AdminDashboard() {
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeRole, setNewEmployeeRole] = useState<EmployeeRole>();
  const [newEmployeePin, setNewEmployeePin] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  // const { data: employees, isLoading: isLoadingEmployees } = useQuery({
  //   ...queries.listEmployeesWithStatus.getOptions(),
  //   queryFn: () => queries.listEmployeesWithStatus(dataConnect)
  // });
  const employees: any[] = [];
  const isLoadingEmployees = false;


  // const { mutate: addEmployee, isPending: isAddingEmployee } = useMutation({
  //   mutationFn: (vars: typeof mutations.createEmployee.input) => mutations.createEmployee(dataConnect, vars),
  //   onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: queries.listEmployeesWithStatus.getOptions().queryKey });
  //       toast({
  //           title: "Success",
  //           description: "New employee has been added.",
  //       });
  //       setNewEmployeeName("");
  //       setNewEmployeeRole(undefined);
  //       setNewEmployeePin("");
  //       setIsDialogOpen(false);
  //   },
  //   onError: (error) => {
  //        toast({
  //           title: "Error",
  //           description: error.message,
  //           variant: "destructive",
  //       });
  //   }
  // });
  const isAddingEmployee = false;

  const handleAddEmployee = () => {
    if (newEmployeeName && newEmployeeRole && newEmployeePin.match(/^\d{4}$/)) {
        // addEmployee({
        //     name: newEmployeeName,
        //     role: newEmployeeRole,
        //     pin: newEmployeePin,
        // });
         toast({
            title: "Coming Soon!",
            description: "Adding employees will be enabled soon.",
        });
    }
  };
  
  const calculateWeeklyHours = (timeEntries: readonly { clockIn: any, clockOut: any }[] | null | undefined) => {
    if (!timeEntries) return 0;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    const weeklyEntries = timeEntries.filter(entry => {
        const clockInDate = new Date(entry.clockIn);
        return clockInDate >= weekStart && clockInDate <= weekEnd;
    });

    return weeklyEntries.reduce((total, entry) => {
        if (entry.clockOut) {
            const clockInDate = new Date(entry.clockIn);
            const clockOutDate = new Date(entry.clockOut);
            return total + differenceInSeconds(clockOutDate, clockInDate);
        }
        return total;
    }, 0) / 3600;
  };

  const getStatus = (timeEntries: readonly { clockIn: any, clockOut: any }[] | null | undefined) => {
    if (!timeEntries || timeEntries.length === 0) return 'Clocked Out';
    const latestEntry = timeEntries[0];
    return latestEntry.clockOut ? 'Clocked Out' : 'Clocked In';
  }


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
                   <Select onValueChange={(value: EmployeeRole) => setNewEmployeeRole(value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yard">Yard</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pin" className="text-right">
                    PIN
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={4}
                    value={newEmployeePin}
                    onChange={(e) => setNewEmployeePin(e.target.value)}
                    className="col-span-3"
                    placeholder="4-digit PIN"
                  />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                <Button onClick={handleAddEmployee} disabled={isAddingEmployee || !newEmployeeName || !newEmployeeRole || !newEmployeePin.match(/^\d{4}$/)}>
                  {isAddingEmployee && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                  {isLoadingEmployees ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                    </TableRow>
                  ) : employees && employees.length > 0 ? (
                    employees.map((employee) => {
                      const status = getStatus(employee.timeEntries);
                      const totalHours = calculateWeeklyHours(employee.timeEntries);
                      return (
                        <TableRow key={employee.employeeId}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'Clocked In' ? 'bg-accent/20 text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{totalHours.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No employees found. Add one to get started.
                        </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
