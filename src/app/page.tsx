

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// In a real app, this would come from a database
const users = [
  { id: 'admin', name: 'Admin User', role: 'admin', pin: '1234' },
  { id: 'emp1', name: 'John Doe', role: 'employee', pin: '1111' },
  { id: 'emp2', name: 'Jane Smith', role: 'employee', pin: '2222' },
  { id: 'emp3', name: 'Peter Jones', role: 'employee', pin: '3333' },
];

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!selectedUserId) return;
    
    const user = users.find(u => u.id === selectedUserId);
    if (user && user.pin === pin) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(`/employee`);
      }
    } else {
      toast({
        title: "Login Failed",
        description: "The PIN you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Delaware Fence Solutions</CardTitle>
          <CardDescription>Time Clock Login</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="user-select">Select User</Label>
            <Select onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUserId && (
             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                placeholder="Enter your 4-digit PIN"
                onKeyDown={handleKeyPress}
              />
            </div>
          )}

          <Button onClick={handleLogin} disabled={!selectedUserId || pin.length !== 4} className="w-full h-11 text-lg">
            <LogIn className="mr-2" />
            Login
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or try our AI demo
              </span>
            </div>
          </div>

          <Button variant="outline" asChild>
              <Link href="/ai-demo">
                <BrainCircuit className="mr-2" />
                AI Demo
              </Link>
          </Button>
          
        </CardContent>
      </Card>
       <footer className="text-center text-muted-foreground mt-8 text-sm">
          <p>DFS Time Tracker | © {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
}
