
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    addDoc, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Types
export interface Employee {
    employeeId: string;
    name: string;
    role: 'Yard' | 'Sales' | 'Management' | 'Admin';
    pin: string;
    timeEntries?: TimeEntry[];
}

export interface TimeEntry {
    timeEntryId: string;
    employeeId: string;
    clockIn: Timestamp;
    clockOut: Timestamp | null;
}

// One-time function to ensure admin user exists
export const ensureAdminExists = async (): Promise<boolean> => {
    const adminName = "Jon Audiffred";
    const adminPin = "2895";
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where("name", "==", adminName), where("role", "==", "Admin"), limit(1));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log("Admin user not found, creating one...");
        try {
            await addDoc(employeesRef, {
                name: adminName,
                pin: adminPin,
                role: 'Admin'
            });
            console.log("Admin user 'Jon Audiffred' created successfully.");
            return true; // Indicates that the user was created
        } catch (error) {
            console.error("Error creating admin user:", error);
            return false;
        }
    }
    return false; // Indicates that the user already existed
};

// Functions for Login Page
export const listUsers = async (): Promise<Employee[]> => {
    const employeesCol = collection(db, 'employees');
    const employeeSnapshot = await getDocs(employeesCol);
    const employeeList = employeeSnapshot.docs.map(doc => ({ employeeId: doc.id, ...doc.data() } as Employee));
    return employeeList;
};

// Functions for Admin Page
export const listEmployeesWithStatus = async (): Promise<Employee[]> => {
    const employeesCol = collection(db, 'employees');
    const employeeSnapshot = await getDocs(employeesCol);
    const employees = employeeSnapshot.docs.map(doc => ({ employeeId: doc.id, ...doc.data() } as Employee));

    for (const employee of employees) {
        const timeEntriesCol = collection(db, `employees/${employee.employeeId}/timeEntries`);
        const q = query(timeEntriesCol, orderBy('clockIn', 'desc'), limit(1));
        const timeEntrySnapshot = await getDocs(q);
        employee.timeEntries = timeEntrySnapshot.docs.map(doc => ({ timeEntryId: doc.id, ...doc.data() } as TimeEntry));
    }
    return employees;
};

export const createEmployee = async (employeeData: Omit<Employee, 'employeeId'>): Promise<void> => {
    const employeesCol = collection(db, 'employees');
    await addDoc(employeesCol, employeeData);
};


// Functions for Employee Page
export const getEmployeeDetails = async (employeeId: string): Promise<Employee | null> => {
    const employeeRef = doc(db, 'employees', employeeId);
    const employeeSnap = await getDoc(employeeRef);
    if (employeeSnap.exists()) {
        return { employeeId: employeeSnap.id, ...employeeSnap.data() } as Employee;
    }
    return null;
};

export const listTimeEntriesForEmployee = async ({ employeeId, startTime, endTime }: { employeeId: string, startTime: Date, endTime: Date }): Promise<TimeEntry[]> => {
    const timeEntriesCol = collection(db, `employees/${employeeId}/timeEntries`);
    const q = query(timeEntriesCol, where('clockIn', '>=', startTime), where('clockIn', '<=', endTime), orderBy('clockIn', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ timeEntryId: doc.id, ...doc.data() } as TimeEntry));
};

export const getLatestTimeEntry = async (employeeId: string): Promise<TimeEntry | null> => {
    const timeEntriesCol = collection(db, `employees/${employeeId}/timeEntries`);
    const q = query(timeEntriesCol, orderBy('clockIn', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const docData = snapshot.docs[0];
    return { timeEntryId: docData.id, ...docData.data() } as TimeEntry;
}

export const clockIn = async ({ employeeId }: { employeeId: string }): Promise<void> => {
    const timeEntriesCol = collection(db, `employees/${employeeId}/timeEntries`);
    await addDoc(timeEntriesCol, {
        clockIn: serverTimestamp(),
        clockOut: null,
        employeeId: employeeId
    });
};

export const clockOut = async ({ employeeId, timeEntryId }: { employeeId: string, timeEntryId: string }): Promise<void> => {
    if (!employeeId || !timeEntryId) {
        throw new Error("Employee ID and Time Entry ID are required to clock out.");
    }
    const timeEntryRef = doc(db, `employees/${employeeId}/timeEntries`, timeEntryId);
    const timeEntrySnap = await getDoc(timeEntryRef);

    if (timeEntrySnap.exists()) {
        await updateDoc(timeEntryRef, {
            clockOut: serverTimestamp()
        });
    } else {
        throw new Error("Time entry not found to clock out.");
    }
};
