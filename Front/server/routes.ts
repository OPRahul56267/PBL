import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSOSEmergencySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // SOS Emergency endpoints
  app.post('/api/sos/create', async (req, res) => {
    try {
      const emergencyData = insertSOSEmergencySchema.parse(req.body);
      const emergency = await storage.createSOSEmergency(emergencyData);
      
      // Log the emergency creation
      console.log('🚨 SOS Emergency Created:', {
        id: emergency.id,
        userPhone: emergency.userPhone,
        location: emergency.location,
        timestamp: emergency.createdAt
      });

      // In a real implementation, this would:
      // 1. Send SMS to emergency contacts
      // 2. Log to government emergency systems
      // 3. Alert nearby registered safety personnel
      
      res.json({ 
        success: true, 
        emergencyId: emergency.id,
        message: 'Emergency alert created successfully'
      });
    } catch (error) {
      console.error('Error creating SOS emergency:', error);
      res.status(400).json({ error: 'Failed to create emergency alert' });
    }
  });

  app.post('/api/sos/:id/escalate', async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = await storage.updateSOSEmergencyStatus(id, 'escalated');
      
      if (!emergency) {
        return res.status(404).json({ error: 'Emergency not found' });
      }

      // Log escalation
      console.log('🚨🚨 SOS ESCALATED to ERSS-112:', {
        id: emergency.id,
        userPhone: emergency.userPhone,
        location: emergency.location,
        escalatedAt: emergency.escalatedAt
      });

      // In a real implementation, this would:
      // 1. Connect to ERSS-112 system
      // 2. Initiate emergency call
      // 3. Share location with authorities
      // 4. Send automated distress signals

      res.json({ 
        success: true, 
        message: 'Emergency escalated to ERSS-112 system',
        emergency112Number: '112',
        touristHelpline: '1363'
      });
    } catch (error) {
      console.error('Error escalating emergency:', error);
      res.status(500).json({ error: 'Failed to escalate emergency' });
    }
  });

  app.get('/api/sos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = await storage.getSOSEmergency(id);
      
      if (!emergency) {
        return res.status(404).json({ error: 'Emergency not found' });
      }

      res.json(emergency);
    } catch (error) {
      console.error('Error fetching emergency:', error);
      res.status(500).json({ error: 'Failed to fetch emergency' });
    }
  });

  app.get('/api/sos/active', async (req, res) => {
    try {
      const activeEmergencies = await storage.getActiveSOSEmergencies();
      res.json({ emergencies: activeEmergencies });
    } catch (error) {
      console.error('Error fetching active emergencies:', error);
      res.status(500).json({ error: 'Failed to fetch active emergencies' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
