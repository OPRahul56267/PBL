import { type User, type InsertUser, type SOSEmergency, type InsertSOSEmergency } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // SOS Emergency methods
  createSOSEmergency(emergency: InsertSOSEmergency): Promise<SOSEmergency>;
  getSOSEmergency(id: string): Promise<SOSEmergency | undefined>;
  updateSOSEmergencyStatus(id: string, status: 'active' | 'escalated' | 'resolved'): Promise<SOSEmergency | undefined>;
  getActiveSOSEmergencies(): Promise<SOSEmergency[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sosEmergencies: Map<string, SOSEmergency>;

  constructor() {
    this.users = new Map();
    this.sosEmergencies = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // SOS Emergency methods
  async createSOSEmergency(insertEmergency: InsertSOSEmergency): Promise<SOSEmergency> {
    const id = randomUUID();
    const emergency: SOSEmergency = {
      id,
      userId: insertEmergency.userId || null,
      userPhone: insertEmergency.userPhone || null,
      location: insertEmergency.location || null,
      description: insertEmergency.description || null,
      status: (insertEmergency.status as 'active' | 'escalated' | 'resolved') || 'active',
      emergencyContacts: insertEmergency.emergencyContacts ? [...insertEmergency.emergencyContacts] : null,
      audioRecordingUrl: insertEmergency.audioRecordingUrl || null,
      photoUrls: insertEmergency.photoUrls ? [...insertEmergency.photoUrls] : null,
      createdAt: new Date(),
      escalatedAt: null,
      resolvedAt: null,
    };
    this.sosEmergencies.set(id, emergency);
    return emergency;
  }

  async getSOSEmergency(id: string): Promise<SOSEmergency | undefined> {
    return this.sosEmergencies.get(id);
  }

  async updateSOSEmergencyStatus(id: string, status: 'active' | 'escalated' | 'resolved'): Promise<SOSEmergency | undefined> {
    const emergency = this.sosEmergencies.get(id);
    if (!emergency) return undefined;

    const updatedEmergency: SOSEmergency = {
      ...emergency,
      status,
      escalatedAt: status === 'escalated' ? new Date() : emergency.escalatedAt,
      resolvedAt: status === 'resolved' ? new Date() : emergency.resolvedAt,
    };
    
    this.sosEmergencies.set(id, updatedEmergency);
    return updatedEmergency;
  }

  async getActiveSOSEmergencies(): Promise<SOSEmergency[]> {
    return Array.from(this.sosEmergencies.values()).filter(
      emergency => emergency.status === 'active'
    );
  }
}

export const storage = new MemStorage();
